import { useState, useEffect } from 'react'
import './App.css'
import Cart from './Cart'
import AdminDashboard from './admin/AdminDashboard'
import UnifiedLogin from './components/UnifiedLogin'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://noory-backend.onrender.com/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      // Fetch products
      await fetchProducts()
      
      // Check for saved user session
      const savedUser = localStorage.getItem('nooriy_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (err) {
          console.error('Error loading saved session:', err)
          localStorage.removeItem('nooriy_user')
        }
      }
      
      // Minimum loading time for smooth UX (2 seconds)
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    }
    
    initializeApp()
  }, [])

  // Add to cart
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

  // Update cart quantity
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  // Handle checkout
  const handleCheckout = async (deliveryInfo) => {
    try {
      const orderData = {
        user_id: user?.id || null,
        items: cart,
        total: calculateTotal(),
        delivery_info: deliveryInfo,
        payment_method: deliveryInfo.paymentMethod
      }

      const response = await fetch('https://noory-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const order = await response.json()
        alert(`Order placed successfully! Order ID: ${order.order_id}`)
        setCart([])
        setShowCart(false)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('nooriy_user', JSON.stringify(userData))
    setShowLogin(false)
  }

  // Handle logout
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('nooriy_user')
  }

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  // Show admin dashboard if user is admin
  if (user?.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <>
      {/* Beautiful Loading Screen */}
      {loading && <LoadingScreen />}
      
      {/* Main App */}
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1 className="logo">🛍️ NOORIY</h1>
            <div className="header-actions">
              {user ? (
                <div className="user-menu">
                  <span className="user-name">👤 {user.username}</span>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              ) : (
                <button onClick={() => setShowLogin(true)} className="login-btn">
                  👤 Profile
                </button>
              )}
              <button onClick={() => setShowCart(true)} className="cart-btn">
                🛒 Cart ({cart.length})
              </button>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search products..."
            className="search-bar"
          />
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            🛒 All Products
          </button>
          <button
            className={selectedCategory === 'dairy' ? 'active' : ''}
            onClick={() => setSelectedCategory('dairy')}
          >
            🥛 Dairy
          </button>
          <button
            className={selectedCategory === 'pantry' ? 'active' : ''}
            onClick={() => setSelectedCategory('pantry')}
          >
            🌾 Pantry
          </button>
          <button
            className={selectedCategory === 'beverages' ? 'active' : ''}
            onClick={() => setSelectedCategory('beverages')}
          >
            🥤 Beverages
          </button>
          <button
            className={selectedCategory === 'snacks' ? 'active' : ''}
            onClick={() => setSelectedCategory('snacks')}
          >
            🍪 Snacks
          </button>
          <button
            className={selectedCategory === 'personal_care' ? 'active' : ''}
            onClick={() => setSelectedCategory('personal_care')}
          >
            🧴 Personal Care
          </button>
          <button
            className={selectedCategory === 'household' ? 'active' : ''}
            onClick={() => setSelectedCategory('household')}
          >
            🧹 Household
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-placeholder">📦</div>
                )}
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-price">KSh {product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="add-to-cart-btn"
                  disabled={!product.in_stock}
                >
                  {product.in_stock ? '+ Add' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Modal */}
        {showCart && (
          <Cart
            cart={cart}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
            total={calculateTotal()}
          />
        )}

        {/* Login Modal */}
        {showLogin && (
          <UnifiedLogin
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
          />
        )}
      </div>
    </>
  )
}

export default App