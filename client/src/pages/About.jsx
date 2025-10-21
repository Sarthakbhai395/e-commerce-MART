import React from 'react'
import { motion } from 'framer-motion'

const About = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 z-10"></div>
        <motion.img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&q=80" 
          alt="E-commerce Shopping" 
          className="w-full h-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            About Akario Mart
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-center text-gray-200 font-light max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Your trusted partner in online shopping
          </motion.p>
          <motion.div 
            className="mt-12 flex flex-wrap justify-center gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="text-center px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-4xl font-bold text-blue-300">10K+</div>
              <div className="text-gray-300 text-sm mt-1">Products</div>
            </div>
            <div className="text-center px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-4xl font-bold text-purple-300">50K+</div>
              <div className="text-gray-300 text-sm mt-1">Customers</div>
            </div>
            <div className="text-center px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-4xl font-bold text-green-300">500+</div>
              <div className="text-gray-300 text-sm mt-1">Brands</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-7xl">
        {/* Story Section */}
        <motion.div 
          className="mb-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-2 h-16 bg-gradient-to-b from-blue-600 to-purple-600 mr-4 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Story</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Akario Mart is a leading e-commerce platform in India, dedicated to providing customers with 
                a seamless shopping experience. We offer a wide range of products across multiple categories 
                including technology, fashion, and home appliances.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Founded with a vision to revolutionize online shopping in India, we connect buyers with trusted 
                sellers and brands, ensuring quality products at competitive prices. Our platform is designed 
                to be user-friendly, secure, and efficient.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                With our commitment to customer satisfaction, fast delivery, and excellent customer service, 
                Akario Mart has become a preferred choice for thousands of customers across the country.
              </p>
            </div>
            <motion.div 
              className="relative h-96 rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80" 
                alt="Online Shopping Platform" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 group hover:shadow-3xl transition-all duration-500"
            variants={item}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-64 overflow-hidden relative">
              <motion.img 
                src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=600&fit=crop&q=80" 
                alt="Our Mission" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To provide an exceptional online shopping experience by offering quality products, 
                competitive prices, and outstanding customer service to our valued customers across India.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 group hover:shadow-3xl transition-all duration-500"
            variants={item}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-64 overflow-hidden relative">
              <motion.img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80" 
                alt="Our Vision" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To become India's most trusted and preferred e-commerce platform by continuously 
                innovating and improving our services to meet the evolving needs of our customers.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Values Section */}
        <motion.div 
          className="mb-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              The principles that guide everything we do at Akario Mart
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-3xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Quality First</h3>
              <p className="text-gray-700 leading-relaxed">
                We are committed to offering only the highest quality products from trusted brands and verified sellers.
              </p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-white p-10 rounded-3xl shadow-lg border border-purple-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Customer Centric</h3>
              <p className="text-gray-700 leading-relaxed">
                Our customers are at the heart of everything we do. Your satisfaction is our top priority.
              </p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-50 to-white p-10 rounded-3xl shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Innovation</h3>
              <p className="text-gray-700 leading-relaxed">
                We constantly innovate to bring you the latest technology and the best shopping experience.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div 
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-12 md:p-16 text-white mb-24"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Akario Mart?</h2>
            <p className="text-gray-300 text-xl">Experience the difference with our premium services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Wide Product Range</h3>
              <p className="text-gray-300 leading-relaxed">
                Discover thousands of quality products across electronics, fashion, home appliances, and more.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Best Prices</h3>
              <p className="text-gray-300 leading-relaxed">
                Competitive pricing with regular discounts, flash sales, and exclusive deals for our customers.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast Delivery</h3>
              <p className="text-gray-300 leading-relaxed">
                Quick and reliable shipping services ensuring your orders reach you in the shortest time possible.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
              <p className="text-gray-300 leading-relaxed">
                Multiple secure payment options with bank-level encryption to protect your transactions.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-gray-300 leading-relaxed">
                Round-the-clock customer service team ready to assist you with any queries or concerns.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Returns</h3>
              <p className="text-gray-300 leading-relaxed">
                Hassle-free 7-day return and exchange policy ensuring complete satisfaction with every purchase.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div 
          className="mb-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="relative h-96 lg:h-full rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80" 
                alt="Trusted Shopping" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Trusted by Thousands</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                We take pride in being one of the most trusted e-commerce platforms in India. Our commitment 
                to authenticity, quality, and customer satisfaction has earned us the loyalty of over 50,000 
                happy customers.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Every product on our platform goes through rigorous quality checks, and we work only with 
                verified sellers and authorized brand partners. Your trust is our greatest achievement.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="text-4xl font-bold text-blue-600 mb-2">99%</div>
                  <div className="text-gray-700">Customer Satisfaction</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <div className="text-4xl font-bold text-purple-600 mb-2">4.8/5</div>
                  <div className="text-gray-700">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer CTA Section */}
        <motion.div 
          className="text-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl shadow-2xl p-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join the Akario Mart Family
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Experience the future of online shopping with India's most trusted e-commerce platform. 
            We're constantly growing and improving to serve you better. Thank you for being a part of our journey.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default About