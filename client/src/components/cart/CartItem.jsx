import React from 'react'
import { formatCurrency } from '../../utils/format'

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  // Access product details from the nested product object (backend format) or directly (local format)
  const product = item?.product || item
  
  // Get the product ID (use _id if available, otherwise id)
  const productId = product?._id || product?.id || item?._id || item?.id

  const discountedPrice = product?.discount 
    ? product.price * (1 - product.discount / 100)
    : product?.price

  const totalPrice = discountedPrice * (item?.quantity || 1)

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

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      onRemove(productId)
    } else {
      onUpdateQuantity(productId, newQuantity)
    }
  }

  // Ensure we have a valid quantity
  const itemQuantity = item?.quantity || 1

  return (
    <div className="flex flex-col sm:flex-row items-center border-b border-gray-200 py-6 cart-item">
      {/* Display product image */}
      {product?.image ? (
        <img 
          src={getProductImageUrl(product)} 
          alt={product.name} 
          className="w-full sm:w-24 h-24 object-contain mb-4 sm:mb-0 rounded-lg"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300';
          }}
        />
      ) : (
        <div className="w-full sm:w-24 h-24 bg-gray-200 border-2 border-dashed rounded-lg mb-4 sm:mb-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <div className="flex-1 sm:ml-6 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="font-semibold text-lg text-gray-800">
              {product?.name || 'Product Name'}
            </h3>
            <p className="text-gray-600 text-sm">{product?.category || 'Category'}</p>
            <div className="flex items-center mt-2">
              <span className="font-bold text-gray-800">{formatCurrency(discountedPrice)}</span>
              {product?.discount && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center space-x-4 gap-y-2 quantity-controls">
            <div className="flex items-center">
              <span className="font-bold text-gray-800 mr-4">{formatCurrency(totalPrice)}</span>
              <div className="flex items-center bg-gray-100 rounded-lg">
                <button 
                  onClick={() => handleQuantityChange(Math.max(0, itemQuantity - 1))}
                  className="text-gray-800 hover:text-gray-600 px-3 py-1 rounded-l-lg"
                >
                  -
                </button>
                <span className="mx-2 text-gray-800">{itemQuantity}</span>
                <button 
                  onClick={() => handleQuantityChange(itemQuantity + 1)}
                  className="text-gray-800 hover:text-gray-600 px-3 py-1 rounded-r-lg"
                >
                  +
                </button>
              </div>
            </div>
            <button 
              onClick={() => handleQuantityChange(0)}
              className="text-red-600 hover:text-red-800 p-2 rounded-full"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem