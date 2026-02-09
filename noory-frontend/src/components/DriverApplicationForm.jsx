import { useState } from 'react';
import './DriverApplicationForm.css';

function DriverApplicationForm({ onClose, user }) {
  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    phone: '',
    email: '',
    idNumber: '',
    vehicleType: 'motorcycle',
    vehicleRegistration: '',
    licenseNumber: '',
    experience: '',
    availability: 'fulltime'
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://noory-backend.onrender.com/api/driver-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="driver-app-overlay" onClick={onClose}>
        <div className="driver-app-modal success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon">✅</div>
          <h2>Application Submitted!</h2>
          <p>Thank you for applying to be a driver with NOORIY!</p>
          <p>We'll review your application and contact you within 2-3 business days.</p>
          <p className="next-steps">📧 Check your email for updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-app-overlay" onClick={onClose}>
      <div className="driver-app-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h2>🚗 Driver Application</h2>
        <p className="driver-app-subtitle">Join our delivery team!</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="input-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="driver-input"
                required
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0712345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="driver-input"
                  required
                />
              </div>

              <div className="input-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="driver-input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>ID Number *</label>
              <input
                type="text"
                name="idNumber"
                placeholder="12345678"
                value={formData.idNumber}
                onChange={handleChange}
                className="driver-input"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Vehicle Information</h3>
            
            <div className="input-group">
              <label>Vehicle Type *</label>
              <select 
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="driver-select"
              >
                <option value="motorcycle">🏍️ Motorcycle</option>
                <option value="car">🚗 Car</option>
                <option value="van">🚐 Van</option>
                <option value="bicycle">🚲 Bicycle</option>
              </select>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Vehicle Registration *</label>
                <input
                  type="text"
                  name="vehicleRegistration"
                  placeholder="KXX 123X"
                  value={formData.vehicleRegistration}
                  onChange={handleChange}
                  className="driver-input"
                  required
                />
              </div>

              <div className="input-group">
                <label>License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="License number"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="driver-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Experience & Availability</h3>
            
            <div className="input-group">
              <label>Delivery Experience</label>
              <textarea
                name="experience"
                placeholder="Tell us about your delivery experience (optional)"
                value={formData.experience}
                onChange={handleChange}
                className="driver-textarea"
                rows="3"
              />
            </div>

            <div className="input-group">
              <label>Availability *</label>
              <select 
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="driver-select"
              >
                <option value="fulltime">⏰ Full Time (8+ hours/day)</option>
                <option value="parttime">🕐 Part Time (4-8 hours/day)</option>
                <option value="weekends">📅 Weekends Only</option>
                <option value="flexible">🔄 Flexible Schedule</option>
              </select>
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="driver-submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DriverApplicationForm;