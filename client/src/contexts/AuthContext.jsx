import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load auth state from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAuthState = localStorage.getItem('isAuthenticated')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedAuthState === 'true' && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Error parsing saved user data:', e)
        // Clear invalid data
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setIsAuthenticated(true)
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    // Remove from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('token')
  }

  // Function to check if user is authenticated
  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem('user')
    const savedAuthState = localStorage.getItem('isAuthenticated')
    const savedToken = localStorage.getItem('token')
    
    return savedUser && savedAuthState === 'true' && savedToken
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}