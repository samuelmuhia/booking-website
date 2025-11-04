use mongodb::{
    bson::{self, doc, Document},
    options::FindOptions,
    Client, Collection, Cursor,
};

// Import the models we need
use crate::models::{User, UserResponse, Claims, AuthResponse, RegisterRequest, LoginRequest, Bus, Seat};

#[derive(Clone)]
pub struct MongoDB {
    client: Client,
    db_name: String,
}

impl MongoDB {
    pub async fn new(uri: &str, db_name: &str) -> Result<Self, mongodb::error::Error> {
        let client_options = mongodb::options::ClientOptions::parse(uri).await?;
        let client = Client::with_options(client_options)?;
        Ok(MongoDB {
            client,
            db_name: db_name.to_string(),
        })
    }

    fn get_users_collection(&self) -> Collection<Document> {
        self.client.database(&self.db_name).collection("users")
    }

    fn get_buses_collection(&self) -> Collection<Bus> {
        self.client.database(&self.db_name).collection("buses")
    }

    fn get_seat_availability_collection(&self) -> Collection<Document> {
        self.client.database(&self.db_name).collection("seat_availability")
    }

    pub fn string_to_id(&self, id: &str) -> Result<bson::oid::ObjectId, mongodb::error::Error> {
        bson::oid::ObjectId::parse_str(id).map_err(|e| {
            mongodb::error::Error::from(std::io::Error::new(
                std::io::ErrorKind::InvalidInput,
                e.to_string(),
            ))
        })
    }

    pub async fn create_user(&self, user: &RegisterRequest) -> Result<AuthResponse, Box<dyn std::error::Error>> {
        let collection = self.get_users_collection();
        
        // Check if user already exists
        let existing_user = collection.find_one(doc! { "email": &user.email }, None).await?;
        if existing_user.is_some() {
            return Err("User already exists".into());
        }

        let hashed_password = bcrypt::hash(&user.password, bcrypt::DEFAULT_COST)?;
        
        let user_doc = doc! {
            "username": &user.username,
            "email": &user.email,
            "password": &hashed_password,
            "role": "user",
            "created_at": bson::DateTime::now(),
            "updated_at": bson::DateTime::now(),
        };

        let result = collection.insert_one(user_doc, None).await?;
        let user_id = result.inserted_id.as_object_id().unwrap();

        // Generate JWT token
        let expiration = chrono::Utc::now() + chrono::Duration::hours(24);
        let claims = Claims {
            sub: user_id.to_hex(),
            role: "user".to_string(),
            exp: expiration.timestamp() as usize,
        };

        let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());
        let token = jsonwebtoken::encode(&jsonwebtoken::Header::default(), &claims, &jsonwebtoken::EncodingKey::from_secret(secret.as_ref()))?;

        let user_response = UserResponse {
            id: user_id.to_hex(),
            username: user.username.clone(),
            email: user.email.clone(),
            role: "user".to_string(),
        };

        Ok(AuthResponse {
            token,
            user: user_response,
        })
    }

    pub async fn authenticate_user(&self, credentials: &LoginRequest) -> Result<AuthResponse, Box<dyn std::error::Error>> {
        let collection = self.get_users_collection();
        
        let user_doc = collection.find_one(doc! { "email": &credentials.email }, None).await?
            .ok_or("Invalid credentials")?;

        let user = bson::from_document::<User>(user_doc)?;

        if bcrypt::verify(&credentials.password, &user.password)? {
            let user_id = user.id.ok_or("User ID not found")?;
            
            let expiration = chrono::Utc::now() + chrono::Duration::hours(24);
            let claims = Claims {
                sub: user_id.to_hex(),
                role: user.role.clone(),
                exp: expiration.timestamp() as usize,
            };

            let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());
            let token = jsonwebtoken::encode(&jsonwebtoken::Header::default(), &claims, &jsonwebtoken::EncodingKey::from_secret(secret.as_ref()))?;

            let user_response = UserResponse {
                id: user_id.to_hex(),
                username: user.username,
                email: user.email,
                role: user.role,
            };

            Ok(AuthResponse {
                token,
                user: user_response,
            })
        } else {
            Err("Invalid credentials".into())
        }
    }

    pub async fn get_buses(&self) -> Result<Cursor<Bus>, mongodb::error::Error> {
        let collection = self.get_buses_collection();
        let find_options = FindOptions::builder().build();
        collection.find(None, find_options).await
    }

    pub async fn get_bus(&self, id: &str) -> Result<Option<Bus>, mongodb::error::Error> {
        let collection = self.get_buses_collection();
        let object_id = self.string_to_id(id)?;
        collection.find_one(doc! { "_id": object_id }, None).await
    }

    pub async fn get_bus_seats(&self, bus_id: &str, date: &str) -> Result<Vec<Seat>, mongodb::error::Error> {
        let collection = self.get_seat_availability_collection();
        let object_id = self.string_to_id(bus_id)?;
        
        let doc = collection.find_one(
            doc! { "bus_id": object_id, "travel_date": date },
            None
        ).await?;

        if let Some(doc) = doc {
            if let Ok(seats) = doc.get_array("seats") {
                let seats: Vec<Seat> = seats.iter().filter_map(|s| {
                    if let Some(seat_doc) = s.as_document() {
                        Some(Seat {
                            seat_number: seat_doc.get_str("seat_number").unwrap_or("").to_string(),
                            is_available: seat_doc.get_bool("is_available").unwrap_or(false),
                        })
                    } else {
                        None
                    }
                }).collect();
                return Ok(seats);
            }
        }

        // If no specific availability found, return all seats as available
        let bus = self.get_bus(bus_id).await?;
        if let Some(bus) = bus {
            let seats: Vec<Seat> = (1..=bus.total_seats)
                .map(|i| Seat {
                    seat_number: i.to_string(),
                    is_available: true,
                })
                .collect();
            Ok(seats)
        } else {
            Ok(vec![])
        }
    }
}