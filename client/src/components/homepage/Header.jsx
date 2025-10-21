import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();

  const handleLogout = () => {
    logout();
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'seller':
        return '/seller/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'seller':
        return 'Seller Dashboard';
      default:
        return 'My Account';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="mr-4">Welcome to Akario Mart</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="hover:text-blue-300 transition-colors">
                  {getDashboardLabel()}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hover:text-blue-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-300 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-300 transition-colors">
                  Register
                </Link>
              </>
            )}
            <Link to="/contact" className="hover:text-blue-300 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};