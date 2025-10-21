import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsMenuOpen(false)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/login'
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'seller':
        return '/seller/dashboard'
      default:
        return '/user/dashboard'
    }
  }

  const getDashboardLabel = () => {
    if (!isAuthenticated || !user) return 'Login'
    
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard'
      case 'seller':
        return 'Seller Dashboard'
      default:
        return 'My Account'
    }
  }

  // Trigger animation when cart count changes
  useEffect(() => {
    setCartAnimation(true)
    const timer = setTimeout(() => {
      setCartAnimation(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [getCartCount()])

  // Trigger animation when wishlist count changes
  useEffect(() => {
    setWishlistAnimation(true)
    const timer = setTimeout(() => {
      setWishlistAnimation(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [wishlistItems.length])

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navbar-container')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <motion.nav 
      className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50 navbar-container"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                className="text-xl md:text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
                whileHover={{ scale: 1.05 }}
              >
                Akario Mart
              </motion.span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="relative group"
            >
              <Link to="/" className="text-gray-300 hover:text-white font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-700/50">
                Home
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="relative group"
            >
              <Link to="/products" className="text-gray-300 hover:text-white font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-700/50">
                Products
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="relative group"
            >
              <Link to="/about" className="text-gray-300 hover:text-white font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-700/50">
                About
              </Link>
            </motion.div>
            {/* Show Contact button only for regular users, not for sellers or admins */}
            {(isAuthenticated && user && user.role === 'user') && (
              <motion.div
                whileHover={{ y: -2 }}
                className="relative group"
              >
                <Link to="/contact" className="text-gray-300 hover:text-white font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-700/50">
                  Contact
                </Link>
              </motion.div>
            )}
            
            {/* Desktop Search - Visible on medium screens and larger */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="border border-gray-600 rounded-full px-4 py-2 md:px-5 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40 md:w-56 bg-gray-800 text-white text-sm md:text-base transition-all duration-300 focus:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          <motion.div 
            className="hidden md:flex md:items-center space-x-3 lg:space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Cart Icon - Only show for users */}
            {isAuthenticated && user && user.role === 'user' && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={cartAnimation ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Link to="/user/cart" className="relative text-gray-300 hover:text-white p-2.5 rounded-full hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="icon-with-counter">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {getCartCount() > 0 && (
                      <span className="icon-counter">
                        {getCartCount() > 99 ? '99+' : getCartCount()}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            )}
            
            {/* Wishlist Icon - Only show for users */}
            {isAuthenticated && user && user.role === 'user' && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={wishlistAnimation ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Link to="/user/wishlist" className="relative text-gray-300 hover:text-white p-2.5 rounded-full hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="icon-with-counter">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlistItems.length > 0 && (
                      <span className="icon-counter">
                        {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            )}
            
            {isAuthenticated ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                >
                  <Link 
                    to={getDashboardLink()} 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-full transition duration-300 text-sm md:text-base shadow-lg hover:shadow-xl"
                  >
                    {getDashboardLabel()}
                  </Link>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 px-4 rounded-full transition duration-300 text-sm md:text-base shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                >
                  <Link to="/login" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-full transition duration-300 text-sm md:text-base shadow-lg hover:shadow-xl">
                    Login
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search Icon */}
            <button 
              onClick={toggleSearch}
              className="text-gray-300 hover:text-white p-2.5 rounded-full hover:bg-gray-700/50 transition-colors duration-300"
              aria-label="Toggle search"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <div className="mobile-icons-container flex items-center gap-1">
              {/* Mobile Cart Icon - Only show for users */}
              {isAuthenticated && user && user.role === 'user' && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={cartAnimation ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/user/cart" className="relative text-gray-300 hover:text-white p-2.5 rounded-full hover:bg-gray-700/50 transition-colors duration-300">
                    <div className="icon-with-counter">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {getCartCount() > 0 && (
                        <span className="icon-counter">
                          {getCartCount() > 99 ? '99+' : getCartCount()}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )}
              
              {/* Mobile Wishlist Icon - Only show for users */}
              {isAuthenticated && user && user.role === 'user' && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={wishlistAnimation ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/user/wishlist" className="relative text-gray-300 hover:text-white p-2.5 rounded-full hover:bg-gray-700/50 transition-colors duration-300">
                    <div className="icon-with-counter">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {wishlistItems.length > 0 && (
                        <span className="icon-counter">
                          {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
            
            <button 
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none p-2.5 rounded-full hover:bg-gray-700/50 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              className="md:hidden pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSearch} className="px-2 py-3">
                <div className="relative flex">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="border border-gray-600 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 bg-gray-800 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-3 px-2 pt-2 pb-3 bg-gray-800/90 backdrop-blur-lg rounded-xl mt-2">
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <Link 
                  to="/products" 
                  className="text-gray-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                  onClick={toggleMenu}
                >
                  Products
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                  onClick={toggleMenu}
                >
                  About
                </Link>
                {/* Show Contact button only for regular users, not for sellers or admins */}
                  {(isAuthenticated && user && user.role === 'user') && (
                    <Link 
                      to="/contact" 
                      className="text-gray-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                      onClick={toggleMenu}
                    >
                      Contact
                    </Link>
                  )}
                  
                  {/* Mobile Search - Always visible in mobile menu */}
                  <div className="pt-2 px-2">
                    <form onSubmit={handleSearch} className="relative flex">
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="border border-gray-600 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 bg-gray-700 text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                  
                  {isAuthenticated ? (
                    <>
                      <div className="pt-4 border-t border-gray-700 mt-2">
                        <Link 
                          to={getDashboardLink()} 
                          className="text-gray-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300 block mb-2"
                          onClick={toggleMenu}
                        >
                          {getDashboardLabel()}
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="text-red-400 hover:text-red-300 font-medium px-4 py-3 rounded-lg w-full text-left hover:bg-red-900/20 transition-colors duration-300"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-4 border-t border-gray-700 mt-2">
                      <Link 
                        to="/login" 
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition duration-300 block text-center shadow-lg hover:shadow-xl"
                        onClick={toggleMenu}
                      >
                        Login
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar