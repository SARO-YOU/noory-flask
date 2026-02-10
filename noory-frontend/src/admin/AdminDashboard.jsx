import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'dairy',
    description: '',
    image: '',
    stock: 100
  });
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Driver form state
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    password: '',
    vehicle: '',
    license_plate: ''
  });

  const API_URL = 'https://noory-backend.onrender.com/api';

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'stats': {
          const statsRes = await fetch(`${API_URL}/admin/stats`);
          const statsData = await statsRes.json();
          setStats(statsData);
          break;
        }
        case 'products': {
          const productsRes = await fetch(`${API_URL}/products`);
          const productsData = await productsRes.json();
          setProducts(productsData);
          break;
        }
        case 'orders': {
          const ordersRes = await fetch(`${API_URL}/orders`);
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
          break;
        }
        case 'drivers': {
          const driversRes = await fetch(`${API_URL}/drivers`);
          const driversData = await driversRes.json();
          setDrivers(driversData);
          break;
        }
        case 'feedback': {
          const feedbackRes = await fetch(`${API_URL}/feedback`);
          const feedbackData = await feedbackRes.json();
          setFeedback(feedbackData);
          break;
        }
        case 'applications': {
          const appsRes = await fetch(`${API_URL}/driver-applications`);
          const appsData = await appsRes.json();
          setApplications(appsData);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Product Management
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProduct 
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setProductForm({
          name: '',
          price: '',
          category: 'dairy',
          description: '',
          image: '',
          stock: 100
        });
        setEditingProduct(null);
        loadData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error saving product');
    }
    setLoading(false);
  };

  const handleEditProduct = (product) => {
    setProductForm(product);
    setEditingProduct(product);
    window.scrollTo(0, 0);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      alert(data.message);
      loadData();
    } catch (error) {
      alert('Error deleting product');
    }
  };

  // Order Management
  const handleAssignDriver = async (orderId, driverId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId, status: 'out_for_delivery' })
      });

      const data = await response.json();
      alert(data.message);
      loadData();
    } catch (error) {
      alert('Error assigning driver');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      alert(data.message);
      loadData();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  // Driver Management
  const handleAddDriver = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverForm)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${data.message}\nDriver Number: ${data.driver_number}`);
        setDriverForm({
          name: '',
          phone: '',
          password: '',
          vehicle: '',
          license_plate: ''
        });
        loadData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error adding driver');
    }
    setLoading(false);
  };

  const handleRemoveDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to remove this driver?')) return;

    try {
      const response = await fetch(`${API_URL}/drivers/${driverId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      alert(data.message);
      loadData();
    } catch (error) {
      alert('Error removing driver');
    }
  };

  const viewDriverEarnings = async (driverId) => {
    try {
      const response = await fetch(`${API_URL}/drivers/${driverId}/earnings`);
      const data = await response.json();
      
      alert(`Driver Earnings:\n\nTotal: KSh ${data.total_earnings.toFixed(2)}\nDeliveries: ${data.total_deliveries}\nCommission Rate: ${(data.commission_rate * 100)}%`);
    } catch (error) {
      alert('Error fetching driver earnings');
    }
  };

  // Driver Application Management
  const handleApproveApplication = async (appId) => {
    const password = prompt('Enter password for new driver:');
    if (!password) return;

    try {
      const response = await fetch(`${API_URL}/driver-applications/${appId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`${data.message}\nDriver Number: ${data.driver_number}\nPassword: ${password}`);
        loadData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error approving application');
    }
  };

  const handleRejectApplication = async (appId) => {
    if (!window.confirm('Reject this application?')) return;

    try {
      const response = await fetch(`${API_URL}/driver-applications/${appId}/reject`, {
        method: 'POST'
      });

      const data = await response.json();
      alert(data.message);
      loadData();
    } catch (error) {
      alert('Error rejecting application');
    }
  };

  // Feedback Management
  const handleUpdateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      alert(data.message);
      loadData();
    } catch (error) {
      alert('Error updating feedback status');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛍️ NOORIY Admin Dashboard</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          📊 Stats
        </button>
        <button 
          className={activeTab === 'products' ? 'active' : ''} 
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders
        </button>
        <button 
          className={activeTab === 'drivers' ? 'active' : ''} 
          onClick={() => setActiveTab('drivers')}
        >
          🚗 Drivers
        </button>
        <button 
          className={activeTab === 'feedback' ? 'active' : ''} 
          onClick={() => setActiveTab('feedback')}
        >
          💬 Feedback
        </button>
        <button 
          className={activeTab === 'applications' ? 'active' : ''} 
          onClick={() => setActiveTab('applications')}
        >
          📝 Applications
        </button>
      </div>

      <div className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>👥 Total Users</h3>
              <p className="stat-number">{stats.total_users || 0}</p>
            </div>
            <div className="stat-card">
              <h3>🛒 Total Orders</h3>
              <p className="stat-number">{stats.total_orders || 0}</p>
            </div>
            <div className="stat-card">
              <h3>📦 Products</h3>
              <p className="stat-number">{stats.total_products || 0}</p>
            </div>
            <div className="stat-card">
              <h3>🚗 Active Drivers</h3>
              <p className="stat-number">{stats.total_drivers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>💰 Total Revenue</h3>
              <p className="stat-number">KSh {(stats.total_revenue || 0).toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>⏳ Pending Orders</h3>
              <p className="stat-number">{stats.pending_orders || 0}</p>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="product-form-card">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleProductSubmit}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Price (KSh)"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  required
                />
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                >
                  <option value="dairy">🥛 Dairy</option>
                  <option value="groceries">🌾 Pantry</option>
                  <option value="beverages">🥤 Beverages</option>
                  <option value="snacks">🍪 Snacks</option>
                  <option value="personal_care">🧴 Personal Care</option>
                  <option value="household">🧹 Household</option>
                  <option value="frozen">❄️ Frozen</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows="3"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                />
                <div className="form-buttons">
                  <button type="submit" disabled={loading}>
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        price: '',
                        category: 'dairy',
                        description: '',
                        image: '',
                        stock: 100
                      });
                    }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="products-list">
              <h2>All Products ({products.length})</h2>
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    {product.image && <img src={product.image} alt={product.name} />}
                    <h3>{product.name}</h3>
                    <p className="price">KSh {product.price}</p>
                    <p className="category">{product.category}</p>
                    <p className="stock">Stock: {product.stock}</p>
                    <div className="product-actions">
                      <button onClick={() => handleEditProduct(product)}>Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>All Orders ({orders.length})</h2>
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <span className={`status ${order.status}`}>{order.status}</span>
                  </div>
                  <p><strong>Customer:</strong> {order.username} ({order.phone})</p>
                  <p><strong>Address:</strong> {order.address}</p>
                  <p><strong>Total:</strong> KSh {(order.total_amount + order.delivery_fee).toFixed(2)}</p>
                  <p><strong>Payment:</strong> {order.mpesa_code}</p>
                  <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  
                  {order.driver_name && (
                    <p><strong>Driver:</strong> {order.driver_name} ({order.driver_number})</p>
                  )}

                  <div className="order-items">
                    <strong>Items:</strong>
                    {order.items.map(item => (
                      <div key={item.id}>
                        - {item.product_name} x{item.quantity} = KSh {(item.price * item.quantity).toFixed(2)}
                      </div>
                    ))}
                  </div>

                  <div className="order-actions">
                    {!order.driver_id && order.status === 'pending' && (
                      <select onChange={(e) => handleAssignDriver(order.id, e.target.value)} defaultValue="">
                        <option value="" disabled>Assign Driver</option>
                        {drivers.filter(d => d.status === 'active').map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} ({driver.driver_number})
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {order.status !== 'delivered' && (
                      <select onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} defaultValue="">
                        <option value="" disabled>Update Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRIVERS TAB */}
        {activeTab === 'drivers' && (
          <div className="drivers-section">
            <div className="driver-form-card">
              <h2>Add New Driver</h2>
              <form onSubmit={handleAddDriver}>
                <input
                  type="text"
                  placeholder="Driver Name"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password (for driver login)"
                  value={driverForm.password}
                  onChange={(e) => setDriverForm({...driverForm, password: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Vehicle Type"
                  value={driverForm.vehicle}
                  onChange={(e) => setDriverForm({...driverForm, vehicle: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="License Plate"
                  value={driverForm.license_plate}
                  onChange={(e) => setDriverForm({...driverForm, license_plate: e.target.value})}
                />
                <button type="submit" disabled={loading}>Add Driver</button>
              </form>
            </div>

            <div className="drivers-list">
              <h2>All Drivers ({drivers.length})</h2>
              <div className="drivers-grid">
                {drivers.map(driver => (
                  <div key={driver.id} className={`driver-card ${driver.status}`}>
                    <h3>{driver.name}</h3>
                    <p><strong>ID:</strong> {driver.driver_number}</p>
                    <p><strong>Phone:</strong> {driver.phone}</p>
                    <p><strong>Vehicle:</strong> {driver.vehicle || 'N/A'}</p>
                    <p><strong>License:</strong> {driver.license_plate || 'N/A'}</p>
                    <p><strong>Deliveries:</strong> {driver.total_deliveries}</p>
                    <p><strong>Earnings:</strong> KSh {driver.total_earnings.toFixed(2)}</p>
                    <p><strong>Status:</strong> {driver.status}</p>
                    <div className="driver-actions">
                      <button onClick={() => viewDriverEarnings(driver.id)}>View Details</button>
                      {driver.status === 'active' && (
                        <button onClick={() => handleRemoveDriver(driver.id)} className="delete-btn">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <div className="feedback-section">
            <h2>Customer Feedback ({feedback.length})</h2>
            <div className="feedback-list">
              {feedback.map(item => (
                <div key={item.id} className={`feedback-card ${item.status}`}>
                  <div className="feedback-header">
                    <h3>{item.type.toUpperCase()}</h3>
                    <span className={`status ${item.status}`}>{item.status}</span>
                  </div>
                  <p><strong>From:</strong> {item.name || item.username || 'Anonymous'}</p>
                  <p><strong>Email:</strong> {item.email || item.user_email || 'N/A'}</p>
                  <p><strong>Message:</strong> {item.message}</p>
                  <p><strong>Date:</strong> {new Date(item.created_at).toLocaleString()}</p>
                  
                  {item.status === 'pending' && (
                    <div className="feedback-actions">
                      <button onClick={() => handleUpdateFeedbackStatus(item.id, 'reviewed')}>
                        Mark as Reviewed
                      </button>
                      <button onClick={() => handleUpdateFeedbackStatus(item.id, 'resolved')}>
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="applications-section">
            <h2>Driver Applications ({applications.length})</h2>
            <div className="applications-list">
              {applications.map(app => (
                <div key={app.id} className={`application-card ${app.status}`}>
                  <div className="app-header">
                    <h3>{app.name}</h3>
                    <span className={`status ${app.status}`}>{app.status}</span>
                  </div>
                  <p><strong>Email:</strong> {app.email}</p>
                  <p><strong>Phone:</strong> {app.phone}</p>
                  <p><strong>Vehicle:</strong> {app.vehicle || 'N/A'}</p>
                  <p><strong>License:</strong> {app.license_plate || 'N/A'}</p>
                  <p><strong>Experience:</strong> {app.experience || 'N/A'}</p>
                  <p><strong>Applied:</strong> {new Date(app.created_at).toLocaleString()}</p>
                  
                  {app.status === 'pending' && (
                    <div className="app-actions">
                      <button onClick={() => handleApproveApplication(app.id)} className="approve-btn">
                        Approve & Create Driver
                      </button>
                      <button onClick={() => handleRejectApplication(app.id)} className="reject-btn">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;