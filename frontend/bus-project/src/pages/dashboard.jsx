import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBuses, setFilteredBuses] = useState([]);

  // Mock bus data
  const mockBuses = [
    { id: 1, name: "Brighter Days", destination: "Nairobi", price: 500, departure: "08:00 AM", seats: 45, type: "Standard", from: "Nairobi", to: "Mombasa", date: "2024-01-15" },
    { id: 2, name: "Blicky", destination: "Mombasa", price: 1200, departure: "10:30 AM", seats: 32, type: "Luxury", from: "Nairobi", to: "Mombasa", date: "2024-01-15" },
    { id: 3, name: "Zootopia", destination: "Nakuru", price: 400, departure: "07:15 AM", seats: 52, type: "Standard", from: "Nairobi", to: "Nakuru", date: "2024-01-15" },
    { id: 4, name: "Kasongo Must go  ", destination: "Mombasa", price: 1100, departure: "09:45 AM", seats: 40, type: "Semi-Luxury", from: "Nairobi", to: "Mombasa", date: "2024-01-15" },
    { id: 5, name: "Nilambishe Glossi", destination: "Eldoret", price: 700, departure: "11:00 AM", seats: 38, type: "Standard", from: "Nairobi", to: "Eldoret", date: "2024-01-15" },
    { id: 6, name: "BatMobile", destination: "Kisumu", price: 850, departure: "06:30 AM", seats: 44, type: "Semi-Luxury", from: "Nairobi", to: "Kisumu", date: "2024-01-15" }
  ];

  useEffect(() => {
    setBuses(mockBuses);
    setFilteredBuses(mockBuses);
  }, []);

  useEffect(() => {
    const filtered = buses.filter(bus =>
      bus.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBuses(filtered);
  }, [searchTerm, buses]);

  const handleBookTicket = (bus) => {
    console.log('Book ticket clicked for bus:', bus); // Debug log
    
    if (!user) {
      alert('Please login to book tickets');
      navigate('/login');
      return;
    }

    // Navigate to bus seats page with bus information
    navigate('/bus-seats', { 
      state: { 
        bus: bus,
        searchParams: {
          from: bus.from,
          to: bus.to,
          date: bus.date,
          passengers: 1
        }
      }
    });
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Burudani Mint Travels</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email || 'User'}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by destination or bus name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">Search</button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Available Buses</h3>
            <p className="stat-number">{buses.length}</p>
          </div>
          <div className="stat-card">
            <h3>Destinations</h3>
            <p className="stat-number">{[...new Set(buses.map(bus => bus.destination))].length}</p>
          </div>
          <div className="stat-card">
            <h3>Lowest Price</h3>
            <p className="stat-number">KSh {buses.length > 0 ? Math.min(...buses.map(bus => bus.price)) : 0}</p>
          </div>
          <div className="stat-card">
            <h3>Highest Price</h3>
            <p className="stat-number">KSh {buses.length > 0 ? Math.max(...buses.map(bus => bus.price)) : 0}</p>
          </div>
        </div>
      </section>

      {/* Buses List Section */}
      <section className="buses-section">
        <h2>Available Buses</h2>
        <div className="buses-grid">
          {filteredBuses.map(bus => (
            <div key={bus.id} className="bus-card">
              <div className="bus-header">
                <h3>{bus.name}</h3>
                <span className="bus-type">{bus.type}</span>
              </div>
              <div className="bus-details">
                <div className="detail-item">
                  <span className="label">From:</span>
                  <span className="value">{bus.from}</span>
                </div>
                <div className="detail-item">
                  <span className="label">To:</span>
                  <span className="value">{bus.to}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Departure:</span>
                  <span className="value">{bus.departure}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Seats:</span>
                  <span className="value">{bus.seats} available</span>
                </div>
                <div className="detail-item price">
                  <span className="label">Price:</span>
                  <span className="value">KSh {bus.price}</span>
                </div>
              </div>
              <button 
                onClick={() => handleBookTicket(bus)}
                className="book-btn"
              >
                Book Ticket
              </button>
            </div>
          ))}
        </div>
        {filteredBuses.length === 0 && (
          <div className="no-buses">
            <p>No buses found matching your search.</p>
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <p>&copy; 2025 Burudani Mint Travels. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;