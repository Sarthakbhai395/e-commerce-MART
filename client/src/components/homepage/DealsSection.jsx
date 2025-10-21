import React from 'react';
import { motion } from 'framer-motion';

export const DealsSection = ({ title, deals }) => {
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center group">
          View All
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {deals.map((deal) => (
          <motion.div 
            key={deal.id} 
            className="group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <img 
                src={getProductImageUrl(deal.image)} 
                alt={deal.title} 
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="bg-white/90 backdrop-blur-sm w-full py-3 px-3 rounded-b-xl">
                  <h3 className="font-semibold text-gray-800 text-sm">{deal.title}</h3>
                  <p className="text-red-600 text-xs font-bold mt-1">{deal.discount}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};