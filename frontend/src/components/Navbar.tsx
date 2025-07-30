import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, MapPin, Heart, Clock, Upload, LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐱</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Bodega Cat Finder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="nav-link flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Search</span>
            </Link>
            
            {user ? (
              <>
                <Link to="/saved" className="nav-link flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>Saved</span>
                </Link>
                <Link to="/recently-viewed" className="nav-link flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Recent</span>
                </Link>
                <Link to="/upload" className="nav-link flex items-center space-x-1">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200">
                    <User className="w-4 h-4" />
                    <span>{user.username}</span>
                  </button>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/search"
                className="nav-link flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="w-4 h-4" />
                <span>Search</span>
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/saved"
                    className="nav-link flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    <span>Saved</span>
                  </Link>
                  <Link
                    to="/recently-viewed"
                    className="nav-link flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Recently Viewed</span>
                  </Link>
                  <Link
                    to="/upload"
                    className="nav-link flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </Link>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-2 text-gray-600 mb-4">
                      <User className="w-4 h-4" />
                      <span>{user.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 