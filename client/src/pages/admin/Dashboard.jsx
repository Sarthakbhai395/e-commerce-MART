import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import { productAPI, userAPI, activityAPI } from '../../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activities, setActivities] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'technology'
  })

  // Fetch products
  const fetchProducts = async (token) => {
    try {
      setLoading(true)
      setError('')
      const response = await productAPI.getProducts()
      if (response.success) {
        setProducts(response.data || response.products || [])
      } else {
        setError('Failed to fetch products')
      }
    } catch (err) {
      setError('An error occurred while fetching products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch users
  const fetchUsers = async (token) => {
    try {
      setLoading(true)
      setError('')
      const response = await userAPI.getUsers(token)
      if (response.success) {
        // Filter out admins and sellers, keep only regular users
        const allUsers = response.data || response.users || [];
        const regularUsers = allUsers.filter(user => user.role === 'user')
        setUsers(regularUsers)
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('An error occurred while fetching users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch sellers
  const fetchSellers = async (token) => {
    try {
      setLoading(true)
      setError('')
      const response = await userAPI.getSellersOnly(token)
      if (response.success) {
        setSellers(response.data || response.sellers || [])
      } else {
        setError('Failed to fetch sellers')
      }
    } catch (err) {
      setError('An error occurred while fetching sellers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch activities
  const fetchActivities = async (token) => {
    try {
      setLoading(true)
      setError('')
      const response = await activityAPI.getActivities(token)
      if (response.success) {
        setActivities(response.data || response.activities || [])
      } else {
        setError('Failed to fetch activities')
      }
    } catch (err) {
      setError('An error occurred while fetching activities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts or when active section changes
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    switch (activeSection) {
      case 'products':
        fetchProducts(token)
        break
      case 'users':
        fetchUsers(token)
        break
      case 'sellers':
        fetchSellers(token)
        break
      default:
        // Fetch all data for dashboard overview
        fetchProducts(token)
        fetchUsers(token)
        fetchSellers(token)
        fetchActivities(token)
        break
    }
  }, [activeSection, navigate])

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Redirect to login
    navigate('/login', { replace: true })
  }

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await productAPI.deleteProduct(productId, token)
        if (response.success) {
          setSuccess('Product deleted successfully!')
          // Refresh products list
          fetchProducts(token)
          // Reset success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete product')
        }
      } catch (err) {
        setError('An error occurred while deleting the product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle block user
  const handleBlockUser = async (userId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.blockUser(userId, token)
      if (response.success) {
        setSuccess('User blocked successfully!')
        // Update user status in local state without refresh
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isBlocked: true } : user
          )
        )
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to block user')
      }
    } catch (err) {
      setError('An error occurred while blocking the user')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle unblock user
  const handleUnblockUser = async (userId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.unblockUser(userId, token)
      if (response.success) {
        setSuccess('User unblocked successfully!')
        // Update user status in local state without refresh
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isBlocked: false } : user
          )
        )
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to unblock user')
      }
    } catch (err) {
      setError('An error occurred while unblocking the user')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await userAPI.deleteUser(userId, token)
        if (response.success) {
          setSuccess('User deleted successfully!')
          // Refresh users list
          fetchUsers(token)
          // Reset success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete user')
        }
      } catch (err) {
        setError('An error occurred while deleting the user')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle delete seller (same as delete user since they're both users with different roles)
  const handleDeleteSeller = async (sellerId) => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await userAPI.deleteUser(sellerId, token)
        if (response.success) {
          setSuccess('Seller deleted successfully!')
          // Refresh sellers list
          fetchSellers(token)
          // Reset success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete seller')
        }
      } catch (err) {
        setError('An error occurred while deleting the seller')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle block seller
  const handleBlockSeller = async (sellerId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.blockUser(sellerId, token)
      if (response.success) {
        setSuccess('Seller blocked successfully!')
        // Update seller status in local state without refresh
        setSellers(prevSellers => 
          prevSellers.map(seller => 
            seller._id === sellerId ? { ...seller, isBlocked: true } : seller
          )
        )
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to block seller')
      }
    } catch (err) {
      setError('An error occurred while blocking the seller')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle unblock seller
  const handleUnblockSeller = async (sellerId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.unblockUser(sellerId, token)
      if (response.success) {
        setSuccess('Seller unblocked successfully!')
        // Update seller status in local state without refresh
        setSellers(prevSellers => 
          prevSellers.map(seller => 
            seller._id === sellerId ? { ...seller, isBlocked: false } : seller
          )
        )
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to unblock seller')
      }
    } catch (err) {
      setError('An error occurred while unblocking the seller')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount || '',
      category: product.category
    })
  }

  // Handle product form change
  const handleProductChange = (e) => {
    const { name, value } = e.target
    setProductData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await productAPI.updateProduct(editingProduct._id, productData, token)
      if (response.success) {
        setSuccess('Product updated successfully!')
        // Close the edit form
        setEditingProduct(null)
        // Reset form data
        setProductData({
          name: '',
          description: '',
          price: '',
          discount: '',
          category: 'technology'
        })
        // Refresh products list
        fetchProducts(token)
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update product')
      }
    } catch (err) {
      setError('An error occurred while updating the product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Function to get proper product image URL
  const getProductImageUrl = (product) => {
    if (!product || !product.image) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
    }
    
    // Check if image is an external URL
    const isExternalUrl = product.image.startsWith('http://') || product.image.startsWith('https://');
    if (isExternalUrl) {
      return product.image;
    }
    
    // For local images that already have the /uploads/ prefix
    if (product.image.startsWith('/uploads/')) {
      return `http://localhost:5000${product.image}`;
    }
    
    // For the default no-photo image
    if (product.image === 'no-photo.jpg') {
      return 'http://localhost:5000/uploads/no-photo.jpg';
    }
    
    // For local images without the /uploads/ prefix, add it
    return `http://localhost:5000/uploads/${product.image}`;
  };

  // Function to get user avatar with unique colors based on name
  const getUserAvatar = (user) => {
    if (!user) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100';
    
    // Generate a unique color based on user's name
    const stringToColor = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
      return "00000".substring(0, 6 - c.length) + c
    }
    
    // Get first letter of user's name
    const firstLetter = user.name?.charAt(0)?.toUpperCase() || 'U'
    
    // Return data URL for SVG avatar
    const color = stringToColor(user.name || 'User')
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23${color}" rx="50"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="50" fill="white">${firstLetter}</text></svg>`
  };

  // Function to get seller avatar with unique colors based on name
  const getSellerAvatar = (seller) => {
    if (!seller) return 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&h=100';
    
    // Generate a unique color based on seller's name (different algorithm than user)
    const stringToColor = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 7) - hash) // Different shift for sellers
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
      return "00000".substring(0, 6 - c.length) + c
    }
    
    // Get first letter of seller's name
    const firstLetter = seller.name?.charAt(0)?.toUpperCase() || 'S'
    
    // Return data URL for SVG avatar with different styling for sellers
    const color = stringToColor(seller.name || 'Seller')
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23${color}" rx="20"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="50" fill="white">${firstLetter}</text></svg>`
  };

  // Render edit product form modal
  const renderEditProductForm = () => {
    if (!editingProduct) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleUpdateProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={productData.category}
                    onChange={handleProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="technology">Technology</option>
                    <option value="clothing">Clothing</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="books">Books</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={productData.discount}
                    onChange={handleProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleProductChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Manage Products</h2>
              {/* Removed Add New Product button as requested */}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Product</th>
                      <th className="py-3 px-4 text-left">Category</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Discount</th>
                      <th className="py-3 px-4 text-left">Seller</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr 
                        key={product._id} 
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img 
                              src={getProductImageUrl(product)} 
                              alt={product.name} 
                              className="w-10 h-10 object-contain mr-3 rounded-md"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                              }}
                            />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize">{product.category}</td>
                        <td className="py-3 px-4 font-semibold">${product.price.toFixed(2)}</td>
                        <td className="py-3 px-4">{product.discount ? `${product.discount}%` : 'None'}</td>
                        <td className="py-3 px-4">{product.seller?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Users</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">User</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Created</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr 
                        key={user._id} 
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img 
                              src={getUserAvatar(user)} 
                              alt={user.name} 
                              className="w-10 h-10 object-cover rounded-full mr-3"
                            />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {user.isBlocked ? (
                              <button 
                                onClick={() => handleUnblockUser(user._id)}
                                className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBlockUser(user._id)}
                                className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      
      case 'sellers':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Sellers</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading sellers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Seller</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Products</th>
                      <th className="py-3 px-4 text-left">Created</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sellers.map((seller) => (
                      <tr 
                        key={seller._id} 
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img 
                              src={getSellerAvatar(seller)} 
                              alt={seller.name} 
                              className="w-10 h-10 object-cover rounded mr-3"
                            />
                            <span className="font-medium">{seller.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{seller.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            seller.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {seller.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {products.filter(p => p.seller && p.seller._id === seller._id).length} products
                        </td>
                        <td className="py-3 px-4">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {seller.isBlocked ? (
                              <button 
                                onClick={() => handleUnblockSeller(seller._id)}
                                className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBlockSeller(seller._id)}
                                className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteSeller(seller._id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      
      default: // dashboard
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Manage Products</h2>
                </div>
                <p className="text-gray-600 mb-6">View, add, edit, or delete products</p>
                <button 
                  onClick={() => setActiveSection('products')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full"
                >
                  Manage Products
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Manage Users</h2>
                </div>
                <p className="text-gray-600 mb-6">View, delete, or block users</p>
                <button 
                  onClick={() => setActiveSection('users')}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full"
                >
                  Manage Users
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Manage Sellers</h2>
                </div>
                <p className="text-gray-600 mb-6">View, delete, or block sellers</p>
                <button 
                  onClick={() => setActiveSection('sellers')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full"
                >
                  Manage Sellers
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Activities</h2>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="border-b pb-4 last:border-b-0"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-800">{activity.admin} {activity.action}</p>
                        <span className="text-gray-500 text-sm">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{activity.target}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent activities found</p>
              )}
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} handleLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          {renderContent()}
        </main>
        
        {/* Render edit product form if editing */}
        {editingProduct && renderEditProductForm()}
      </div>
    </div>
  )
}

export default AdminDashboard