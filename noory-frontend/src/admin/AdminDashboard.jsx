import { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <h1>👑 NOORIY Admin Dashboard</h1>
        <div className="admin-header-actions">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button 
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders
        </button>
        <button 
          className={`nav-tab ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          🚗 Delivery Zones
        </button>
        <button 
          className={`nav-tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          👥 Customers
        </button>
        <button 
          className={`nav-tab ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          🚗 Drivers
        </button>
        <button 
          className={`nav-tab ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          💬 Feedback
        </button>
      </nav>

      {/* Content Area */}
      <main className="admin-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'delivery' && <DeliveryZonesTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'drivers' && <DriversTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
      </main>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  return (
    <div className="overview-tab">
      <h2>📊 Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Earnings</h3>
            <p className="stat-value">KSh 0</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Products</h3>
            <p className="stat-value">120</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Customers</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delivery Zones Tab
function DeliveryZonesTab() {
  const [zones, setZones] = useState([
    {
      id: 1,
      name: 'Zone 1 - Easy Areas',
      areas: ['Westlands', 'Parklands', 'Kilimani', 'Kileleshwa', 'Lavington', 'Riverside', 'Hurlingham', 'Upper Hill', 'CBD'],
      customerFee: 100,
      driverEarnings: 40,
      companyEarnings: 60,
      color: '#27ae60'
    },
    {
      id: 2,
      name: 'Zone 2 - Medium Areas',
      areas: ['Gigiri', 'Runda', 'Muthaiga', 'Kitisuru', 'Karen', 'Langata', 'South B', 'South C', 'Eastleigh', 'Mathare'],
      customerFee: 130,
      driverEarnings: 50,
      companyEarnings: 80,
      color: '#f39c12'
    },
    {
      id: 3,
      name: 'Zone 3 - Far Areas',
      areas: ['Roysambu', 'Kasarani', 'Ruiru', 'Ongata Rongai', 'Syokimau', 'Kitengela', 'Kikuyu', 'Ngong'],
      customerFee: 210,
      driverEarnings: 80,
      companyEarnings: 130,
      color: '#e74c3c'
    }
  ]);

  const [perKmRate, setPerKmRate] = useState(20);
  const [editingZone, setEditingZone] = useState(null);

  const handleSaveZone = (zoneId, updates) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, ...updates } : zone
    ));
    setEditingZone(null);
  };

  return (
    <div className="delivery-zones-tab">
      <div className="tab-header">
        <h2>🚗 Delivery Zones Management</h2>
        <p>Configure delivery fees and driver earnings for different zones</p>
      </div>

      <div className="km-rate-setting">
        <label>
          <strong>Extra Distance Rate:</strong> KSh 
          <input 
            type="number" 
            value={perKmRate} 
            onChange={(e) => setPerKmRate(Number(e.target.value))}
            className="km-rate-input"
          />
          per kilometer
        </label>
      </div>

      <div className="zones-grid">
        {zones.map(zone => (
          <div key={zone.id} className="zone-card" style={{ borderLeftColor: zone.color }}>
            <div className="zone-header">
              <h3>{zone.name}</h3>
              <button 
                className="edit-zone-btn"
                onClick={() => setEditingZone(editingZone === zone.id ? null : zone.id)}
              >
                {editingZone === zone.id ? '✅ Save' : '✏️ Edit'}
              </button>
            </div>

            <div className="zone-areas">
              <strong>Areas:</strong>
              <div className="areas-list">
                {zone.areas.map((area, idx) => (
                  <span key={idx} className="area-tag">{area}</span>
                ))}
              </div>
            </div>

            {editingZone === zone.id ? (
              <div className="zone-edit">
                <div className="fee-input">
                  <label>Customer Pays:</label>
                  <input 
                    type="number" 
                    defaultValue={zone.customerFee}
                    onChange={(e) => {
                      const customerFee = Number(e.target.value);
                      handleSaveZone(zone.id, { customerFee });
                    }}
                  />
                </div>
                <div className="fee-input">
                  <label>Driver Gets:</label>
                  <input 
                    type="number" 
                    defaultValue={zone.driverEarnings}
                    onChange={(e) => {
                      const driverEarnings = Number(e.target.value);
                      const companyEarnings = zone.customerFee - driverEarnings;
                      handleSaveZone(zone.id, { driverEarnings, companyEarnings });
                    }}
                  />
                </div>
                <div className="fee-input">
                  <label>Company Gets:</label>
                  <input 
                    type="number" 
                    value={zone.companyEarnings}
                    disabled
                  />
                </div>
              </div>
            ) : (
              <div className="zone-fees">
                <div className="fee-item">
                  <span className="fee-label">Customer Pays:</span>
                  <span className="fee-value">KSh {zone.customerFee}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-label">Driver Gets:</span>
                  <span className="fee-value driver">KSh {zone.driverEarnings}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-label">Company Gets:</span>
                  <span className="fee-value company">KSh {zone.companyEarnings}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="zone-info-box">
        <h4>ℹ️ How Delivery Fees Work</h4>
        <ul>
          <li>Base delivery fee depends on customer's zone</li>
          <li>Extra KSh {perKmRate} per kilometer beyond base distance</li>
          <li>Driver gets their share automatically</li>
          <li>Company gets the remaining amount</li>
          <li>All drivers in the zone receive order notifications</li>
          <li>First driver to accept gets the delivery</li>
        </ul>
      </div>
    </div>
  );
}

// Products Tab
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'dairy',
    in_stock: true,
    image_url: ''
  });

  const categories = [
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'pantry', name: 'Pantry', icon: '🌾' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'snacks', name: 'Snacks', icon: '🍪' },
    { id: 'personal_care', name: 'Personal Care', icon: '🧴' },
    { id: 'household', name: 'Household', icon: '🧹' }
  ];

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://noory-backend.onrender.com/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add new product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in product name and price!');
      return;
    }

    try {
      const response = await fetch('https://noory-backend.onrender.com/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price),
          category: newProduct.category,
          in_stock: newProduct.in_stock,
          image_url: newProduct.image_url
        })
      });

      if (response.ok) {
        const savedProduct = await response.json();
        setProducts([...products, savedProduct]);
        setShowAddForm(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: 'dairy',
          in_stock: true,
          image_url: ''
        });
        alert('Product added successfully!');
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Network error. Please try again.');
    }
  };

  // Update product
  const handleUpdateProduct = async (productId, updates) => {
    try {
      const response = await fetch(`https://noory-backend.onrender.com/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === productId ? updatedProduct : p));
        setEditingProduct(null);
        alert('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`https://noory-backend.onrender.com/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
        alert('Product deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="products-tab">
      <div className="tab-header">
        <h2>📦 Product Management</h2>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '❌ Cancel' : '➕ Add New Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="add-product-form">
          <h3>Add New Product</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                placeholder="e.g., Fresh Milk 1L"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Price (KSh) *</label>
              <input
                type="number"
                placeholder="150"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>In Stock</label>
              <select
                value={newProduct.in_stock}
                onChange={(e) => setNewProduct({...newProduct, in_stock: e.target.value === 'true'})}
              >
                <option value="true">✅ Yes</option>
                <option value="false">❌ No</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
              />
              <small>Paste image URL from Google Images or your hosting</small>
              {newProduct.image_url && (
                <img 
                  src={newProduct.image_url} 
                  alt="Preview" 
                  className="image-preview"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                placeholder="Product description..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                rows="3"
              />
            </div>
          </div>

          <button className="save-product-btn" onClick={handleAddProduct}>
            💾 Add Product
          </button>
        </div>
      )}

      {/* Products List */}
      <div className="products-list">
        <h3>All Products ({products.length})</h3>
        
        {products.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card-admin">
                {editingProduct === product.id ? (
                  // Edit Mode
                  <div className="product-edit">
                    <div className="edit-form">
                      <label>Product Name</label>
                      <input
                        type="text"
                        defaultValue={product.name}
                        onChange={(e) => product._tempName = e.target.value}
                        className="edit-input"
                      />
                      
                      <label>Description</label>
                      <textarea
                        defaultValue={product.description}
                        onChange={(e) => product._tempDesc = e.target.value}
                        className="edit-input"
                        rows="2"
                      />
                      
                      <label>Price (KSh)</label>
                      <input
                        type="number"
                        defaultValue={product.price}
                        onChange={(e) => product._tempPrice = e.target.value}
                        className="edit-input"
                      />
                      
                      <label>Category</label>
                      <select
                        defaultValue={product.category}
                        onChange={(e) => product._tempCategory = e.target.value}
                        className="edit-input"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      
                      <label>Stock Status</label>
                      <select
                        defaultValue={product.in_stock}
                        onChange={(e) => product._tempStock = e.target.value === 'true'}
                        className="edit-input"
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                      
                      <label>Image URL</label>
                      <input
                        type="url"
                        defaultValue={product.image_url}
                        onChange={(e) => product._tempImage = e.target.value}
                        className="edit-input"
                        placeholder="https://example.com/image.jpg"
                      />
                      
                      {(product._tempImage || product.image_url) && (
                        <img 
                          src={product._tempImage || product.image_url} 
                          alt="Preview" 
                          className="image-preview-edit"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                    
                    <div className="edit-actions">
                      <button 
                        className="save-edit-btn"
                        onClick={() => handleUpdateProduct(product.id, {
                          name: product._tempName || product.name,
                          description: product._tempDesc || product.description,
                          price: Number(product._tempPrice || product.price),
                          category: product._tempCategory || product.category,
                          in_stock: product._tempStock !== undefined ? product._tempStock : product.in_stock,
                          image_url: product._tempImage !== undefined ? product._tempImage : product.image_url
                        })}
                      >
                        ✅ Save Changes
                      </button>
                      <button 
                        className="cancel-edit-btn"
                        onClick={() => setEditingProduct(null)}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    {product.image_url && (
                      <div className="product-image-container">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="product-image"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    
                    <div className="product-header">
                      <h4>{product.name}</h4>
                      <span className={`stock-badge ${product.in_stock ? 'in-stock' : 'out-stock'}`}>
                        {product.in_stock ? '✅ In Stock' : '❌ Out of Stock'}
                      </span>
                    </div>
                    
                    <p className="product-desc">{product.description}</p>
                    
                    <div className="product-info">
                      <span className="product-category">
                        {categories.find(c => c.id === product.category)?.icon} {product.category}
                      </span>
                      <span className="product-price">KSh {product.price}</span>
                    </div>

                    <div className="product-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => setEditingProduct(product.id)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Orders Tab
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [assigningOrder, setAssigningOrder] = useState(null);

  // Fetch functions
  const fetchOrders = async () => {
    try {
      const response = await fetch('https://noory-backend.onrender.com/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://noory-backend.onrender.com/api/admin/drivers');
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  // Fetch orders and drivers on mount
  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const handleAssignDriver = async (orderId, driverNumber) => {
    try {
      const response = await fetch(`https://noory-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_assigned: driverNumber,
          status: 'assigned'
        })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(o => o.order_id === orderId ? updatedOrder.order : o));
        setAssigningOrder(null);
        alert(`Order assigned to ${driverNumber}`);
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://noory-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(o => o.order_id === orderId ? updatedOrder.order : o));
        alert(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      assigned: '#3498db',
      picked_up: '#9b59b6',
      delivered: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="orders-tab">
      <div className="tab-header">
        <h2>🛒 Orders Management</h2>
        <div className="orders-stats">
          <span className="stat-badge">Total: {orders.length}</span>
          <span className="stat-badge pending">Pending: {orders.filter(o => o.status === 'pending').length}</span>
          <span className="stat-badge assigned">Assigned: {orders.filter(o => o.status === 'assigned').length}</span>
          <span className="stat-badge delivered">Delivered: {orders.filter(o => o.status === 'delivered').length}</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Orders
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilterStatus('assigned')}
        >
          Assigned
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'picked_up' ? 'active' : ''}`}
          onClick={() => setFilterStatus('picked_up')}
        >
          Picked Up
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilterStatus('delivered')}
        >
          Delivered
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet. Orders will appear here when customers place them!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order.order_id} className="order-card">
                <div className="order-header">
                  <h4>{order.order_id}</h4>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="order-customer">
                  <p><strong>👤 Customer:</strong> {order.customer_name}</p>
                  <p><strong>📱 Phone:</strong> {order.phone}</p>
                  <p><strong>📍 Address:</strong> {order.address}</p>
                  <p><strong>🗺️ Zone:</strong> {order.delivery_zone}</p>
                </div>

                <div className="order-items">
                  <strong>📦 Items:</strong>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x{item.quantity} - KSh {item.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-totals">
                  <p><strong>Subtotal:</strong> KSh {order.subtotal}</p>
                  <p><strong>Delivery:</strong> KSh {order.delivery_fee}</p>
                  <p className="total"><strong>TOTAL:</strong> KSh {order.total}</p>
                  <p><strong>Payment:</strong> {order.payment_method.toUpperCase()}</p>
                </div>

                {order.delivery_notes && (
                  <div className="order-notes">
                    <strong>📝 Notes:</strong> {order.delivery_notes}
                  </div>
                )}

                <div className="order-driver">
                  {order.driver_assigned ? (
                    <p><strong>🚗 Driver:</strong> {order.driver_assigned}</p>
                  ) : (
                    <p className="no-driver">⚠️ No driver assigned</p>
                  )}
                </div>

                <div className="order-actions">
                  {/* Assign Driver */}
                  {order.status === 'pending' && (
                    <div className="assign-driver-section">
                      {assigningOrder === order.order_id ? (
                        <div className="driver-select">
                          <select 
                            onChange={(e) => handleAssignDriver(order.order_id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>Select Driver...</option>
                            {drivers.map(driver => (
                              <option key={driver.id} value={driver.driverNumber}>
                                {driver.driverNumber} - {driver.name}
                              </option>
                            ))}
                          </select>
                          <button 
                            className="cancel-assign-btn"
                            onClick={() => setAssigningOrder(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="assign-btn"
                          onClick={() => setAssigningOrder(order.order_id)}
                        >
                          🚗 Assign Driver
                        </button>
                      )}
                    </div>
                  )}

                  {/* Status Update Buttons */}
                  <div className="status-buttons">
                    {order.status === 'assigned' && (
                      <button 
                        className="status-btn picked-up"
                        onClick={() => handleUpdateStatus(order.order_id, 'picked_up')}
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {order.status === 'picked_up' && (
                      <button 
                        className="status-btn delivered"
                        onClick={() => handleUpdateStatus(order.order_id, 'delivered')}
                      >
                        Mark Delivered
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'assigned') && (
                      <button 
                        className="status-btn cancelled"
                        onClick={() => handleUpdateStatus(order.order_id, 'cancelled')}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="order-time">
                  <small>🕐 Placed: {new Date(order.created_at).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Customers Tab
function CustomersTab() {
  return (
    <div>
      <h2>👥 Customers</h2>
      <p>Customer records coming next...</p>
    </div>
  );
}

// Drivers Tab
function DriversTab() {
  const [drivers, setDrivers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDriver, setNewDriver] = useState({
    driverNumber: '',
    name: '',
    phone: '',
    vehicleType: 'motorcycle',
    vehicleReg: '',
    secretKey: ''
  });

  const getNextDriverNumber = () => {
    if (drivers.length === 0) return 'DRIVER1';
    const numbers = drivers.map(d => parseInt(d.driverNumber.replace('DRIVER', '')));
    const maxNumber = Math.max(...numbers);
    return `DRIVER${maxNumber + 1}`;
  };

  const handleCreateDriver = async () => {
    const driverNumber = getNextDriverNumber();
    
    if (!newDriver.name || !newDriver.phone || !newDriver.secretKey) {
      alert('Please fill in all required fields!');
      return;
    }

    if (newDriver.secretKey.length < 6) {
      alert('Secret key must be at least 6 characters!');
      return;
    }

    const driverData = {
      driverNumber: driverNumber,
      name: newDriver.name,
      phone: newDriver.phone,
      vehicleType: newDriver.vehicleType,
      vehicleReg: newDriver.vehicleReg,
      secretKey: newDriver.secretKey,
      fullPassword: `${driverNumber}-${newDriver.secretKey}`,
      createdAt: new Date().toISOString(),
      totalEarnings: 0,
      completedDeliveries: 0
    };

    try {
      const response = await fetch('https://noory-backend.onrender.com/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
      });

      if (response.ok) {
        const savedDriver = await response.json();
        setDrivers([...drivers, savedDriver]);
        setShowCreateForm(false);
        setNewDriver({
          driverNumber: '',
          name: '',
          phone: '',
          vehicleType: 'motorcycle',
          vehicleReg: '',
          secretKey: ''
        });
        alert(`Driver created! Login credential: ${driverNumber}-${newDriver.secretKey}`);
      } else {
        alert('Failed to create driver');
      }
    } catch (error) {
      console.error('Error creating driver:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      const response = await fetch(`https://noory-backend.onrender.com/api/admin/drivers/${driverId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDrivers(drivers.filter(d => d.id !== driverId));
        alert('Driver deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  // Fetch drivers on mount
  useEffect(() => {
    fetch('https://noory-backend.onrender.com/api/admin/drivers')
      .then(res => res.json())
      .then(data => setDrivers(data))
      .catch(err => console.error('Error fetching drivers:', err));
  }, []);

  return (
    <div className="drivers-tab">
      <div className="tab-header">
        <h2>🚗 Driver Management</h2>
        <button 
          className="create-driver-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '❌ Cancel' : '➕ Create New Driver'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-driver-form">
          <h3>Create New Driver Account</h3>
          <p className="next-driver-number">Next Driver Number: <strong>{getNextDriverNumber()}</strong></p>

          <div className="form-grid">
            <div className="form-group">
              <label>Driver Name *</label>
              <input
                type="text"
                placeholder="Full name"
                value={newDriver.name}
                onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                placeholder="0712345678"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type *</label>
              <select
                value={newDriver.vehicleType}
                onChange={(e) => setNewDriver({...newDriver, vehicleType: e.target.value})}
              >
                <option value="motorcycle">🏍️ Motorcycle</option>
                <option value="car">🚗 Car</option>
                <option value="bicycle">🚲 Bicycle</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vehicle Registration</label>
              <input
                type="text"
                placeholder="KAA 123B"
                value={newDriver.vehicleReg}
                onChange={(e) => setNewDriver({...newDriver, vehicleReg: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Driver's Secret Key * (min 6 characters)</label>
              <input
                type="text"
                placeholder="Driver creates their own password"
                value={newDriver.secretKey}
                onChange={(e) => setNewDriver({...newDriver, secretKey: e.target.value})}
              />
              <small>This will be used after the hyphen: {getNextDriverNumber()}-secretkey</small>
            </div>
          </div>

          <button className="save-driver-btn" onClick={handleCreateDriver}>
            💾 Create Driver Account
          </button>
        </div>
      )}

      <div className="drivers-list">
        <h3>All Drivers ({drivers.length})</h3>
        
        {drivers.length === 0 ? (
          <div className="empty-state">
            <p>No drivers yet. Create your first driver account!</p>
          </div>
        ) : (
          <div className="drivers-grid">
            {drivers.map(driver => (
              <div key={driver.id} className="driver-card">
                <div className="driver-header">
                  <h4>{driver.name}</h4>
                  <span className="driver-badge">{driver.driverNumber}</span>
                </div>

                <div className="driver-info">
                  <p>📱 {driver.phone}</p>
                  <p>🚗 {driver.vehicleType} {driver.vehicleReg && `- ${driver.vehicleReg}`}</p>
                  <p>🔑 Login: <code>{driver.fullPassword}</code></p>
                </div>

                <div className="driver-stats">
                  <div className="stat">
                    <span className="stat-label">Deliveries:</span>
                    <span className="stat-value">{driver.completedDeliveries || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Earnings:</span>
                    <span className="stat-value">KSh {driver.totalEarnings || 0}</span>
                  </div>
                </div>

                <button 
                  className="delete-driver-btn"
                  onClick={() => handleDeleteDriver(driver.id)}
                >
                  🗑️ Delete Driver
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Feedback Tab
function FeedbackTab() {
  return (
    <div>
      <h2>💬 Feedback & Applications</h2>
      <p>Suggestions, complaints, and driver applications coming next...</p>
    </div>
  );
}

export default AdminDashboard;