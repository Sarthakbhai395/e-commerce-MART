import React, { createContext, useState, useContext, useEffect } from 'react'
import { userAPI } from '../services/api'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const { addNotification, addModalNotification } = useNotification()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load wishlist from backend on initial load
  useEffect(() => {
    loadWishlistFromBackend()
  }, [])

  // Load wishlist from backend when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlistFromBackend()
    }
  }, [isAuthenticated])

  const loadWishlistFromBackend = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.getWishlist(token)
        if (response.success) {
          setWishlistItems(response.data)
        }
      } else {
        // Clear wishlist if user is not authenticated
        setWishlistItems([])
      }
    } catch (error) {
      console.error('Failed to load wishlist from backend:', error)
      // Clear wishlist on error
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      addModalNotification('Login Required', 'Please login to add items to your wishlist', 'warning')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return
    }
    
    // Prevent admins and sellers from adding to wishlist
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      addModalNotification('Access Denied', 'Only users can add products to wishlist. Admins and sellers cannot purchase products.', 'error')
      throw new Error('Admins and sellers cannot add products to wishlist')
    }
    
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        // Add to backend wishlist
        const response = await userAPI.addToWishlist(product._id || product.id, token)
        if (response.success) {
          setWishlistItems(response.data)
          addModalNotification('Success', 'Item added to wishlist successfully!', 'success')
          return response.data
        } else {
          throw new Error(response.error || 'Failed to add product to wishlist')
        }
      } else {
        // Local storage fallback
        setWishlistItems(prevItems => {
          // Use _id if available, otherwise use id
          const productId = product._id || product.id
          const existingItem = prevItems.find(item => (item._id || item.id) === productId)
          if (!existingItem) {
            return [...prevItems, product]
          }
          return prevItems
        })
        addModalNotification('Success', 'Item added to wishlist successfully!', 'success')
        return Promise.resolve()
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      addModalNotification('Error', error.message || 'Failed to add product to wishlist', 'error')
      // Fallback to local state if backend fails
      setWishlistItems(prevItems => {
        // Use _id if available, otherwise use id
        const productId = product._id || product.id
        const existingItem = prevItems.find(item => (item._id || item.id) === productId)
        if (!existingItem) {
          return [...prevItems, product]
        }
        return prevItems
      })
      throw error
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        // Remove from backend wishlist
        const response = await userAPI.removeFromWishlist(productId, token)
        if (response.success) {
          setWishlistItems(response.data)
          addModalNotification('Success', 'Item removed from wishlist successfully!', 'success')
        }
      } else {
        // Local storage fallback
        setWishlistItems(prevItems => prevItems.filter(item => (item._id || item.id) !== productId))
        addModalNotification('Success', 'Item removed from wishlist successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      addModalNotification('Error', 'Failed to remove item from wishlist', 'error')
      // Fallback to local state if backend fails
      setWishlistItems(prevItems => prevItems.filter(item => (item._id || item.id) !== productId))
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item._id || item.id) === productId)
  }

  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        // Clear backend wishlist
        const response = await userAPI.clearWishlist(token)
        if (response.success) {
          setWishlistItems(response.data)
        }
      } else {
        // Local storage fallback
        setWishlistItems([])
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
      // Fallback to local state if backend fails
      setWishlistItems([])
    }
  }

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loading
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  return useContext(WishlistContext)
}