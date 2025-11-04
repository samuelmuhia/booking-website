use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Bus {
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub bus_number: String,
    pub bus_type: String,
    pub total_seats: i32,
    pub route: Route,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Route {
    pub from: String,
    pub to: String,
    pub departure_time: String,
    pub arrival_time: String,
    pub price: f64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Seat {
    pub seat_number: String,
    pub is_available: bool,
}

#[derive(Serialize, Deserialize)]
pub struct SeatAvailabilityResponse {
    pub travel_date: String,
    pub seats: Vec<Seat>,
}

#[derive(Deserialize)]
pub struct SeatDateQuery {
    pub date: String,
}