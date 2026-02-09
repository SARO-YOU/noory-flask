import './Cart.css'
import { useState } from 'react'
import Checkout from './components/Checkout'

function Cart({ cart, isOpen, onClose, onRemove, onUpdateQuantity, user }) {
  const [showCheckout, setShowCheckout] = useState(false)

  // Remove item from cart
  const removeFromCart = (productId) => {
    onRemove(productId)
  }

  // Increase quantity
  const increaseQuantity = (productId) => {
    const item = cart.find(i => i.id === productId)
    if (item) {
      onUpdateQuantity(productId, item.quantity + 1)
    }
  }

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    const item = cart.find(i => i.id === productId)
    if (item) {
      onUpdateQuantity(productId, Math.max(1, item.quantity - 1))
    }
  }

  // Clear entire cart
  const clearCart = () => {
    cart.forEach(item => onRemove(item.id))
  }

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Calculate total items
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Overlay - Click to close cart */}
      {isOpen && (
        <div className="cart-overlay" onClick={onClose}></div>
      )}

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Cart Header */}
        <div className="cart-header">
          <h2>🛒 Your Cart ({totalItems})</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Clear Cart Button */}
        {cart.length > 0 && (
          <div className="clear-cart-container">
            <button className="clear-cart-btn" onClick={clearCart}>
              🗑️ Clear Cart
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <p className="empty-cart-subtitle">Add some products to get started!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">KSh {item.price}</p>
                  
                  {/* Quantity Controls */}
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="cart-item-subtotal">
                    Subtotal: KSh {item.price * item.quantity}
                  </p>
                </div>

                {/* Remove Button */}
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove from cart"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer - Total and Checkout */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="total-label">Total:</span>
              <span className="total-price">KSh {totalPrice}</span>
            </div>
            <button className="checkout-btn" onClick={() => setShowCheckout(true)}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onOrderSuccess={() => {
            // Clear cart after successful order
            cart.forEach(item => onRemove(item.id))
            setShowCheckout(false)
            onClose()
          }}
          user={user}
        />
      )}
    </>
  )
}

export default Cart