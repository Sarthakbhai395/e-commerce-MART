// This file will contain all API calls to the backend

// Use environment variable for production, fallback to empty for development proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Simple in-memory cache
const apiCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to make API requests
const apiRequest = async (url, options = {}) => {
  try {
    // Check if we have a cached response
    const cacheKey = `${options.method || 'GET'}:${url}`
    const cached = apiCache.get(cacheKey)
    
    // If we have a valid cached response, return it
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      console.log(`Returning cached response for ${url}`)
      return cached.data
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    const result = { success: response.ok, ...data }
    
    // Cache successful GET requests
    if (response.ok && (!options.method || options.method === 'GET')) {
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
    }
    
    return result
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    return { success: false, message: 'Network error' }
  }
}

// Clear cache for a specific URL
export const clearCache = (url, method = 'GET') => {
  const cacheKey = `${method}:${url}`
  apiCache.delete(cacheKey)
}

// Clear all cache
export const clearAllCache = () => {
  apiCache.clear()
}

// Auth API
export const authAPI = {
  login: async (email, password, role) => {
    // Clear cache on login
    clearAllCache()
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    })
  },

  register: async (name, email, password, role) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    })
  }
}

// Product API
export const productAPI = {
  getProducts: async () => {
    return apiRequest('/api/products')
  },

  getProductById: async (id) => {
    return apiRequest(`/api/products/${id}`)
  },

  createProduct: async (productData, token) => {
    // Clear cache when creating a product
    clearCache('/api/products', 'GET')
    return apiRequest('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })
  },

  updateProduct: async (id, productData, token) => {
    // Clear cache when updating a product
    clearCache('/api/products', 'GET')
    clearCache(`/api/products/${id}`, 'GET')
    return apiRequest(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })
  },

  deleteProduct: async (id, token) => {
    // Clear cache when deleting a product
    clearCache('/api/products', 'GET')
    clearCache(`/api/products/${id}`, 'GET')
    return apiRequest(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // Upload product photo
  uploadProductPhoto: async (id, formData, token) => {
    try {
      // Clear cache when uploading a photo
      clearCache('/api/products', 'GET')
      clearCache(`/api/products/${id}`, 'GET')
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/photo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type header for FormData, let browser set it automatically
        },
        body: formData
      });
      
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      console.error('Error uploading product photo:', error);
      return { success: false, message: 'Network error or CORS issue' };
    }
  }
}

// User API
export const userAPI = {
  getUsers: async (token) => {
    return apiRequest('/api/users/admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  getSellers: async (token) => {
    return apiRequest('/api/users/admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  getSellersOnly: async (token) => {
    return apiRequest('/api/users/admin/sellers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  deleteUser: async (id, token) => {
    return apiRequest(`/api/users/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  blockUser: async (id, token) => {
    return apiRequest(`/api/users/admin/${id}/block`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  unblockUser: async (id, token) => {
    return apiRequest(`/api/users/admin/${id}/unblock`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // Cart API
  getCart: async (token) => {
    return apiRequest('/api/users/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  addToCart: async (productId, quantity, token) => {
    // Clear cart cache when adding to cart
    clearCache('/api/users/cart', 'GET')
    return apiRequest('/api/users/cart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity })
    })
  },

  updateCart: async (productId, quantity, token) => {
    // Clear cart cache when updating cart
    clearCache('/api/users/cart', 'GET')
    return apiRequest('/api/users/cart', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity })
    })
  },

  removeFromCart: async (productId, token) => {
    // Clear cart cache when removing from cart
    clearCache('/api/users/cart', 'GET')
    return apiRequest(`/api/users/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  clearCart: async (token) => {
    // Clear cart cache when clearing cart
    clearCache('/api/users/cart', 'GET')
    return apiRequest('/api/users/cart', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // Wishlist API
  getWishlist: async (token) => {
    return apiRequest('/api/users/wishlist', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  addToWishlist: async (productId, token) => {
    // Clear wishlist cache when adding to wishlist
    clearCache('/api/users/wishlist', 'GET')
    return apiRequest('/api/users/wishlist', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    })
  },

  removeFromWishlist: async (productId, token) => {
    // Clear wishlist cache when removing from wishlist
    clearCache('/api/users/wishlist', 'GET')
    return apiRequest(`/api/users/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  clearWishlist: async (token) => {
    // Clear wishlist cache when clearing wishlist
    clearCache('/api/users/wishlist', 'GET')
    return apiRequest('/api/users/wishlist', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // Profile API
  updateProfile: async (userData, token) => {
    return apiRequest('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
  }
}

// Activity API
export const activityAPI = {
  getActivities: async (token) => {
    return apiRequest('/api/activities', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

// Contact API
export const contactAPI = {
  sendMessage: async (messageData, token = null) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return apiRequest('/api/contact', {
      method: 'POST',
      headers,
      body: JSON.stringify(messageData)
    })
  },

  getUserMessages: async (token) => {
    const response = apiRequest('/api/contact/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  }
}

// Seller Contact API
export const sellerContactAPI = {
  getContactMessages: async (token) => {
    return apiRequest('/api/seller/contact', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  sendContactResponse: async (contactId, responseMessage, token) => {
    return apiRequest(`/api/seller/contact/${contactId}/response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ responseMessage })
    })
  },

  getContactResponses: async (token) => {
    return apiRequest('/api/seller/contact/responses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },
  
  // Added delete contact message functionality
  deleteContactMessage: async (contactId, token) => {
    return apiRequest(`/api/seller/contact/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

export default {
  authAPI,
  productAPI,
  userAPI,
  activityAPI,
  contactAPI,
  sellerContactAPI,
  clearCache,
  clearAllCache
}