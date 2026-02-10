import React, { useState, useEffect } from 'react';
import './DriverDashboard.css';

const DriverDashboard = ({ driver, onLogout }) => {
  const [activeTab, setActiveTab] = useState('deliveries');
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://noory-backend.onrender.com/api';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'deliveries') {
        const response = await fetch(`${API_URL}/orders/driver/${driver.id}`);
        const data = await response.json();
        setOrders(data);
      } else if (activeTab === 'earnings') {
        const response = await fetch(`${API_URL}/drivers/${driver.id}/earnings`);
        const data = await response.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm('Confirm this delivery?')) return;

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/confirm-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed_by: 'driver' })
      });

      const data = await response.json();
      alert(data.message);
      loadData();
    } catch (error) {
      alert('Error confirming delivery');
    }
  };

  return (
    <div className="driver-dashboard">
      <div className="driver-header">
        <div>
          <h1>🚗 Driver Dashboard</h1>
          <p>Welcome, {driver.name} ({driver.driver_number})</p>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="driver-stats-bar">
        <div className="stat">
          <span className="label">Total Deliveries</span>
          <span className="value">{driver.total_deliveries}</span>
        </div>
        <div className="stat">
          <span className="label">Total Earnings</span>
          <span className="value">KSh {driver.total_earnings.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="label">Commission Rate</span>
          <span className="value">30%</span>
        </div>
      </div>

      <div className="driver-tabs">
        <button 
          className={activeTab === 'deliveries' ? 'active' : ''} 
          onClick={() => setActiveTab('deliveries')}
        >
          📦 My Deliveries
        </button>
        <button 
          className={activeTab === 'earnings' ? 'active' : ''} 
          onClick={() => setActiveTab('earnings')}
        >
          💰 Earnings History
        </button>
      </div>

      <div className="driver-content">
        {loading && <div className="loading">Loading...</div>}

        {/* DELIVERIES TAB */}
        {activeTab === 'deliveries' && (
          <div className="deliveries-section">
            <h2>Assigned Deliveries ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="no-deliveries">
                <p>✅ No pending deliveries at the moment!</p>
                <p>Check back later for new assignments.</p>
              </div>
            ) : (
              <div className="deliveries-list">
                {orders.map(order => (
                  <div key={order.id} className="delivery-card">
                    <div className="delivery-header">
                      <h3>Order #{order.id}</h3>
                      <span className={`status ${order.status}`}>{order.status}</span>
                    </div>

                    <div className="customer-info">
                      <h4>📍 Delivery Details</h4>
                      <p><strong>Customer:</strong> {order.username}</p>
                      <p><strong>Phone:</strong> {order.phone}</p>
                      <p><strong>Address:</strong> {order.address}</p>
                    </div>

                    <div className="order-details">
                      <h4>📦 Order Items</h4>
                      {order.items.map(item => (
                        <div key={item.id} className="order-item">
                          {item.product_name} x{item.quantity} - KSh {(item.price * item.quantity).toFixed(2)}
                        </div>
                      ))}
                      <div className="order-total">
                        <strong>Total:</strong> KSh {(order.total_amount + order.delivery_fee).toFixed(2)}
                      </div>
                      <div className="delivery-fee-info">
                        <p>Delivery Fee: KSh {order.delivery_fee}</p>
                        <p>Your Earning: KSh {(order.delivery_fee * 0.3).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="delivery-actions">
                      {order.status === 'out_for_delivery' && !order.driver_confirmed && (
                        <button 
                          onClick={() => handleConfirmDelivery(order.id)}
                          className="confirm-btn"
                        >
                          ✅ Confirm Delivery
                        </button>
                      )}
                      
                      {order.driver_confirmed && !order.customer_confirmed && (
                        <div className="waiting-customer">
                          ⏳ Waiting for customer confirmation...
                        </div>
                      )}

                      {order.driver_confirmed && order.customer_confirmed && (
                        <div className="completed">
                          ✅ Delivery Completed!
                        </div>
                      )}
                    </div>

                    <div className="order-timestamp">
                      Ordered: {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && earnings && (
          <div className="earnings-section">
            <div className="earnings-summary">
              <h2>💰 Earnings Summary</h2>
              <div className="summary-grid">
                <div className="summary-card">
                  <h3>Total Earnings</h3>
                  <p className="big-number">KSh {earnings.total_earnings.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                  <h3>Completed Deliveries</h3>
                  <p className="big-number">{earnings.total_deliveries}</p>
                </div>
                <div className="summary-card">
                  <h3>Average per Delivery</h3>
                  <p className="big-number">
                    KSh {earnings.total_deliveries > 0 
                      ? (earnings.total_earnings / earnings.total_deliveries).toFixed(2) 
                      : '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="delivery-history">
              <h2>📜 Delivery History</h2>
              {earnings.deliveries && earnings.deliveries.length > 0 ? (
                <div className="history-list">
                  {earnings.deliveries.map(delivery => (
                    <div key={delivery.id} className="history-item">
                      <div className="history-header">
                        <strong>Order #{delivery.id}</strong>
                        <span>KSh {(delivery.delivery_fee * 0.3).toFixed(2)}</span>
                      </div>
                      <p>Customer: {delivery.username}</p>
                      <p>Address: {delivery.address}</p>
                      <p>Delivered: {new Date(delivery.delivered_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No completed deliveries yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;