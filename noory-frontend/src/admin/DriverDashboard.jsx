import { useState } from 'react';
import './DriverDashboard.css';

function DriverDashboard({ driver, onLogout }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('available');

  // Mock available orders
  const availableOrders = [
    {
      id: 'ORD001',
      customer: 'John Doe',
      items: 5,
      total: 2500,
      address: 'Nairobi, Westlands',
      distance: '3.2 km',
      time: '15 mins ago'
    }
  ];

  const acceptOrder = (orderId) => {
    const order = availableOrders.find(o => o.id === orderId);
    if (order) {
      setActiveOrders([...activeOrders, { ...order, status: 'accepted' }]);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setActiveOrders(activeOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    if (newStatus === 'delivered') {
      const order = activeOrders.find(o => o.id === orderId);
      setActiveOrders(activeOrders.filter(o => o.id !== orderId));
      setCompletedOrders([...completedOrders, { ...order, status: 'delivered' }]);
    }
  };

  return (
    <div className="driver-dashboard">
      {/* Header */}
      <header className="driver-header">
        <h1>🚗 Driver Dashboard</h1>
        <div className="driver-info">
          <span>👤 {driver.username}</span>
          <button className="driver-logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="driver-stats">
        <div className="driver-stat">
          <div className="stat-number">{availableOrders.length}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="driver-stat">
          <div className="stat-number">{activeOrders.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="driver-stat">
          <div className="stat-number">{completedOrders.length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="driver-tabs">
        <button 
          className={`driver-tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          📋 Available Orders
        </button>
        <button 
          className={`driver-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          🚚 Active Deliveries
        </button>
        <button 
          className={`driver-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed
        </button>
      </div>

      {/* Content */}
      <div className="driver-content">
        {activeTab === 'available' && (
          <div className="orders-list">
            {availableOrders.length === 0 ? (
              <div className="no-orders">
                <p>🔍 No available orders at the moment</p>
                <small>New orders will appear here automatically</small>
              </div>
            ) : (
              availableOrders.map(order => (
                <div key={order.id} className="order-card available">
                  <div className="order-header">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-time">{order.time}</span>
                  </div>
                  <div className="order-details">
                    <p><strong>👤 Customer:</strong> {order.customer}</p>
                    <p><strong>📍 Address:</strong> {order.address}</p>
                    <p><strong>📦 Items:</strong> {order.items} items</p>
                    <p><strong>💰 Total:</strong> KSh {order.total}</p>
                    <p><strong>📏 Distance:</strong> {order.distance}</p>
                  </div>
                  <button 
                    className="accept-order-btn"
                    onClick={() => acceptOrder(order.id)}
                  >
                    ✅ Accept Order
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="orders-list">
            {activeOrders.length === 0 ? (
              <div className="no-orders">
                <p>📦 No active deliveries</p>
                <small>Accept orders to start delivering</small>
              </div>
            ) : (
              activeOrders.map(order => (
                <div key={order.id} className="order-card active">
                  <div className="order-header">
                    <span className="order-id">#{order.id}</span>
                    <span className={`order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>👤 Customer:</strong> {order.customer}</p>
                    <p><strong>📍 Address:</strong> {order.address}</p>
                    <p><strong>💰 Total:</strong> KSh {order.total}</p>
                  </div>
                  <div className="order-actions">
                    {order.status === 'accepted' && (
                      <button 
                        className="status-btn pickup"
                        onClick={() => updateOrderStatus(order.id, 'picked_up')}
                      >
                        📦 Picked Up
                      </button>
                    )}
                    {order.status === 'picked_up' && (
                      <button 
                        className="status-btn delivery"
                        onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                      >
                        🚚 On The Way
                      </button>
                    )}
                    {order.status === 'on_the_way' && (
                      <button 
                        className="status-btn complete"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        ✅ Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="orders-list">
            {completedOrders.length === 0 ? (
              <div className="no-orders">
                <p>✅ No completed deliveries yet</p>
                <small>Your completed orders will appear here</small>
              </div>
            ) : (
              completedOrders.map(order => (
                <div key={order.id} className="order-card completed">
                  <div className="order-header">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-status delivered">Delivered</span>
                  </div>
                  <div className="order-details">
                    <p><strong>👤 Customer:</strong> {order.customer}</p>
                    <p><strong>📍 Address:</strong> {order.address}</p>
                    <p><strong>💰 Earned:</strong> KSh {order.total * 0.1}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;