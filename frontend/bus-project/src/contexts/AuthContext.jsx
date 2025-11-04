import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('AuthProvider mounting - token:', token, 'userData:', userData); // Debug log
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function - FIXED
  const login = async (email, password) => {
    console.log('AuthContext login called with:', { email, password }); // Debug log
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Demo authentication - accept any non-empty credentials
      if (email && password) {
        const userData = {
          id: 1,
          name: email.split('@')[0] || 'User',
          email: email
        };
        const token = "demo-token-" + Date.now();
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        console.log('Login successful, user set:', userData); // Debug log
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Please enter both email and password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  // Register function - FIXED
  const register = async (userData) => {
    console.log('AuthContext register called with:', userData); // Debug log
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (userData.email && userData.password && userData.name) {
        const newUser = {
          id: Date.now(),
          name: userData.name,
          email: userData.email
        };
        const token = "demo-token-" + Date.now();
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        
        console.log('Registration successful, user set:', newUser); // Debug log
        return { success: true, user: newUser };
      } else {
        return { success: false, error: 'Please fill all fields' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  // Logout function - FIXED
  const logout = () => {
    console.log('AuthContext logout called'); // Debug log
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Use window.location for reliable redirect
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;