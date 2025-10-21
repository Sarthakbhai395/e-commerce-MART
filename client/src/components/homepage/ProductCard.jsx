import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/format';

export const ProductCard = ({ 
  id, 
  image, 
  title, 
  price, 
  originalPrice, 
  discount, 
  rating, 
  reviews 
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addModalNotification } = useNotification();

  // Function to get proper image URL
  const getProductImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Use the full product object passed from homepage
    const product = {
      _id: id,
      id,
      image,
      name: title,
      price,
      originalPrice,
      discount,
      rating,
      reviews
    };
    addToCart(product);
    // Notification is now handled in CartContext with modal notification
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    // Use the full product object passed from homepage
    const product = {
      _id: id,
      id,
      image,
      name: title,
      price,
      originalPrice,
      discount,
      rating,
      reviews
    };
    addToWishlist(product);
    // Notification is now handled in WishlistContext with modal notification
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    // Redirect to product detail page
    window.location.href = `/product/${id}`;
  };

  const discountedPrice = discount ? price : originalPrice;
  const actualDiscount = discount || Math.round(((originalPrice - price) / originalPrice) * 100);

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div
          onClick={handleImageClick}
          className="cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={getProductImageUrl(image)} 
            alt={title} 
            className="w-full h-48 object-cover"
            onError={handleImageError}
          />
        </motion.div>
        {actualDiscount > 0 && (
          <motion.span 
            className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {actualDiscount}% OFF
          </motion.span>
        )}
        <motion.button
          onClick={handleAddToWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isInWishlist(id)
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
      </div>
      
      <div className="p-4">
        <motion.div
          onClick={handleImageClick}
          className="cursor-pointer"
          whileHover={{ x: 5 }}
        >
          <h3 className="text-gray-800 font-semibold mb-2 line-clamp-2 h-12 group-hover:text-blue-600 transition-colors">{title}</h3>
        </motion.div>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <motion.svg 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ scale: 1.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </motion.svg>
            ))}
          </div>
          <span className="text-gray-600 text-sm ml-1">({reviews})</span>
        </div>
        
        <div className="flex items-center mb-4">
          <span className="text-gray-800 font-bold text-lg">{formatCurrency(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-gray-500 text-sm line-through ml-2">{formatCurrency(originalPrice)}</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};