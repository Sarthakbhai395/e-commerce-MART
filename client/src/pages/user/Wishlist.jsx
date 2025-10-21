import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WishlistItem from '../../components/wishlist/WishlistItem'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { addModalNotification } = useNotification()

  // Check if user is admin or seller
  if (user && (user.role === 'admin' || user.role === 'seller')) {
    return <RestrictedAccess />
  }

  const handleAddToCart = async (product) => {
    // Add the actual product to cart
    try {
      await addToCart(product)
      // Notification is now handled in CartContext with modal notification
    } catch (error) {
      // Error will be handled by the CartContext
    }
  }

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

  return (
    <div className="min-h-screen bg-light-grey wishlist-container">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold text-dark-grey mb-8 responsive-h1"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          My Wishlist
        </motion.h1>
        
        <AnimatePresence>
          {wishlistItems.length === 0 ? (
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-2xl font-semibold mb-4 text-dark-grey responsive-h2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your wishlist</p>
              <motion.a 
                href="/products" 
                className="btn-primary inline-block touch-target"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue Shopping
              </motion.a>
            </motion.div>
          ) : (
            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                  <h2 className="text-2xl font-semibold text-dark-grey responsive-h2">
                    Wishlist ({wishlistItems.length} items)
                  </h2>
                </div>
                
                <div className="divide-y">
                  <AnimatePresence>
                    {wishlistItems.map((item) => (
                      <motion.div
                        key={item._id || item.id}
                        variants={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        layout
                      >
                        <WishlistItem
                          item={item}
                          onAddToCart={handleAddToCart}
                          onRemove={removeFromWishlist}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Wishlist