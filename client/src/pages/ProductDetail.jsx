import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { formatCurrency } from '../utils/format'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart, loading: cartLoading } = useCart()
  const { addToWishlist, isInWishlist, loading: wishlistLoading } = useWishlist()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProductById(id)
      
      if (response.success) {
        setProduct(response.data || response.product)
      } else {
        setError('Product not found')
      }
    } catch (err) {
      setError('An error occurred while fetching the product')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (product) {
      try {
        await addToCart(product, quantity)
      } catch (err) {
        console.error('Failed to add to cart:', err)
      }
    }
  }

  const handleAddToWishlist = async () => {
    if (product) {
      try {
        await addToWishlist(product)
      } catch (err) {
        console.error('Failed to add to wishlist:', err)
      }
    }
  }

  const handleBuyNow = async () => {
    if (product) {
      try {
        // Add to cart first
        await addToCart(product, quantity)
        // Redirect to checkout page
        navigate('/checkout')
      } catch (err) {
        console.error('Failed to add to cart:', err)
      }
    }
  }

  const discountedPrice = product?.discount 
    ? product.price * (1 - product.discount / 100)
    : product?.price

  // Function to get product image URL
  const getImageUrl = (product) => {
    if (!product) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300'
    
    // Check if image is an external URL (Unsplash, etc.)
    const isExternalUrl = product.image && (
      product.image.startsWith('http://') || 
      product.image.startsWith('https://')
    );
    
    // For external images, use as is
    if (isExternalUrl) {
      return product.image;
    }
    
    // If product has a specific local image, use it with proper URL construction
    if (product.image && product.image !== 'no-photo.jpg') {
      // Check if the image path already starts with /uploads/
      if (product.image.startsWith('/uploads/')) {
        return `http://localhost:5000${product.image}`;
      } else {
        // Add /uploads/ prefix for relative paths
        return `http://localhost:5000/uploads/${product.image}`;
      }
    }
    
    // Generate image based on product name and category
    const name = product.name?.toLowerCase() || ''
    const category = product.category?.toLowerCase() || ''
    
    // Technology products
    if (category.includes('technology') || category.includes('tech')) {
      if (name.includes('iphone') || name.includes('phone') || name.includes('mobile')) {
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('macbook') || name.includes('laptop') || name.includes('computer')) {
        return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('headphone') || name.includes('earbud')) {
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('tv') || name.includes('television')) {
        return 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('tablet')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('watch')) {
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('camera')) {
        return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&h=300'
      } else {
        return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&h=300'
      }
    }
    
    // Clothing products
    if (category.includes('clothing') || category.includes('fashion')) {
      if (name.includes('shirt') || name.includes('t-shirt')) {
        return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('shoe') || name.includes('sneaker')) {
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('dress')) {
        return 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('jeans') || name.includes('pants')) {
        return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('jacket') || name.includes('coat')) {
        return 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&h=300'
      } else {
        return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&h=300'
      }
    }
    
    // Home appliances
    if (category.includes('home') || category.includes('appliance')) {
      if (name.includes('washing') || name.includes('washer')) {
        return 'https://images.unsplash.com/photo-1574672546621-6904455c6c4c?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('refrigerator') || name.includes('fridge')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('microwave')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('ac') || name.includes('air conditioner')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300'
      } else if (name.includes('tv') || name.includes('television')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300'
      } else {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300'
      }
    }
    
    // Default image
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300'
  }

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <motion.div 
          className="text-2xl text-dark-grey"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading product...
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
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

  if (!product) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <motion.div 
          className="text-2xl text-dark-grey"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Product not found
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-grey">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={getImageUrl(product)} 
                  alt={product.name} 
                  className="w-full h-96 object-contain"
                  onError={handleImageError}
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="bg-gray-100 border-2 border-dashed rounded-lg w-full h-24" />
                ))}
              </div>
            </motion.div>
            
            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h1 
                className="text-4xl font-bold text-dark-grey mb-4"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
              >
                {product.name}
              </motion.h1>
              
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(4.5) ? 'fill-current' : 'stroke-current'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">(128 reviews)</span>
              </div>
              
              <motion.p 
                className="text-gray-600 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {product.description}
              </motion.p>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  {product.discount ? (
                    <>
                      <span className="text-3xl font-bold text-red-600">{formatCurrency(discountedPrice)}</span>
                      <span className="ml-4 text-xl text-gray-500 line-through">{formatCurrency(product.price)}</span>
                      <span className="ml-4 bg-red-100 text-red-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                        {product.discount}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-dark-grey">{formatCurrency(product.price)}</span>
                  )}
                </div>
                <p className="text-green-600 font-medium">Inclusive of all taxes</p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  In stock and ready to ship
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Free shipping on orders over ₹500
                </div>
              </div>
              
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <motion.button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-l-lg px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={cartLoading}
                  >
                    -
                  </motion.button>
                  <span className="bg-gray-100 px-6 py-2">{quantity}</span>
                  <motion.button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-r-lg px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={cartLoading}
                  >
                    +
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={handleAddToCart}
                  className="btn-primary text-lg px-8 py-3"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={cartLoading}
                >
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </motion.button>
                <motion.button
                  onClick={handleBuyNow}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-3 rounded-lg transition duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={cartLoading}
                >
                  {cartLoading ? 'Processing...' : 'Buy Now'}
                </motion.button>
                <motion.button
                  onClick={handleAddToWishlist}
                  className={`font-bold text-lg px-8 py-3 rounded-lg transition duration-300 ${
                    isInWishlist(product._id || product.id)
                      ? 'bg-red-500 hover:bg-red-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? 'Processing...' : (isInWishlist(product._id || product.id) ? 'Remove from Wishlist' : 'Add to Wishlist')}
                </motion.button>
              </motion.div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium text-gray-600">Category</div>
                  <div className="text-gray-800 capitalize">{product.category}</div>
                  <div className="font-medium text-gray-600">Brand</div>
                  <div className="text-gray-800">Akario Mart</div>
                  <div className="font-medium text-gray-600">SKU</div>
                  <div className="text-gray-800">{product._id?.substring(0, 8).toUpperCase() || 'N/A'}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Product Description Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-dark-grey mb-4">Product Description</h2>
          <p className="text-gray-700 leading-relaxed">
            {product.description || 'No description available for this product.'}
          </p>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-dark-grey mb-3">Key Features</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>High-quality materials for durability</li>
              <li>Designed for optimal performance</li>
              <li>User-friendly interface</li>
              <li>Comes with 1-year warranty</li>
              <li>Eco-friendly packaging</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ProductDetail