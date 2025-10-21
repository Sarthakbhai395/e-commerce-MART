import React, { useState } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../utils/format'
import { motion } from 'framer-motion'

const WishlistItem = ({ item, onAddToCart, onRemove }) => {
  const { addModalNotification } = useNotification()
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  
  // Get the product ID (use _id if available, otherwise id)
  const productId = item?.product?._id || item?.product?.id || item?._id || item?.id

  // Access product details from the nested product object
  const product = item?.product || item

  // Function to get proper image URL
  const getProductImageUrl = (product) => {
    if (!product || !product.image) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
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

  const discountedPrice = product?.discount 
    ? product.price * (1 - product.discount / 100)
    : product?.price

  const handleAddToCart = async () => {
    // Prevent admins and sellers from adding to cart
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      addModalNotification('Access Denied', 'Sellers and admins cannot purchase products', 'error')
      return
    }
    
    setIsAdding(true)
    try {
      await onAddToCart(product)
      // Notification is now handled in CartContext with modal notification
    } catch (error) {
      // Error will be handled by the CartContext
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.div 
      className="flex flex-col sm:flex-row sm:items-center border-b py-4 gap-4 wishlist-item"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Display product image */}
      {product?.image ? (
        <motion.img 
          src={getProductImageUrl(product)} 
          alt={product.name} 
          className="w-24 h-24 object-contain rounded-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
          }}
        />
      ) : (
        <div className="w-24 h-24 bg-gray-200 border-2 border-dashed rounded-xl" />
      )}
      
      <div className="flex-1">
        <motion.h3 
          className="font-semibold text-dark-grey"
          whileHover={{ x: 5 }}
        >
          {product?.name || 'Product Name'}
        </motion.h3>
        <p className="text-gray-600 text-sm">{product?.category || 'Category'}</p>
        <div className="flex items-center mt-2">
          <span className="font-bold text-dark-grey">{formatCurrency(discountedPrice)}</span>
          {product?.discount && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center space-x-4 gap-y-2 w-full sm:w-auto">
        <motion.button 
          onClick={handleAddToCart}
          className="btn-primary px-4 py-2 text-sm relative overflow-hidden flex items-center touch-target responsive-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          disabled={user && (user.role === 'admin' || user.role === 'seller') || isAdding}
        >
          <span className="relative z-10 flex items-center">
            {isAdding ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
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
        <motion.button 
          onClick={() => onRemove(productId)}
          className="text-red-500 hover:text-red-700 p-2 rounded-full touch-target"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(254, 226, 226, 0.5)" }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default WishlistItem