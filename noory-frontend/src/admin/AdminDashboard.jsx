import { useState } from 'react';
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
  return (
    <div>
      <h2>📦 Product Management</h2>
      <p>Product management features coming next...</p>
    </div>
  );
}

// Orders Tab
function OrdersTab() {
  return (
    <div>
      <h2>🛒 Orders Management</h2>
      <p>Orders management coming next...</p>
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
  return (
    <div>
      <h2>🚗 Drivers</h2>
      <p>Driver management coming next...</p>
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