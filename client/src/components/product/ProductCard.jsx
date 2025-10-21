import React, { useState } from 'react'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../utils/format'
import { motion, AnimatePresence } from 'framer-motion'

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart()
  const { addToWishlist, isInWishlist } = useWishlist()
  const { addNotification, addModalNotification } = useNotification()
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAdding(true)
    
    try {
      await addToCart(product)
      // Notification is now handled in CartContext with modal notification
    } catch (error) {
      // Error will be handled by the CartContext
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddToWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await addToWishlist(product)
      // Notification is now handled in WishlistContext with modal notification
    } catch (error) {
      // Error will be handled by the WishlistContext
    }
  }

  const handleImageClick = (e) => {
    e.preventDefault()
    // Get the product ID (use _id if available, otherwise id)
    const productId = product?._id || product?.id
    // Redirect to product detail page
    window.location.href = `/product/${productId}`
  }

  const discountedPrice = product?.discount 
    ? product.price * (1 - product.discount / 100)
    : product?.price

  // Function to get product image URL based on product name and category
  const getImageUrl = (product) => {
    if (!product) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
    
    // Check if image is an external URL (Unsplash, etc.)
    const isExternalUrl = product.image && (
      product.image.startsWith('http://') || 
      product.image.startsWith('https://')
    );
    
    // For local images, use the correct path with the full URL
    if (product.image && product.image.startsWith('/uploads/')) {
      return `http://localhost:5000${product.image}`;
    }
    
    // For external images, use as is
    if (isExternalUrl) {
      return product.image;
    }
    
    // If product has a specific local image, use it with the correct path
    if (product.image && product.image !== 'no-photo.jpg' && product.image !== '/uploads/no-photo.jpg') {
      // Add /uploads/ prefix
      return `http://localhost:5000/uploads/${product.image}`;
    }
    
    // For default no-photo image, use the correct path
    if (product.image === '/uploads/no-photo.jpg' || product.image === 'no-photo.jpg') {
      return 'http://localhost:5000/uploads/no-photo.jpg';
    }
    
    // Generate image based on product name and category
    const name = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    
    // Technology products
    if (category.includes('technology') || category.includes('tech')) {
      if (name.includes('iphone') || name.includes('phone') || name.includes('mobile')) {
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('macbook') || name.includes('laptop') || name.includes('computer')) {
        return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('headphone') || name.includes('earbud')) {
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('tv') || name.includes('television')) {
        return 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('tablet')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('watch')) {
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('camera')) {
        return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&h=300';
      } else {
        return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&h=300';
      }
    }
    
    // Clothing products
    if (category.includes('clothing') || category.includes('fashion')) {
      if (name.includes('shirt') || name.includes('t-shirt')) {
        return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('shoe') || name.includes('sneaker')) {
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('dress')) {
        return 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('jeans') || name.includes('pants')) {
        return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('jacket') || name.includes('coat')) {
        return 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&h=300';
      } else {
        return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&h=300';
      }
    }
    
    // Home appliances
    if (category.includes('home') || category.includes('appliance')) {
      if (name.includes('washing') || name.includes('washer')) {
        return 'https://images.unsplash.com/photo-1574672546621-6904455c6c4c?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('refrigerator') || name.includes('fridge')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('microwave')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('ac') || name.includes('air conditioner')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300';
      } else if (name.includes('tv') || name.includes('television')) {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300';
      } else {
        return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300';
      }
    }
    
    // Default image
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
  }

  // Get the product ID (use _id if available, otherwise id)
  const productId = product?._id || product?.id

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
  };

  // Check if product is already in cart
  const productInCart = isInCart(productId);
  
  // Check if user is seller or admin
  const isSellerOrAdmin = user && (user.role === 'admin' || user.role === 'seller');

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden h-full flex flex-col product-card transition-all duration-300 group"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        onClick={handleImageClick}
        className="cursor-pointer relative"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <img 
          src={getImageUrl(product)} 
          alt={product?.name || 'Product'} 
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
        {product?.discount && product.discount > 0 && (
          <motion.span 
            className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {product.discount}% OFF
          </motion.span>
        )}
        <motion.button
          onClick={handleAddToWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isInWishlist(productId)
              ? 'text-red-500 bg-red-100 hover:bg-red-200'
              : 'text-gray-700 bg-white/80 hover:bg-white hover:text-red-500'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>
      </motion.div>
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <motion.div 
            onClick={handleImageClick}
            className="cursor-pointer block"
            whileHover={{ x: 5 }}
          >
            <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
              {product?.name || 'Product Title'}
            </h3>
          </motion.div>
        </div>
        <p className="text-gray-600 text-sm mb-3">{product?.category || 'Category'}</p>
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              {product?.discount && product.discount > 0 ? (
                <>
                  <span className="font-bold text-xl text-gray-800">{formatCurrency(discountedPrice)}</span>
                  <span className="ml-2 text-sm text-gray-500 line-through">{formatCurrency(product?.price)}</span>
                </>
              ) : (
                <span className="font-bold text-xl text-gray-800">{formatCurrency(product?.price)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {!isSellerOrAdmin ? (
              <motion.button 
                onClick={handleAddToCart}
                className={`font-medium py-2.5 px-4 text-sm rounded-lg transition-all duration-300 flex-grow relative overflow-hidden shadow-md hover:shadow-lg ${
                  productInCart 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                } touch-target responsive-btn`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={isAdding}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isAdding ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : productInCart ? (
                    <>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </span>
                <motion.span 
                  className="absolute inset-0 bg-white opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard