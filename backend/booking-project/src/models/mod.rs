pub mod user;
pub mod auth;
pub mod bus;
pub mod booking;

// Re-export all the models that are used in other modules
pub use user::{User, UserResponse, Claims};
pub use auth::{AuthResponse, RegisterRequest, LoginRequest};
pub use bus::{Bus, Seat, SeatAvailabilityResponse, SeatDateQuery};
pub use booking::Booking;