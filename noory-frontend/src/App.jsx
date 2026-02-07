import { useState } from 'react'
import './App.css'
import { PRODUCTS, getProductsByCategory } from './products'
import Cart from './Cart'

function App() {
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('') // NEW: Search state

  // Get products for the selected category
  let displayedProducts = getProductsByCategory(selectedCategory)

  // NEW: Filter by search query
  if (searchQuery.trim() !== '') {
    displayedProducts = displayedProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Categories for the tabs
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'groceries', name: 'Pantry' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'personal_care', name: 'Personal Care' },
    { id: 'household', name: 'Household' },
    { id: 'frozen', name: 'Frozen' }
  ]

  // Add item to cart
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

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="app">
      {/* Header - STICKY */}
      <header className="header">
        <h1>🛍️ NOORIY</h1>
        <div 
          className="cart-button"
          onClick={() => setIsCartOpen(true)}
        >
          🛒 Cart ({totalItems})
        </div>
      </header>

      {/* Search Bar - NEW */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs - STICKY */}
      <div className="categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Container - PREVENTS infinite scroll */}
      <div className="products-container">
        {displayedProducts.length > 0 ? (
          <div className="products-grid">
            {displayedProducts.map(product => (
              <div key={product.id} className="product-card">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">KSh {product.price}</span>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>
              {searchQuery 
                ? `No products found for "${searchQuery}"`
                : 'No products found in this category.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer - STOPS infinite scroll */}
      <footer className="footer">
        <p>© 2026 NOORIY Shop - All Rights Reserved</p>
      </footer>

      {/* Cart Sidebar Component */}
      <Cart 
        cart={cart}
        setCart={setCart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  )
}

export default App