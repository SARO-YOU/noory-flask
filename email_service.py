import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Email configuration - Use Gmail SMTP
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = os.environ.get('EMAIL_USER', 'nooriyshop@gmail.com')
SENDER_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')  # App-specific password
SHOP_NAME = 'NOORIY Shop'

def send_email(to_email, subject, html_content):
    """Send an email using Gmail SMTP"""
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f'{SHOP_NAME} <{SENDER_EMAIL}>'
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f'✅ Email sent to {to_email}')
        return True
    except Exception as e:
        print(f'❌ Email error: {str(e)}')
        return False

def send_registration_email(user_email, username):
    """Send welcome email after registration"""
    subject = f'Welcome to {SHOP_NAME}! 🎉'
    
    html_content = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛍️ Welcome to {SHOP_NAME}!</h1>
            </div>
            <div class="content">
                <h2>Hello {username}! 👋</h2>
                <p>Thank you for registering with {SHOP_NAME}. We're excited to have you as part of our community!</p>
                
                <p><strong>Your account is now active and ready to use.</strong></p>
                
                <p>You can now:</p>
                <ul>
                    <li>✅ Browse our wide selection of products</li>
                    <li>✅ Add items to your cart</li>
                    <li>✅ Place orders with fast delivery</li>
                    <li>✅ Track your orders in real-time</li>
                </ul>
                
                <a href="https://shop.nooreyshop.abrdns.com" class="button">Start Shopping Now</a>
                
                <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
                
                <p>Happy shopping! 🎉</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 {SHOP_NAME}. All rights reserved.</p>
                <p>Nairobi, Kenya</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    return send_email(user_email, subject, html_content)

def send_order_confirmation_email(user_email, username, order_id, total_amount, items):
    """Send order confirmation email"""
    subject = f'Order Confirmation #{order_id} - {SHOP_NAME} 📦'
    
    # Build items list HTML
    items_html = ''
    for item in items:
        items_html += f'''
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{item['name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">{item['quantity']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">KSh {item['price']:.2f}</td>
        </tr>
        '''
    
    html_content = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .order-details {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
            table {{ width: 100%; border-collapse: collapse; }}
            .total {{ font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📦 Order Confirmed!</h1>
                <p style="margin: 0; font-size: 18px;">Order #{order_id}</p>
            </div>
            <div class="content">
                <h2>Thank you for your order, {username}! 🎉</h2>
                <p>We've received your order and it's being processed. You'll receive another email when your order is out for delivery.</p>
                
                <div class="order-details">
                    <h3>Order Details:</h3>
                    <table>
                        <thead>
                            <tr style="background: #f0f0f0;">
                                <th style="padding: 10px; text-align: left;">Item</th>
                                <th style="padding: 10px; text-align: center;">Quantity</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        Total: KSh {total_amount:.2f}
                    </div>
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ul>
                    <li>✅ Your order is being prepared</li>
                    <li>📱 You'll receive updates via email</li>
                    <li>🚚 Delivery typically takes 1-2 business days</li>
                </ul>
                
                <p style="margin-top: 30px;">Thank you for shopping with {SHOP_NAME}!</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 {SHOP_NAME}. All rights reserved.</p>
                <p>Nairobi, Kenya</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    return send_email(user_email, subject, html_content)

def send_order_status_update_email(user_email, username, order_id, new_status):
    """Send email when order status changes"""
    status_messages = {
        'pending': 'Your order is being processed',
        'confirmed': 'Your order has been confirmed! 🎉',
        'out_for_delivery': 'Your order is out for delivery! 🚚',
        'delivered': 'Your order has been delivered! ✅',
        'cancelled': 'Your order has been cancelled'
    }
    
    subject = f'Order #{order_id} - {status_messages.get(new_status, "Status Update")}'
    
    html_content = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .status-badge {{ display: inline-block; padding: 10px 20px; background: #667eea; color: white; border-radius: 20px; font-weight: bold; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Update - #{order_id}</h1>
            </div>
            <div class="content">
                <h2>Hello {username}! 👋</h2>
                
                <p>Your order status has been updated:</p>
                
                <div class="status-badge">{new_status.replace('_', ' ').upper()}</div>
                
                <p><strong>{status_messages.get(new_status, f'Status: {new_status}')}</strong></p>
                
                {
                    '<p>Your order is on its way! Our driver will contact you shortly.</p>' if new_status == 'out_for_delivery' 
                    else '<p>Thank you for shopping with us! We hope you enjoy your purchase.</p>' if new_status == 'delivered'
                    else '<p>We\'ll keep you updated on your order progress.</p>'
                }
                
                <p style="margin-top: 30px;">Thank you for choosing {SHOP_NAME}!</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 {SHOP_NAME}. All rights reserved.</p>
                <p>Nairobi, Kenya</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    return send_email(user_email, subject, html_content)