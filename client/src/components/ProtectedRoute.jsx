import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Check if we have user data in localStorage
    const savedUser = localStorage.getItem('user')
    const savedAuthState = localStorage.getItem('isAuthenticated')
    
    if (savedUser && savedAuthState === 'true') {
      // User data exists but context hasn't loaded yet, don't redirect
      return <div>Loading...</div>
    }
    
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location, message: 'Please log in to access this page' }} replace />
  }

  // If user role is not in allowed roles, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Show a message to the user about unauthorized access
    const message = `You don't have permission to access this page. You are logged in as ${user.role}.`
    
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" state={{ message }} replace />
      case 'seller':
        return <Navigate to="/seller/dashboard" state={{ message }} replace />
      default:
        return <Navigate to="/user/dashboard" state={{ message }} replace />
    }
  }

  return children
}

export default ProtectedRoute