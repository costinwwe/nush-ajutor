import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Navbar from './comps/Navbar'
import Shop from './pages/Shop'
import Collections from './pages/Collections'
import Lore from './pages/Lore'
import Search from './pages/Search'
import Account from './pages/Account'
import Cart from './pages/Cart'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import AddProduct from './pages/AddProduct'
import AddCategory from './pages/AddCategory'
import ProtectedRoute from './comps/ProtectedRoute'
import PaymentPage from './pages/PaymentPage'

// Import Context Providers
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import "./index.css"

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:collectionType" element={<Collections />} />
                <Route path="/lore" element={<Lore />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/search" element={<Search />} />
                <Route path="/account" element={<Account />} />
                <Route path="/cart" element={<Cart />} />
                
                {/* Admin Routes */}
                <Route path="/amCoae" element={<Admin />} />
                <Route 
                  path="/admin/add-product" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AddProduct />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/add-category" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AddCategory />
                    </ProtectedRoute>
                  } 
                />
                import PaymentPage from './pages/PaymentPage';

// In your Routes setup
<Route path="/payment/:orderId" element={
  <ProtectedRoute>
    <PaymentPage />
  </ProtectedRoute>
} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App