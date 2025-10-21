import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../services/api';
// Removed Header import since we're removing it
// Removed CategoryNav import since we're removing it
import { BannerCarousel } from '../components/homepage/BannerCarousel';
import { ProductCard } from '../components/homepage/ProductCard';
import { DealsSection } from '../components/homepage/DealsSection';

const NewHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts();
      
      if (response.success) {
        // Take first 8 products for display
        const featuredProducts = response.data.slice(0, 8).map(product => {
          // Check if image is an external URL (Unsplash, etc.)
          const isExternalUrl = product.image && (
            product.image.startsWith('http://') || 
            product.image.startsWith('https://')
          );
          
          // For local images, use the correct path
          // For external images, use as is
          let imageUrl;
          if (isExternalUrl) {
            imageUrl = product.image;
          } else if (product.image && product.image !== 'no-photo.jpg' && product.image !== '/uploads/no-photo.jpg') {
            // For uploaded images, construct the full URL
            if (product.image.startsWith('/uploads/')) {
              imageUrl = `http://localhost:5000${product.image}`;
            } else {
              // Add /uploads/ prefix for relative paths
              imageUrl = `http://localhost:5000/uploads/${product.image}`;
            }
          } else {
            imageUrl = 'http://localhost:5000/uploads/no-photo.jpg';
          }
              
          // Return the complete product object with updated image
          return {
            ...product,
            _id: product._id || product.id,
            id: product._id || product.id,
            image: imageUrl,
            title: product.name,
            price: product.discount 
              ? product.price * (1 - product.discount / 100)
              : product.price,
            originalPrice: product.price,
            rating: 4.5, // Default rating
            reviews: Math.floor(Math.random() * 1000) + 1 // Random reviews
          };
        });
        setProducts(featuredProducts);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (product) => {
    if (!product) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
    
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
      } else {
        return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&h=300';
      }
    }
    
    // Home appliances
    if (category.includes('home') || category.includes('appliance')) {
      return 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&h=300';
    }
    
    // Default image
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
  };

  const deals = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1631011714977-a6068c048b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlfGVufDF8fHx8MTc2MDY4MTUyOXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Smartphones",
      discount: "Up to 40% Off",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA3Nzg5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Laptops",
      discount: "Min 30% Off",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1558756520-22cfe5d382ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW98ZW58MXx8fHwxNzYwNjk5Mjc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Headphones",
      discount: "From ₹499",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwYXBwbGlhbmNlc3xlbnwxfHx8fDE3NjA3MzIxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Home Appliances",
      discount: "Up to 60% Off",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1717295248494-937c3a5655b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMGdhZGdldHN8ZW58MXx8fHwxNzYwNzMxMzc0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Electronics",
      discount: "Great Savings!",
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-xl text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Removed the Header component as requested */}
      {/* Removed the CategoryNav component as requested */}
      
      <main>
        {/* Banner Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <BannerCarousel />
        </motion.div>

        {/* Content Container */}
        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Deals Section */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={container}
          >
            <DealsSection title="Top Deals on Electronics" deals={deals} />
          </motion.div>

          {/* Products Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Best of Electronics</h2>
              <Link 
                to="/products" 
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300 flex items-center group"
              >
                View All
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={item}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard key={product.id} {...product} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Categories Section */}
          <motion.div 
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Technology', icon: '💻', color: 'from-blue-500 to-blue-600' },
                { name: 'Fashion', icon: '👕', color: 'from-purple-500 to-purple-600' },
                { name: 'Home', icon: '🏠', color: 'from-green-500 to-green-600' },
                { name: 'Books', icon: '📚', color: 'from-yellow-500 to-yellow-600' },
                { name: 'Sports', icon: '⚽', color: 'from-red-500 to-red-600' },
                { name: 'Beauty', icon: '💄', color: 'from-pink-500 to-pink-600' }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-all duration-300"
              variants={item}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Quality Products</h3>
              <p className="text-gray-600">We offer only the best products from trusted brands and sellers.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-all duration-300"
              variants={item}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with regular discounts and special offers.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-all duration-300"
              variants={item}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2 2m-2-2v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery to your doorstep across India.</p>
            </motion.div>
          </motion.div>

          {/* Footer Banner */}
          <motion.div 
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl shadow-lg p-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-white text-3xl font-bold mb-4">Shop for Everything You Need</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
              Electronics, Fashion, Home & Kitchen, and more - All at amazing prices!
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-10">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">100% Secure Payments</p>
                  <p className="text-gray-400 text-sm">All major payment methods accepted</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-green-500 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Easy Returns & Refunds</p>
                  <p className="text-gray-400 text-sm">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Free Delivery</p>
                  <p className="text-gray-400 text-sm">On orders above ₹500</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default NewHome;