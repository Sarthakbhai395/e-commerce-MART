import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CartItem from '../../components/cart/CartItem'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../utils/format'
import { useNotification } from '../../contexts/NotificationContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, loading } = useCart()
  const { user } = useAuth()
  const { addNotification } = useNotification()

  // Check if user is admin or seller
  if (user && (user.role === 'admin' || user.role === 'seller')) {
    return <RestrictedAccess />
  }

  const handleCheckout = () => {
    // Redirect to checkout page
    navigate('/checkout')
  }

  const handleBuyNow = () => {
    // Redirect to checkout page for immediate purchase
    navigate('/checkout')
  }

  const subtotal = getCartTotal()
  const tax = subtotal * 0.08
  const total = subtotal + tax

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <motion.div 
          className="text-2xl text-dark-grey"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading your cart...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-grey cart-container">
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
          Shopping Cart
        </motion.h1>
        
        <AnimatePresence>
          {cartItems.length === 0 ? (
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
              <h2 className="text-2xl font-semibold mb-4 text-dark-grey responsive-h2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your cart</p>
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
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {/* Cart Items */}
              <motion.div 
                className="lg:col-span-2"
                variants={item}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                      <h2 className="text-2xl font-semibold text-dark-grey responsive-h2">
                        Cart ({cartItems.reduce((count, item) => count + (item.quantity || 0), 0)} items)
                      </h2>
                      <motion.button 
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-800 flex items-center touch-target"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Cart
                      </motion.button>
                    </div>
                    
                    <div className="divide-y">
                      <AnimatePresence>
                        {cartItems.map((item) => (
                          <motion.div
                            key={item._id || item.id || item.product?._id || item.product?.id}
                            variants={item}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            layout
                          >
                            <CartItem
                              item={item}
                              onUpdateQuantity={updateQuantity}
                              onRemove={removeFromCart}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Order Summary - Always show even when cart is empty */}
              <motion.div
                variants={item}
              >
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                  <h2 className="text-2xl font-semibold mb-6 text-dark-grey responsive-h2">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <motion.div 
                      className="border-t pt-4 flex justify-between font-semibold text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span>Total</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.button
                      onClick={handleBuyNow}
                      className="w-full btn-success relative overflow-hidden touch-target responsive-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={cartItems.length === 0}
                    >
                      <span className="relative z-10">Buy Now</span>
                      <motion.span 
                        className="absolute inset-0 bg-white opacity-0"
                        whileHover={{ opacity: 0.2 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                    
                    <motion.button
                      onClick={handleCheckout}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300 relative overflow-hidden touch-target responsive-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={cartItems.length === 0}
                    >
                      <span className="relative z-10">Proceed to Checkout</span>
                      <motion.span 
                        className="absolute inset-0 bg-white opacity-0"
                        whileHover={{ opacity: 0.2 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  </div>
                  
                  <motion.a 
                    href="/products" 
                    className="block text-center mt-4 text-blue-600 hover:text-blue-800 touch-target"
                    whileHover={{ x: 5 }}
                  >
                    Continue Shopping
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Cart