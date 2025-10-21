import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Pages
import Home from './pages/NewHome'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import UserDashboard from './pages/user/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import SellerDashboard from './pages/seller/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/user/Cart'
import Wishlist from './pages/user/Wishlist'
import Checkout from './pages/Checkout'
import Test from './pages/Test'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Contexts
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <Router future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}>
              <div className="App min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route 
                      path="/user/dashboard" 
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <UserDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/cart" 
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <Cart />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/wishlist" 
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <Wishlist />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <Checkout />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/dashboard" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/seller/dashboard" 
                      element={
                        <ProtectedRoute allowedRoles={['seller']}>
                          <SellerDashboard />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
              </div>
            </Router>
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App