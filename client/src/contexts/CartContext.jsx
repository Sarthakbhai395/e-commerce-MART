import React, { createContext, useState, useContext, useEffect } from 'react'
import { userAPI } from '../services/api'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const { addNotification, addModalNotification } = useNotification()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from backend on initial load
  useEffect(() => {
    loadCartFromBackend()
  }, [])

  // Load cart from backend when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromBackend()
    }
  }, [isAuthenticated])

  const loadCartFromBackend = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.getCart(token)
        if (response.success) {
          setCartItems(response.data)
        }
      } else {
        // Clear cart if user is not authenticated
        setCartItems([])
      }
    } catch (error) {
      console.error('Failed to load cart from backend:', error)
      // Clear cart on error
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const isInCart = (productId) => {
    return cartItems.some(item => {
      // Handle both backend format (item.product) and local format (item directly)
      const itemProductId = item.product ? (item.product._id || item.product.id) : (item._id || item.id)
      return itemProductId === productId
    })
  }

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => {
      // Handle both backend format (item.product) and local format (item directly)
      const itemProductId = item.product ? (item.product._id || item.product.id) : (item._id || item.id)
      return itemProductId === productId
    })
    return item ? item.quantity || 1 : 0
  }

  const addToCart = async (product, quantity = 1) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      addModalNotification('Login Required', 'Please login to add items to your cart', 'warning')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return
    }
    
    // Prevent admins and sellers from adding to cart
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      addModalNotification('Access Denied', 'Sellers and admins cannot purchase products', 'error')
      throw new Error('Admins and sellers cannot add products to cart')
    }
    
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // Add to backend cart - send only product ID and quantity
        const productId = product._id || product.id
        const response = await userAPI.addToCart(productId, quantity, token)
        if (response.success) {
          setCartItems(response.data)
          addModalNotification('Success', 'Item added to cart successfully!', 'success')
          return response.data
        } else {
          throw new Error(response.error || 'Failed to add product to cart')
        }
      } else {
        // Local storage fallback
        setCartItems(prevItems => {
          // Use _id if available, otherwise use id
          const productId = product._id || product.id
          const existingItem = prevItems.find(item => 
            (item.product ? item.product._id || item.product.id : item._id || item.id) === productId
          )
          if (existingItem) {
            return prevItems.map(item =>
              (item.product ? item.product._id || item.product.id : item._id || item.id) === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            // Store in the same format as backend (with product nested)
            return [...prevItems, { product: product, quantity: quantity }]
          }
        })
        addModalNotification('Success', 'Item added to cart successfully!', 'success')
        return Promise.resolve()
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      addModalNotification('Error', error.message || 'Failed to add product to cart', 'error')
      // Fallback to local state if backend fails
      setCartItems(prevItems => {
        // Use _id if available, otherwise use id
        const productId = product._id || product.id
        const existingItem = prevItems.find(item => 
          (item.product ? item.product._id || item.product.id : item._id || item.id) === productId
        )
        if (existingItem) {
          return prevItems.map(item =>
            (item.product ? item.product._id || item.product.id : item._id || item.id) === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Store in the same format as backend (with product nested)
          return [...prevItems, { product: product, quantity: quantity }]
        }
      })
      throw error
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        // Remove from backend cart
        const response = await userAPI.removeFromCart(productId, token)
        if (response.success) {
          setCartItems(response.data)
          addModalNotification('Success', 'Item removed from cart successfully!', 'success')
        }
      } else {
        // Local storage fallback
        setCartItems(prevItems => prevItems.filter(item => 
          (item.product ? item.product._id || item.product.id : item._id || item.id) !== productId
        ))
        addModalNotification('Success', 'Item removed from cart successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      addModalNotification('Error', 'Failed to remove item from cart', 'error')
      // Fallback to local state if backend fails
      setCartItems(prevItems => prevItems.filter(item => 
        (item.product ? item.product._id || item.product.id : item._id || item.id) !== productId
      ))
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        // Update in backend cart
        const response = await userAPI.updateCart(productId, quantity, token)
        if (response.success) {
          setCartItems(response.data)
        }
      } else {
        // Local storage fallback
        setCartItems(prevItems =>
          prevItems.map(item =>
            (item.product ? item.product._id || item.product.id : item._id || item.id) === productId 
              ? { ...item, quantity } 
              : item
          )
        )
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      // Fallback to local state if backend fails
      setCartItems(prevItems =>
        prevItems.map(item =>
          (item.product ? item.product._id || item.product.id : item._id || item.id) === productId 
            ? { ...item, quantity } 
            : item
        )
      )
    }
  }

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        // Clear backend cart
        const response = await userAPI.clearCart(token)
        if (response.success) {
          setCartItems(response.data)
        }
      } else {
        // Local storage fallback
        setCartItems([])
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      // Fallback to local state if backend fails
      setCartItems([])
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle both backend format (item.product) and local format (item directly)
      const product = item.product || item
      const price = product.discount 
        ? product.price * (1 - product.discount / 100)
        : product.price
      return total + (price * (item.quantity || 1))
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loading,
    isInCart,
    getCartItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  return useContext(CartContext)
}