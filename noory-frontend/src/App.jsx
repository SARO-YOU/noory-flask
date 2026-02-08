import { useState, useEffect } from 'react'
import './App.css'
import Cart from './Cart'
import AdminDashboard from './admin/AdminDashboard'
import DriverDashboard from './admin/DriverDashboard'
import UnifiedLogin from './components/UnifiedLogin'
import ProfileMenu from './components/ProfileMenu'
import FeedbackForm from './components/FeedbackForm'
import DriverApplicationForm from './components/DriverApplicationForm'

function App() {
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDriverApp, setShowDriverApp] = useState(false)

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛒' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'pantry', name: 'Pantry', icon: '🌾' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'snacks', name: 'Snacks', icon: '🍪' },
    { id: 'personal_care', name: 'Personal Care', icon: '🧴' },
    { id: 'household', name: 'Household', icon: '🧹' }
  ]

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://noory-backend.onrender.com/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }
useEffect(() => {
  fetchProducts()
}, [])

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setShowLogin(false)
  }

  const handleLogout = () => {
    setUser(null)
  }

  // Show Admin Dashboard if logged in as admin
  if (user && user.type === 'admin') {
    return <AdminDashboard 
      adminName={user.displayName}
      onLogout={handleLogout} 
    />
  }

  // Show Driver Dashboard if logged in as driver
  if (user && user.type === 'driver') {
    return <DriverDashboard 
      driver={user}
      onLogout={handleLogout}
    />
  }

  // Normal shop view (for customers and guests)
  return (
    <div className="app">
      <header className="header">
        <h1>🛍️ NOORIY</h1>
        <div className="header-actions">
          <ProfileMenu 
            user={user}
            onLoginClick={() => setShowLogin(true)}
            onLogout={handleLogout}
            onFeedbackClick={() => setShowFeedback(true)}
            onDriverApplicationClick={() => setShowDriverApp(true)}
          />
          <div className="cart-button" onClick={() => setCartOpen(true)}>
            🛒 Cart ({totalItems})
          </div>
        </div>
      </header>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="products-container">
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">KSh {product.price}</span>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    disabled={!product.in_stock}
                  >
                    {product.in_stock ? '+ Add' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Cart
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />

      {showLogin && (
        <UnifiedLogin 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showFeedback && (
        <FeedbackForm 
          onClose={() => setShowFeedback(false)}
          user={user}
        />
      )}

      {showDriverApp && (
        <DriverApplicationForm 
          onClose={() => setShowDriverApp(false)}
          user={user}
        />
      )}
    </div>
  )
}

export default App