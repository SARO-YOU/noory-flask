import React, { useState } from 'react';
import './DriverApplicationForm.css';

const DriverApplicationForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    license_plate: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_URL = 'https://noory-backend.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/driver-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="driver-app-overlay" onClick={onClose}>
        <div className="driver-app-modal success-modal" onClick={(e) => e.stopPropagation()}>
          <h2>🎉 Application Submitted!</h2>
          <p>Thank you for applying to be a NOORIY driver!</p>
          <p>Our admin team will review your application and contact you via email if you're selected.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>✅ Admin reviews your application</li>
            <li>✅ You'll receive an email with your driver credentials</li>
            <li>✅ Login with your driver number and password</li>
            <li>✅ Start delivering and earning!</li>
          </ul>
          <button onClick={onClose} className="close-success-btn">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-app-overlay" onClick={onClose}>
      <div className="driver-app-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>🚗 Apply to be a Driver</h2>
        <p>Join our team of NOORIY delivery drivers and earn money on your schedule!</p>
        
        <div className="benefits">
          <h3>Benefits:</h3>
          <ul>
            <li>💰 Earn 30% commission on each delivery</li>
            <li>📅 Flexible working hours</li>
            <li>📱 Easy-to-use driver app</li>
            <li>🎯 Track your earnings in real-time</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="+254 700 000 000"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Vehicle Type</label>
            <input
              type="text"
              name="vehicle"
              placeholder="e.g., Motorcycle, Car, Bicycle"
              value={formData.vehicle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>License Plate Number</label>
            <input
              type="text"
              name="license_plate"
              placeholder="e.g., KAA 123A"
              value={formData.license_plate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Delivery Experience</label>
            <textarea
              name="experience"
              placeholder="Tell us about your delivery experience (optional)"
              value={formData.experience}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverApplicationForm;