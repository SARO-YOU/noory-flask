import { useState } from 'react';
import './FeedbackForm.css';

function FeedbackForm({ onClose, user }) {
  const [type, setType] = useState('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here we'll send to backend later
    console.log('Feedback submitted:', {
      type,
      subject,
      message,
      user: user?.username || 'Guest'
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (success) {
    return (
      <div className="feedback-overlay" onClick={onClose}>
        <div className="feedback-modal success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon">✅</div>
          <h2>Thank You!</h2>
          <p>Your {type} has been submitted successfully.</p>
          <p>We'll review it shortly!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h2>💬 Send Feedback</h2>
        <p className="feedback-subtitle">We'd love to hear from you!</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="feedback-select"
            >
              <option value="suggestion">💡 Suggestion</option>
              <option value="complaint">😞 Complaint</option>
              <option value="compliment">😊 Compliment</option>
              <option value="question">❓ Question</option>
            </select>
          </div>

          <div className="input-group">
            <label>Subject</label>
            <input
              type="text"
              placeholder="Brief subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="feedback-input"
              required
            />
          </div>

          <div className="input-group">
            <label>Message</label>
            <textarea
              placeholder="Tell us more..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="feedback-textarea"
              rows="6"
              required
            />
          </div>
          
          <button type="submit" className="feedback-submit-btn">
            Send Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;