import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    // Set base URL for API calls - use environment variable or fallback to localhost
    const apiUrl = process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:5001' : null);
    
    if (apiUrl) {
      axios.defaults.baseURL = apiUrl;
      console.log('Axios base URL set to:', axios.defaults.baseURL);
    } else {
      console.warn('No API URL configured. Set REACT_APP_API_URL environment variable for production.');
      // Don't set a default URL that doesn't exist
    }
    
    // Add cache-busting headers
    axios.defaults.headers.common['Cache-Control'] = 'no-cache';
    axios.defaults.headers.common['Pragma'] = 'no-cache';
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Only try to check auth if we have a backend URL
          if (axios.defaults.baseURL) {
            const response = await axios.get('/api/auth/profile');
            setUser(response.data.user);
          } else {
            // No backend available, just clear the token
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.warn('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    // Add a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 second timeout

    checkAuth().finally(() => {
      clearTimeout(timeoutId);
    });
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password,
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 