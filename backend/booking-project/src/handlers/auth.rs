use actix_web::{web, HttpResponse, Error};
use crate::db::MongoDB;

pub async fn register(
    db: web::Data<MongoDB>,
    user: web::Json<crate::models::RegisterRequest>,
) -> Result<HttpResponse, Error> {
    match db.create_user(&user).await {
        Ok(auth_response) => Ok(HttpResponse::Ok().json(auth_response)),
        Err(e) => Ok(HttpResponse::BadRequest().body(e.to_string())),
    }
}

pub async fn login(
    db: web::Data<MongoDB>,
    credentials: web::Json<crate::models::LoginRequest>,
) -> Result<HttpResponse, Error> {
    match db.authenticate_user(&credentials).await {
        Ok(auth_response) => Ok(HttpResponse::Ok().json(auth_response)),
        Err(e) => Ok(HttpResponse::Unauthorized().body(e.to_string())),
    }
}