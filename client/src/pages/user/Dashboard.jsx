import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { contactAPI, userAPI } from '../../services/api'
import { motion } from 'framer-motion'
import { useNotification } from '../../contexts/NotificationContext'
import { formatCurrency } from '../../utils/format'
import Sidebar from './components/Sidebar'

const UserDashboard = () => {
  const { user, logout, login } = useAuth()
  const { cartItems, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()
  const { addModalNotification } = useNotification()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [contactMessages, setContactMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContactMessages()
  }, [])

  const fetchContactMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await contactAPI.getUserMessages(token);
        if (response.success) {
          setContactMessages(response.data);
        } else {
          console.error('Failed to fetch contact messages:', response.error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleEditProfile = () => {
    setIsEditing(true)
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    })
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await userAPI.updateProfile(editData, token)
        if (response.success) {
          // Update the user in context
          login(response.data, token)
          setIsEditing(false)
          addModalNotification('Success', 'Profile updated successfully!', 'success')
        } else {
          addModalNotification('Error', response.error || 'Failed to update profile', 'error')
        }
      }
    } catch (error) {
      addModalNotification('Error', 'An error occurred while updating profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId)
      addModalNotification('Success', 'Item removed from cart', 'success')
    } else {
      await updateQuantity(productId, newQuantity)
      addModalNotification('Success', 'Quantity updated', 'success')
    }
  }

  // Function to get proper image URL
  const getProductImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
    }
    
    // Check if image is an external URL
    const isExternalUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
    if (isExternalUrl) {
      return imagePath;
    }
    
    // For local images that already have the /uploads/ prefix
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // For the default no-photo image
    if (imagePath === 'no-photo.jpg') {
      return 'http://localhost:5000/uploads/no-photo.jpg';
    }
    
    // For local images without the /uploads/ prefix, add it
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600">Full Name</p>
                    <p className="font-semibold text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email Address</p>
                    <p className="font-semibold text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Type</p>
                    <p className="font-semibold text-lg capitalize">{user?.role}</p>
                  </div>
                  <div>
                   
                    <p className="font-semibold text-lg">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={handleEditProfile}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'cart':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Your Cart Items</h2>
              <Link to="/user/cart" className="text-blue-600 hover:text-blue-800 font-medium">
                View Full Cart
              </Link>
            </div>
            
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  // Handle both backend format (item.product) and local format (item directly)
                  const product = item.product || item
                  const productId = product._id || product.id
                  const quantity = item.quantity || 1
                  const discountedPrice = product.discount 
                    ? product.price * (1 - product.discount / 100)
                    : product.price
                  const totalPrice = discountedPrice * quantity

                  return (
                    <div 
                      key={productId}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300"
                    >
                      {product?.image ? (
                        <img 
                          src={getProductImageUrl(product.image)} 
                          alt={product.name} 
                          className="w-16 h-16 object-contain rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 border-2 border-dashed rounded-lg" />
                      )}
                      
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-gray-600 text-sm">{product.category}</p>
                        <p className="font-bold text-gray-800">{formatCurrency(totalPrice)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateQuantity(productId, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(productId, quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => handleUpdateQuantity(productId, 0)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">Your cart is empty.</p>
                <Link to="/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Start shopping now
                </Link>
              </div>
            )}
          </div>
        )
      
      case 'wishlist':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Your Wishlist</h2>
              <Link to="/user/wishlist" className="text-blue-600 hover:text-blue-800 font-medium">
                View Full Wishlist
              </Link>
            </div>
            
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-gray-600">Your wishlist is empty.</p>
              <Link to="/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                Start adding items to your wishlist
              </Link>
            </div>
          </div>
        )
      
      case 'messages':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Messages & Seller Responses</h2>
            {loadingMessages ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading messages...</span>
              </div>
            ) : contactMessages.length > 0 ? (
              <div className="space-y-6">
                {contactMessages.map((message) => (
                  <div 
                    key={message._id} 
                    className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-800 text-lg">{message.subject}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            message.response ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {message.response ? 'Replied' : 'Sent'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{message.message}</p>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Message ID:</span>
                        <span className="ml-2 text-gray-600 font-mono">{message._id.substring(0, 8)}...</span>
                      </div>
                    </div>
                    
                    {/* Seller Response */}
                    {message.response && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-purple-800 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Seller Response
                          </h4>
                          <span className="text-sm text-purple-600">
                            {new Date(message.response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-purple-700">{message.response.message}</p>
                          <div className="mt-3 flex items-center text-xs text-purple-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>From: {message.response.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-gray-600">You haven't sent any messages yet.</p>
                <Link to="/contact" className="mt-4 inline-block text-purple-600 hover:text-purple-800 font-medium">
                  Send a message to get started
                </Link>
              </div>
            )}
          </div>
        )
      
      default: // dashboard
        return (
          <>
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600">Full Name</p>
                      <p className="font-semibold text-lg">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email Address</p>
                      <p className="font-semibold text-lg">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Account Type</p>
                      <p className="font-semibold text-lg capitalize">{user?.role}</p>
                    </div>
                    <div>
                      
                      <p className="font-semibold text-lg">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button 
                      onClick={() => setActiveSection('profile')}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Your Cart Items</h2>
                <button 
                  onClick={() => setActiveSection('cart')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Full Cart
                </button>
              </div>
              
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.slice(0, 3).map((item) => {
                    // Handle both backend format (item.product) and local format (item directly)
                    const product = item.product || item
                    const productId = product._id || product.id
                    const quantity = item.quantity || 1
                    const discountedPrice = product.discount 
                      ? product.price * (1 - product.discount / 100)
                      : product.price
                    const totalPrice = discountedPrice * quantity

                    return (
                      <div 
                        key={productId}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300"
                      >
                        {product?.image ? (
                          <img 
                            src={getProductImageUrl(product.image)} 
                            alt={product.name} 
                            className="w-16 h-16 object-contain rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 border-2 border-dashed rounded-lg" />
                        )}
                        
                        <div className="ml-4 flex-1">
                          <h3 className="font-semibold text-gray-800">{product.name}</h3>
                          <p className="text-gray-600 text-sm">{product.category}</p>
                          <p className="font-bold text-gray-800">{formatCurrency(totalPrice)}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleUpdateQuantity(productId, quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(productId, quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => handleUpdateQuantity(productId, 0)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                  {cartItems.length > 3 && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={() => setActiveSection('cart')}
                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        + {cartItems.length - 3} more items in your cart
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Your cart is empty.</p>
                  <Link to="/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                    Start shopping now
                  </Link>
                </div>
              )}
            </div>

            {/* Contact Messages Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Messages & Seller Responses</h2>
              {loadingMessages ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Loading messages...</span>
                </div>
              ) : contactMessages.length > 0 ? (
                <div className="space-y-6">
                  {contactMessages.slice(0, 3).map((message) => (
                    <div 
                      key={message._id} 
                      className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-800 text-lg">{message.subject}</h3>
                            <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                              message.response ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {message.response ? 'Replied' : 'Sent'}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2">{message.message}</p>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Message ID:</span>
                          <span className="ml-2 text-gray-600 font-mono">{message._id.substring(0, 8)}...</span>
                        </div>
                      </div>
                      
                      {/* Seller Response */}
                      {message.response && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-purple-800 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                              Seller Response
                            </h4>
                            <span className="text-sm text-purple-600">
                              {new Date(message.response.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="text-purple-700">{message.response.message}</p>
                            <div className="mt-3 flex items-center text-xs text-purple-500">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>From: {message.response.name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {contactMessages.length > 3 && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={() => setActiveSection('messages')}
                        className="text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                      >
                        View all {contactMessages.length} messages
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">You haven't sent any messages yet.</p>
                  <Link to="/contact" className="mt-4 inline-block text-purple-600 hover:text-purple-800 font-medium">
                    Send a message to get started
                  </Link>
                </div>
              )}
            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Your Cart</h2>
                </div>
                <p className="text-gray-600 mb-6">View and manage items in your shopping cart</p>
                <button 
                  onClick={() => setActiveSection('cart')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full"
                >
                  View Cart
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Wishlist</h2>
                </div>
                <p className="text-gray-600 mb-6">View your favorite items and save for later</p>
                <button 
                  onClick={() => setActiveSection('wishlist')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full"
                >
                  View Wishlist
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-300 w-full"
                >
                  Browse Products
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-300 w-full">
                  Update Preferences
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-300 w-full">
                  Payment Methods
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-300 w-full">
                  Shipping Address
                </button>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header 
          className="bg-white shadow-lg border-b border-gray-100"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold">{user?.name}</span>
              </p>
            </motion.div>
          </div>
        </motion.header>

        <motion.main 
          className="flex-1 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {renderContent()}
        </motion.main>
      </div>
    </div>
  )
}

export default UserDashboard