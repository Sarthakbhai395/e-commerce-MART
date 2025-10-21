import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { productAPI, sellerContactAPI } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import Sidebar from './components/Sidebar'

const SellerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [showContactQueries, setShowContactQueries] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'technology',
    imageUrl: ''
  })
  const [editingProduct, setEditingProduct] = useState(null)
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [contactQueries, setContactQueries] = useState([])
  const [contactResponses, setContactResponses] = useState([])
  const [contactLoading, setContactLoading] = useState(false)
  const [responseLoading, setResponseLoading] = useState(false)
  const [loadingUserData, setLoadingUserData] = useState(true) // Add this state
  const navigate = useNavigate()
  const { user } = useAuth()

  // Check for user data on component mount
  useEffect(() => {
    // Check if user is already in context
    if (user) {
      setLoadingUserData(false)
    } else {
      // Check localStorage as backup
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setLoadingUserData(false)
        } catch (e) {
          console.error('Error parsing saved user data:', e)
          setLoadingUserData(false)
        }
      } else {
        setLoadingUserData(false)
      }
    }
  }, [user])

  // Redirect if user is not authenticated or not a seller
  useEffect(() => {
    // Check if we have user data
    if (user === null) {
      // Check localStorage as backup
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          if (parsedUser.role !== 'seller') {
            navigate('/login')
          }
        } catch (e) {
          console.error('Error parsing saved user data:', e)
          navigate('/login')
        }
      }
      // If no user data and not loading, redirect to login
      // But don't redirect if we're already trying to load user data
      else if (!loadingUserData) {
        navigate('/login')
      }
    } else if (user && user.role !== 'seller') {
      navigate('/login')
    }
  }, [user, navigate, loadingUserData])

  // Fetch seller's products
  useEffect(() => {
    if (user && user.id) {
      fetchSellerProducts()
    }
  }, [user])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showAddProduct || showEditProduct || showContactQueries || showResponseModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddProduct, showEditProduct, showContactQueries, showResponseModal]);

  const fetchSellerProducts = async () => {
    // Don't fetch if user is not available
    if (!user || !user.id) {
      setProductsLoading(false)
      return
    }
    
    try {
      setProductsLoading(true)
      setProductsError('')
      
      const token = localStorage.getItem('token')
      const response = await productAPI.getProducts()
      
      if (response.success) {
        // Filter products to show only those belonging to the current seller
        const sellerProducts = response.data.filter(product => {
          // Handle both string and object formats for seller
          const sellerId = typeof product.seller === 'object' ? product.seller._id : product.seller
          return sellerId === user.id
        })
        setProducts(sellerProducts)
      } else {
        setProductsError('Failed to fetch products')
      }
    } catch (err) {
      setProductsError('An error occurred while fetching products')
      console.error(err)
    } finally {
      setProductsLoading(false)
    }
  }

  // Fetch contact queries
  const fetchContactQueries = async () => {
    try {
      setContactLoading(true)
      setError('')
      setSuccess('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await sellerContactAPI.getContactMessages(token)
      
      if (response.success) {
        setContactQueries(response.data)
      } else {
        setError('Failed to fetch contact queries: ' + (response.error || 'Unknown error'))
      }
    } catch (err) {
      setError('An error occurred while fetching contact queries: ' + err.message)
      console.error(err)
    } finally {
      setContactLoading(false)
    }
  }

  // Fetch contact queries when the queries section is opened
  useEffect(() => {
    if (activeSection === 'queries' && user && user.id) {
      fetchContactQueries()
    }
  }, [activeSection, user])

  // Send response to contact query
  const sendContactResponse = async (e) => {
    e.preventDefault()
    try {
      setResponseLoading(true)
      const token = localStorage.getItem('token')
      const response = await sellerContactAPI.sendContactResponse(
        selectedContact._id,
        responseMessage,
        token
      )
      
      if (response.success) {
        setSuccess('Response sent successfully!')
        setResponseMessage('')
        setShowResponseModal(false)
        // Refresh contact queries
        fetchContactQueries()
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to send response')
      }
    } catch (err) {
      setError('An error occurred while sending response')
      console.error(err)
    } finally {
      setResponseLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e) => {
    if (e.target.name === 'imageUrl') {
      // Handle image URL input
      setProductData({
        ...productData,
        imageUrl: e.target.value
      });
    } else if (e.target.files && e.target.files[0]) {
      // Handle file input (existing functionality)
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      // Create product data without image first
      const productPayload = {
        ...productData,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount) || 0
      };

      const response = await productAPI.createProduct(productPayload, token);
      
      if (response.success) {
        // If product created successfully, handle image if provided
        if (productData.imageUrl) {
          // Update product with image URL
          const updateResponse = await productAPI.updateProduct(
            response.data._id, 
            { image: productData.imageUrl }, 
            token
          );
          
          if (!updateResponse.success) {
            console.error('Failed to update image URL:', updateResponse.message);
          }
        } else if (image) {
          // Upload the image file
          const formData = new FormData();
          formData.append('file', image);
          
          const uploadResponse = await productAPI.uploadProductPhoto(response.data._id, formData, token);
          
          if (!uploadResponse.success) {
            console.error('Failed to upload image:', uploadResponse.message);
          }
        }
        
        setSuccess(true);
        // Reset form
        setProductData({
          name: '',
          description: '',
          price: '',
          discount: '',
          category: 'technology',
          imageUrl: ''
        });
        setImage(null);
        // Refresh products list
        fetchSellerProducts();
        // Close modal after a short delay
        setTimeout(() => {
          setShowAddProduct(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError(response.message || 'Failed to create product');
      }
    } catch (err) {
      setError('An error occurred while creating the product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount?.toString() || '0',
      category: product.category,
      imageUrl: product.image && !product.image.includes('no-photo') ? product.image : ''
    })
    setImage(null)
    setShowEditProduct(true)
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      // Update product data
      const productPayload = {
        ...productData,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount) || 0
      };

      const response = await productAPI.updateProduct(editingProduct._id, productPayload, token);
      
      if (response.success) {
        // If product updated successfully, handle image if provided
        if (productData.imageUrl) {
          // Update product with image URL
          const updateResponse = await productAPI.updateProduct(
            editingProduct._id, 
            { image: productData.imageUrl }, 
            token
          );
          
          if (!updateResponse.success) {
            console.error('Failed to update image URL:', updateResponse.message);
          }
        } else if (image) {
          // Upload the image file
          const formData = new FormData();
          formData.append('file', image);
          
          const uploadResponse = await productAPI.uploadProductPhoto(editingProduct._id, formData, token);
          
          if (!uploadResponse.success) {
            console.error('Failed to upload image:', uploadResponse.message);
          }
        }
        
        setSuccess(true);
        // Refresh products list
        fetchSellerProducts();
        // Close modal after a short delay
        setTimeout(() => {
          setShowEditProduct(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError(response.message || 'Failed to update product');
      }
    } catch (err) {
      setError('An error occurred while updating the product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await productAPI.deleteProduct(productId, token)
        
        if (response.success) {
          // Remove the product from the local state
          setProducts(products.filter(product => product._id !== productId))
          // Show success message or just refresh the list
        } else {
          alert('Failed to delete product: ' + (response.message || 'Unknown error'))
        }
      } catch (err) {
        console.error('Error deleting product:', err)
        alert('An error occurred while deleting the product')
      }
    }
  }

  // Function to get product image URL
  const getProductImageUrl = (product) => {
    console.log('Getting product image URL for:', product.image);
    if (!product || !product.image) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
    }
    
    // For local images, use the correct path with the full URL
    if (product.image.startsWith('/uploads/')) {
      return `http://localhost:5000${product.image}`;
    }
    
    // For the default no-photo image
    if (product.image === '/uploads/no-photo.jpg' || product.image === 'no-photo.jpg') {
      return 'http://localhost:5000/uploads/no-photo.jpg';
    }
    
    // For external images, use as is
    if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
      return product.image;
    }
    
    // Default case - assume it's a local image
    return `http://localhost:5000/uploads/${product.image}`;
  };

  // If user is not loaded yet, show loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // If user is not authenticated or not a seller, redirect to login
  if (!user || user.role !== 'seller') {
    navigate('/login')
    return null
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">My Products</h2>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Add Product
              </button>
            </div>
            
            {productsError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {productsError}
              </div>
            )}
            
            {productsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading your products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">You haven't added any products yet.</p>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div 
                    key={product._id} 
                    className="border rounded-lg p-4 transition-transform duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 mb-4 overflow-hidden">
                      <img 
                        src={getProductImageUrl(product)} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 text-sm capitalize">{product.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatCurrency(product.discount ? (product.price * (1 - product.discount / 100)) : product.price)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      case 'queries':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Contact Queries</h2>
            
            {contactLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading contact queries...</p>
              </div>
            ) : error ? (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            ) : success ? (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            ) : contactQueries.length > 0 ? (
              <div className="space-y-4">
                {contactQueries.map((contact) => (
                  <div 
                    key={contact._id} 
                    className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-800 text-lg">{contact.subject}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            contact.response ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contact.response ? 'Replied' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{contact.message}</p>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Message ID:</span>
                        <span className="ml-2 text-gray-600 font-mono">{contact._id.substring(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">From:</span>
                        <span className="ml-2 text-gray-600">{contact.name} ({contact.email})</span>
                      </div>
                    </div>
                    
                    {/* Seller Response */}
                    {contact.response ? (
                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-purple-800 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Your Response
                          </h4>
                          <span className="text-sm text-purple-600">
                            {new Date(contact.response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-purple-700">{contact.response.message}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button 
                          onClick={() => {
                            setSelectedContact(contact)
                            setShowResponseModal(true)
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                        >
                          Respond to Query
                        </button>
                      </div>
                    )}
                    
                    {/* Delete button */}
                    <div className="mt-4">
                      <button 
                        onClick={() => handleDeleteContactMessage(contact._id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                      >
                        Delete Message
                      </button>
                    </div>
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
                <p className="text-gray-600">No contact queries received yet.</p>
              </div>
            )}
          </div>
        )
      
      default: // dashboard
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">My Products</h2>
                </div>
                <p className="text-gray-600 mb-6">View and manage your products</p>
                <button 
                  onClick={() => setActiveSection('products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full"
                >
                  View Products
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">User Queries</h2>
                </div>
                <p className="text-gray-600 mb-6">View and respond to user contact queries</p>
                <button 
                  onClick={() => {
                    setActiveSection('queries')
                    fetchContactQueries()
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full"
                >
                  View Queries
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Products</h2>
              
              {productsError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {productsError}
                </div>
              )}
              
              {productsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading your products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">You haven't added any products yet.</p>
                  <button 
                    onClick={() => setShowAddProduct(true)}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(0, 3).map((product) => (
                    <div 
                      key={product._id} 
                      className="border rounded-lg p-4 transition-transform duration-300 ease-in-out transform hover:-translate-y-1"
                    >
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 mb-4 overflow-hidden">
                        <img 
                          src={getProductImageUrl(product)} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-gray-600 text-sm capitalize">{product.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-lg text-gray-800">
                          {formatCurrency(product.discount ? (product.price * (1 - product.discount / 100)) : product.price)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {products.length > 3 && (
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <button 
                        onClick={() => setActiveSection('products')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View All {products.length} Products
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )
    }
  }

  // Add delete contact message function
  const handleDeleteContactMessage = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token')
        const response = await sellerContactAPI.deleteContactMessage(contactId, token)
        
        if (response.success) {
          // Remove the contact message from the local state
          setContactQueries(contactQueries.filter(contact => contact._id !== contactId))
          setSuccess('Contact message deleted successfully!')
          // Reset success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete contact message')
        }
      } catch (err) {
        setError('An error occurred while deleting the contact message')
        console.error(err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header 
          className="bg-white shadow-lg"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <motion.h1 
              className="text-3xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Seller Dashboard
            </motion.h1>
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

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl w-full max-w-md my-8 mx-auto max-h-[90vh] flex flex-col"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">Add New Product</h3>
                  <button 
                    onClick={() => setShowAddProduct(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                      Product created successfully!
                    </div>
                  )}
                  <div className="space-y-4 flex-grow">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product description"
                        rows={3}
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                        required
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
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter discount percentage"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select 
                        name="category"
                        value={productData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="technology">Technology</option>
                        <option value="clothing">Clothing</option>
                        <option value="home appliances">Home Appliances</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Image
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Image URL
                            </label>
                            <input
                              type="text"
                              name="imageUrl"
                              value={productData.imageUrl || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Upload Image
                            </label>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-400 transition-colors duration-200 bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-1 pb-1">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                                </div>
                                <input 
                                  type="file" 
                                  className="hidden"
                                  onChange={handleImageChange}
                                  accept="image/*"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Enter an image URL or upload an image file. If both are provided, the URL will be used.</p>
                      </div>
                    </div>

                  </div>
                  <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {showEditProduct && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl w-full max-w-md my-8 mx-auto max-h-[90vh] flex flex-col"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">Edit Product</h3>
                  <button 
                    onClick={() => setShowEditProduct(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmitEdit} className="flex flex-col h-full">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                      Product updated successfully!
                    </div>
                  )}
                  <div className="space-y-4 flex-grow">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product description"
                        rows={3}
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                        required
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
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter discount percentage"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select 
                        name="category"
                        value={productData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="technology">Technology</option>
                        <option value="clothing">Clothing</option>
                        <option value="home appliances">Home Appliances</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Image
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Image URL
                            </label>
                            <input
                              type="text"
                              name="imageUrl"
                              value={productData.imageUrl || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Upload Image
                            </label>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-400 transition-colors duration-200 bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-1 pb-1">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                                </div>
                                <input 
                                  type="file" 
                                  className="hidden"
                                  onChange={handleImageChange}
                                  accept="image/*"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Enter an image URL or upload an image file. If both are provided, the URL will be used.</p>
                      </div>
                    </div>

                  </div>
                  <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEditProduct(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Product'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Queries Modal */}
      <AnimatePresence>
        {showContactQueries && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 mx-auto max-h-[90vh] flex flex-col"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800">User Contact Queries</h3>
                  <button 
                    onClick={() => setShowContactQueries(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {contactLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading contact queries...</p>
                  </div>
                ) : error ? (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                ) : success ? (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {success}
                  </div>
                ) : contactQueries.length > 0 ? (
                  <div className="space-y-4">
                    {contactQueries.map((contact) => (
                      <div 
                        key={contact._id} 
                        className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-800 text-lg">{contact.subject}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                contact.response ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contact.response ? 'Replied' : 'successfull'}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-2">{contact.message}</p>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Message ID:</span>
                            <span className="ml-2 text-gray-600 font-mono">{contact._id.substring(0, 8)}...</span>
                          </div>
                        </div>
                        
                        {/* Seller Response */}
                        {contact.response && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-purple-800 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Seller Response
                              </h4>
                              <span className="text-sm text-purple-600">
                                {new Date(contact.response.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-purple-700">{contact.response.message}</p>
                              <div className="mt-3 flex items-center text-xs text-purple-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>From: {contact.response.name}</span>
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
                    <p className="text-gray-600">No contact queries received yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Modal */}
      <AnimatePresence>
        {showResponseModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">Respond to Query</h3>
                  <button 
                    onClick={() => setShowResponseModal(false)}
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
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {success}
                  </div>
                )}
                
                <form onSubmit={sendContactResponse}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <p className="font-medium">{selectedContact?.subject}</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <p className="text-gray-600">{selectedContact?.message}</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Response
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your response..."
                      rows={4}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowResponseModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={responseLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      disabled={responseLoading}
                    >
                      {responseLoading ? 'Sending...' : 'Send Response'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SellerDashboard