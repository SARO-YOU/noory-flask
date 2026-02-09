import { useState } from 'react';
import './Checkout.css';

function Checkout({ cart, onClose, onOrderSuccess, user }) {
  const [step, setStep] = useState(1); // 1: Details, 2: Summary, 3: Confirmation
  const [orderDetails, setOrderDetails] = useState({
    customerName: user?.username || '',
    phone: '',
    address: '',
    deliveryZone: 'zone1',
    deliveryNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Delivery zones with fees
  const deliveryZones = {
    zone1: {
      name: 'Zone 1 - Easy Areas',
      areas: ['Westlands', 'Parklands', 'Kilimani', 'Kileleshwa', 'Lavington', 'Riverside', 'Hurlingham', 'Upper Hill', 'CBD'],
      fee: 100
    },
    zone2: {
      name: 'Zone 2 - Medium Areas',
      areas: ['Gigiri', 'Runda', 'Muthaiga', 'Kitisuru', 'Karen', 'Langata', 'South B', 'South C', 'Eastleigh', 'Mathare'],
      fee: 130
    },
    zone3: {
      name: 'Zone 3 - Far Areas',
      areas: ['Roysambu', 'Kasarani', 'Ruiru', 'Ongata Rongai', 'Syokimau', 'Kitengela', 'Kikuyu', 'Ngong'],
      fee: 210
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryZones[orderDetails.deliveryZone].fee;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setOrderDetails({
      ...orderDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (!orderDetails.customerName || !orderDetails.phone || !orderDetails.address) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate Kenyan phone number (07XX or 011X formats)
    const phoneRegex = /^(07\d{8}|011[0-5]\d{6})$/;
    if (!phoneRegex.test(orderDetails.phone)) {
      alert('Please enter a valid Kenyan phone number\nExamples: 0712345678 or 0110123456');
      return;
    }

    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const orderData = {
        customer_name: orderDetails.customerName,
        phone: orderDetails.phone,
        address: orderDetails.address,
        delivery_zone: orderDetails.deliveryZone,
        delivery_notes: orderDetails.deliveryNotes,
        payment_method: 'mpesa',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total
      };

      const response = await fetch('https://noory-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        setOrderId(data.order.order_id);
        setStep(3);
      } else {
        alert('Failed to place order: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onOrderSuccess();
    onClose();
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        {/* Step 1: Customer Details */}
        {step === 1 && (
          <div className="checkout-step">
            <h2>📝 Delivery Details</h2>
            <p className="checkout-subtitle">Enter your delivery information</p>

            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Your name"
                  value={orderDetails.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number (M-Pesa) *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0712345678 or 0110123456"
                  value={orderDetails.phone}
                  onChange={handleChange}
                  required
                />
                <small>Safaricom number (07XX or 011X) - will receive M-Pesa prompt</small>
              </div>

              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  name="address"
                  placeholder="Building name, street, landmark..."
                  value={orderDetails.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Zone *</label>
                <select
                  name="deliveryZone"
                  value={orderDetails.deliveryZone}
                  onChange={handleChange}
                >
                  {Object.keys(deliveryZones).map(zoneKey => (
                    <option key={zoneKey} value={zoneKey}>
                      {deliveryZones[zoneKey].name} - KSh {deliveryZones[zoneKey].fee}
                    </option>
                  ))}
                </select>
                <small className="zone-areas">
                  Areas: {deliveryZones[orderDetails.deliveryZone].areas.join(', ')}
                </small>
              </div>

              <div className="form-group">
                <label>Delivery Notes (Optional)</label>
                <textarea
                  name="deliveryNotes"
                  placeholder="Additional instructions for the driver..."
                  value={orderDetails.deliveryNotes}
                  onChange={handleChange}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-info-box">
                  <p>💳 <strong>M-Pesa Payment Required</strong></p>
                  <small>✅ Payment must be completed before delivery</small>
                </div>
              </div>

              <button type="button" className="next-btn" onClick={handleNext}>
                Continue to Summary →
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Order Summary */}
        {step === 2 && (
          <div className="checkout-step">
            <h2>📋 Order Summary</h2>
            <p className="checkout-subtitle">Review your order before placing</p>

            <div className="order-summary">
              <div className="summary-section">
                <h3>📦 Items ({cart.length})</h3>
                <div className="summary-items">
                  {cart.map(item => (
                    <div key={item.id} className="summary-item">
                      <span>{item.name} x {item.quantity}</span>
                      <span>KSh {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="summary-section">
                <h3>📍 Delivery Details</h3>
                <p><strong>Name:</strong> {orderDetails.customerName}</p>
                <p><strong>Phone:</strong> {orderDetails.phone}</p>
                <p><strong>Address:</strong> {orderDetails.address}</p>
                <p><strong>Zone:</strong> {deliveryZones[orderDetails.deliveryZone].name}</p>
                {orderDetails.deliveryNotes && (
                  <p><strong>Notes:</strong> {orderDetails.deliveryNotes}</p>
                )}
              </div>

              <div className="summary-section">
                <h3>💰 Payment</h3>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>KSh {subtotal}</span>
                  </div>
                  <div className="price-row">
                    <span>Delivery Fee:</span>
                    <span>KSh {deliveryFee}</span>
                  </div>
                  <div className="price-row total">
                    <span><strong>Total:</strong></span>
                    <span><strong>KSh {total}</strong></span>
                  </div>
                </div>
                <p className="payment-method-note">
                  💳 <strong>M-Pesa Payment</strong> (Pay before delivery)
                </p>
              </div>

              <div className="summary-actions">
                <button className="back-btn" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button 
                  className="place-order-btn" 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : '✅ Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="checkout-step confirmation">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-id">Order ID: <strong>{orderId}</strong></p>
            
            <div className="confirmation-details">
              <p>Thank you for your order, {orderDetails.customerName}!</p>
              
              <div className="mpesa-instructions">
                <h3>💳 M-Pesa Payment Required</h3>
                <p>✅ You'll receive an M-Pesa prompt on <strong>{orderDetails.phone}</strong></p>
                <p>📱 Please enter your PIN to complete payment</p>
                <p className="amount">Amount: KSh {total}</p>
                <p className="warning">⚠️ Your order will only be processed after payment confirmation</p>
              </div>

              <p className="delivery-time">⏱️ Estimated delivery after payment: 30-45 minutes</p>
            </div>

            <button className="finish-btn" onClick={handleFinish}>
              🏠 Back to Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;