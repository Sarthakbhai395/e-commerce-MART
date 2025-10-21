import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import { productAPI } from '../services/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  useEffect(() => {
    // Check if there's a category filter in the URL
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    const search = urlParams.get('search')
    if (category) {
      setFilter(category)
    }
    if (search) {
      setSearchQuery(search)
    }
    
    fetchProducts()
  }, [location.search])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts()
      console.log('Products API response:', response) // Debug log
      
      if (response.success) {
        // Handle both possible response formats and fix image URLs
        const productsData = (response.data || response.products || []).map(product => {
          // Check if image is an external URL (Unsplash, etc.)
          const isExternalUrl = product.image && (
            product.image.startsWith('http://') || 
            product.image.startsWith('https://')
          );
          
          // For local images, use the correct path
          // For external images, use as is
          if (!isExternalUrl) {
            // Fix image path for local images
            if (product.image && product.image !== 'no-photo.jpg' && product.image !== '/uploads/no-photo.jpg') {
              // Check if the image path already starts with /uploads/
              if (product.image.startsWith('/uploads/')) {
                product.image = `http://localhost:5000${product.image}`;
              } else {
                // Add /uploads/ prefix
                product.image = `http://localhost:5000/uploads/${product.image}`;
              }
            } else {
              // For default no-photo image, use the correct path
              product.image = 'http://localhost:5000/uploads/no-photo.jpg';
            }
          }
          
          return product;
        });
        
        setProducts(productsData)
      } else {
        setError('Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err) // Debug log
      setError('An error occurred while fetching products')
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    // Category filter
    const categoryMatch = filter === 'all' || product.category?.toLowerCase() === filter.toLowerCase()
    
    // Search filter
    const searchMatch = searchQuery 
      ? product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    
    return categoryMatch && searchMatch
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'name') {
      return a.name?.localeCompare(b.name || '') || 0
    } else if (sort === 'price-low') {
      return (a.price || 0) - (b.price || 0)
    } else if (sort === 'price-high') {
      return (b.price || 0) - (a.price || 0)
    } else if (sort === 'discount') {
      return (b.discount || 0) - (a.discount || 0)
    } else if (sort === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
    return 0
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div 
          className="text-2xl text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading products...
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold text-gray-800 mb-8 text-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          All Products
        </motion.h1>
        
        {/* Search Bar */}
        <motion.div 
          className="mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            // The search is already handled by the URL params
          }} className="flex">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 border border-gray-300 rounded-l-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-r-full transition duration-300 shadow-md hover:shadow-lg"
            >
              Search
            </button>
          </form>
        </motion.div>
        
        {/* Filter and Sort Controls */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between mb-8 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-full sm:w-1/2">
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-full shadow-sm bg-white"
            >
              <option value="all">All Categories</option>
              <option value="technology">Technology</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Kitchen</option>
              <option value="books">Books</option>
              <option value="sports">Sports</option>
            </select>
          </div>
          
          <div className="w-full sm:w-1/2">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1 block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-full shadow-sm bg-white"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Discount</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </motion.div>
        
        {/* Clear Search Button */}
        {searchQuery && (
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center mx-auto group"
            >
              Clear search
              <svg className="w-4 h-4 ml-1 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
        
        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {sortedProducts.map((product) => (
              <motion.div
                key={product._id || product.id}
                variants={item}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-6 rounded-full transition duration-300"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Products