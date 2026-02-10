import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'suggestion',
    message: '',
    name: user?.username || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_URL = 'https://noory-backend.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        alert(data.message || 'Failed to send feedback');
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
      <div className="feedback-overlay" onClick={onClose}>
        <div className="feedback-modal success-modal" onClick={(e) => e.stopPropagation()}>
          <h2>✅ Thank You!</h2>
          <p>Your feedback has been sent to our team.</p>
          <p>We appreciate your input and will review it soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>💬 Send Feedback</h2>
        <p>We value your feedback! Let us know your thoughts, suggestions, or concerns.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Feedback Type</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              required
            >
              <option value="suggestion">💡 Suggestion</option>
              <option value="complaint">😟 Complaint</option>
              <option value="remark">💭 General Remark</option>
              <option value="praise">⭐ Praise</option>
            </select>
          </div>

          {!user && (
            <>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Your Message</label>
            <textarea
              name="message"
              placeholder="Tell us what's on your mind..."
              value={formData.message}
              onChange={handleChange}
              rows="6"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;