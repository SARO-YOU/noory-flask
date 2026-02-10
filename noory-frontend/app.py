from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os
import sys
import logging
import secrets
import string
from datetime import datetime, timedelta

# Suppress Flask/Werkzeug startup messages
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
cli = sys.modules['flask.cli']
cli.show_server_banner = lambda *x: None

app = Flask(__name__)
CORS(app)

# Import email service (with fallback if not available)
try:
    from email_service import (
        send_registration_email, 
        send_order_confirmation_email,
        send_order_status_update_email
    )
    EMAIL_ENABLED = True
    print('✅ Email service loaded successfully')
except ImportError as e:
    print(f'⚠️ Email service not available: {str(e)}')
    EMAIL_ENABLED = False
    # Create dummy functions
    def send_registration_email(*args, **kwargs):
        return False
    def send_order_confirmation_email(*args, **kwargs):
        return False
    def send_order_status_update_email(*args, **kwargs):
        return False

# Constants
DATABASE = 'nooriy.db'
DELIVERY_FEE = 50  # KSh 50 delivery fee
DRIVER_COMMISSION = 0.30  # Driver gets 30% of delivery fee

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        
        # Users table
        db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Products table
        db.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                image TEXT,
                stock INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Orders table
        db.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total_amount REAL NOT NULL,
                delivery_fee REAL DEFAULT 50,
                status TEXT DEFAULT 'pending',
                driver_id INTEGER,
                payment_status TEXT DEFAULT 'pending',
                mpesa_code TEXT,
                customer_confirmed INTEGER DEFAULT 0,
                driver_confirmed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                delivered_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (driver_id) REFERENCES drivers (id)
            )
        ''')
        
        # Order items table
        db.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders (id),
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        ''')
        
        # Drivers table
        db.execute('''
            CREATE TABLE IF NOT EXISTS drivers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                driver_number TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                password TEXT NOT NULL,
                vehicle TEXT,
                license_plate TEXT,
                status TEXT DEFAULT 'active',
                total_earnings REAL DEFAULT 0,
                total_deliveries INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Feedback table
        db.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                email TEXT,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Driver applications table
        db.execute('''
            CREATE TABLE IF NOT EXISTS driver_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                vehicle TEXT,
                license_plate TEXT,
                experience TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Password reset tokens table
        db.execute('''
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.commit()

# Initialize database on startup
init_db()

# ==================== AUTH ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        address = data.get('address')
        
        if not all([username, email, password]):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        db = get_db()
        try:
            db.execute(
                'INSERT INTO users (username, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
                (username, email, hashed_password, phone, address)
            )
            db.commit()
            
            # Send registration email
            if EMAIL_ENABLED:
                try:
                    send_registration_email(email, username)
                    print(f'✅ Registration email sent to {email}')
                except Exception as e:
                    print(f'⚠️ Email sending failed: {str(e)}')
            
            return jsonify({'message': 'Registration successful'}), 201
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Username or email already exists'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        db = get_db()
        user = db.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            (username, hashed_password)
        ).fetchone()
        
        if user:
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'address': user['address'],
                    'role': 'user'
                }
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        email = data.get('email')
        
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        
        if not user:
            return jsonify({'message': 'Email not found'}), 404
        
        # Generate reset token (6-digit code)
        token = ''.join(secrets.choice(string.digits) for _ in range(6))
        expires_at = datetime.now() + timedelta(hours=1)
        
        db.execute(
            'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
            (email, token, expires_at)
        )
        db.commit()
        
        # TODO: Send email with reset code
        print(f'Password reset code for {email}: {token}')
        
        return jsonify({'message': 'Reset code sent to your email'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        email = data.get('email')
        token = data.get('token')
        new_password = data.get('new_password')
        
        db = get_db()
        
        # Verify token
        reset_token = db.execute(
            'SELECT * FROM password_reset_tokens WHERE email = ? AND token = ? AND used = 0 AND expires_at > ?',
            (email, token, datetime.now())
        ).fetchone()
        
        if not reset_token:
            return jsonify({'message': 'Invalid or expired reset code'}), 400
        
        # Update password
        hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
        db.execute('UPDATE users SET password = ? WHERE email = ?', (hashed_password, email))
        
        # Mark token as used
        db.execute('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', (reset_token['id'],))
        
        db.commit()
        
        return jsonify({'message': 'Password reset successful'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== DRIVER AUTH ROUTES ====================

@app.route('/api/driver/login', methods=['POST'])
def driver_login():
    try:
        data = request.json
        driver_number = data.get('driver_number')
        password = data.get('password')
        
        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        db = get_db()
        driver = db.execute(
            'SELECT * FROM drivers WHERE driver_number = ? AND password = ? AND status = ?',
            (driver_number, hashed_password, 'active')
        ).fetchone()
        
        if driver:
            return jsonify({
                'message': 'Login successful',
                'driver': {
                    'id': driver['id'],
                    'driver_number': driver['driver_number'],
                    'name': driver['name'],
                    'phone': driver['phone'],
                    'total_earnings': driver['total_earnings'],
                    'total_deliveries': driver['total_deliveries'],
                    'role': 'driver'
                }
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials or inactive driver'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== PRODUCT ROUTES ====================

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        db = get_db()
        products = db.execute('SELECT * FROM products ORDER BY created_at DESC').fetchall()
        return jsonify([dict(p) for p in products]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        data = request.json
        db = get_db()
        db.execute(
            'INSERT INTO products (name, price, category, description, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
            (data['name'], data['price'], data['category'], data.get('description'), 
             data.get('image'), data.get('stock', 0))
        )
        db.commit()
        return jsonify({'message': 'Product added successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.json
        db = get_db()
        db.execute(
            'UPDATE products SET name=?, price=?, category=?, description=?, image=?, stock=? WHERE id=?',
            (data['name'], data['price'], data['category'], data.get('description'),
             data.get('image'), data.get('stock', 0), product_id)
        )
        db.commit()
        return jsonify({'message': 'Product updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        db = get_db()
        db.execute('DELETE FROM products WHERE id = ?', (product_id,))
        db.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== ORDER ROUTES ====================

@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        db = get_db()
        orders = db.execute('''
            SELECT o.*, u.username, u.email, u.phone, u.address, d.name as driver_name, d.driver_number
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN drivers d ON o.driver_id = d.id
            ORDER BY o.created_at DESC
        ''').fetchall()
        
        result = []
        for order in orders:
            items = db.execute('''
                SELECT oi.*, p.name as product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ''', (order['id'],)).fetchall()
            
            order_dict = dict(order)
            order_dict['items'] = [dict(item) for item in items]
            result.append(order_dict)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/orders/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    try:
        db = get_db()
        orders = db.execute('''
            SELECT o.*, d.name as driver_name, d.driver_number, d.phone as driver_phone
            FROM orders o
            LEFT JOIN drivers d ON o.driver_id = d.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        ''', (user_id,)).fetchall()
        
        result = []
        for order in orders:
            items = db.execute('''
                SELECT oi.*, p.name as product_name, p.image
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ''', (order['id'],)).fetchall()
            
            order_dict = dict(order)
            order_dict['items'] = [dict(item) for item in items]
            result.append(order_dict)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/orders/driver/<int:driver_id>', methods=['GET'])
def get_driver_orders(driver_id):
    try:
        db = get_db()
        orders = db.execute('''
            SELECT o.*, u.username, u.phone, u.address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.driver_id = ? AND o.status != 'delivered'
            ORDER BY o.created_at DESC
        ''', (driver_id,)).fetchall()
        
        result = []
        for order in orders:
            items = db.execute('''
                SELECT oi.*, p.name as product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ''', (order['id'],)).fetchall()
            
            order_dict = dict(order)
            order_dict['items'] = [dict(item) for item in items]
            result.append(order_dict)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        user_id = data.get('user_id')
        items = data.get('items', [])
        total_amount = data.get('total_amount')
        mpesa_code = data.get('mpesa_code')
        
        db = get_db()
        
        # Get user info
        user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        
        # Create order
        cursor = db.execute(
            'INSERT INTO orders (user_id, total_amount, delivery_fee, payment_status, mpesa_code, status) VALUES (?, ?, ?, ?, ?, ?)',
            (user_id, total_amount, DELIVERY_FEE, 'paid', mpesa_code, 'pending')
        )
        order_id = cursor.lastrowid
        
        # Add order items
        for item in items:
            db.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                (order_id, item['product_id'], item['quantity'], item['price'])
            )
        
        db.commit()
        
        # Send order confirmation email
        if EMAIL_ENABLED and user:
            try:
                email_items = []
                for item in items:
                    product = db.execute('SELECT name FROM products WHERE id = ?', (item['product_id'],)).fetchone()
                    email_items.append({
                        'name': product['name'] if product else 'Unknown',
                        'quantity': item['quantity'],
                        'price': item['price'] * item['quantity']
                    })
                
                send_order_confirmation_email(
                    user['email'],
                    user['username'],
                    order_id,
                    total_amount + DELIVERY_FEE,
                    email_items
                )
                print(f'✅ Order confirmation email sent to {user["email"]}')
            except Exception as e:
                print(f'⚠️ Email sending failed: {str(e)}')
        
        return jsonify({'message': 'Order created successfully', 'order_id': order_id}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    try:
        data = request.json
        db = get_db()
        
        # Get current order info
        order = db.execute('''
            SELECT o.*, u.username, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        ''', (order_id,)).fetchone()
        
        old_status = order['status'] if order else None
        new_status = data.get('status')
        driver_id = data.get('driver_id')
        
        # Update order
        if 'status' in data and 'driver_id' in data:
            db.execute(
                'UPDATE orders SET status = ?, driver_id = ? WHERE id = ?',
                (data['status'], data['driver_id'], order_id)
            )
        elif 'status' in data:
            db.execute(
                'UPDATE orders SET status = ? WHERE id = ?',
                (data['status'], order_id)
            )
        elif 'driver_id' in data:
            db.execute(
                'UPDATE orders SET driver_id = ? WHERE id = ?',
                (data['driver_id'], order_id)
            )
        
        # If status changed to delivered, update driver earnings
        if new_status == 'delivered' and old_status != 'delivered' and driver_id:
            driver_earning = DELIVERY_FEE * DRIVER_COMMISSION
            db.execute('''
                UPDATE drivers 
                SET total_earnings = total_earnings + ?, 
                    total_deliveries = total_deliveries + 1 
                WHERE id = ?
            ''', (driver_earning, driver_id))
            
            # Set delivered timestamp
            db.execute('UPDATE orders SET delivered_at = ? WHERE id = ?', (datetime.now(), order_id))
        
        db.commit()
        
        # Send status update email
        if EMAIL_ENABLED and order and new_status and old_status != new_status:
            try:
                send_order_status_update_email(
                    order['email'],
                    order['username'],
                    order_id,
                    new_status
                )
                print(f'✅ Status update email sent to {order["email"]}')
            except Exception as e:
                print(f'⚠️ Email sending failed: {str(e)}')
        
        return jsonify({'message': 'Order updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/orders/<int:order_id>/confirm-delivery', methods=['POST'])
def confirm_delivery(order_id):
    try:
        data = request.json
        confirmed_by = data.get('confirmed_by')  # 'customer' or 'driver'
        
        db = get_db()
        
        if confirmed_by == 'customer':
            db.execute('UPDATE orders SET customer_confirmed = 1 WHERE id = ?', (order_id,))
        elif confirmed_by == 'driver':
            db.execute('UPDATE orders SET driver_confirmed = 1 WHERE id = ?', (order_id,))
        
        # Check if both confirmed
        order = db.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
        
        if order and order['customer_confirmed'] and order['driver_confirmed']:
            # Both confirmed, mark as delivered
            db.execute('UPDATE orders SET status = ?, delivered_at = ? WHERE id = ?', 
                      ('delivered', datetime.now(), order_id))
            
            # Update driver earnings
            if order['driver_id']:
                driver_earning = DELIVERY_FEE * DRIVER_COMMISSION
                db.execute('''
                    UPDATE drivers 
                    SET total_earnings = total_earnings + ?, 
                        total_deliveries = total_deliveries + 1 
                    WHERE id = ?
                ''', (driver_earning, order['driver_id']))
        
        db.commit()
        
        return jsonify({'message': 'Delivery confirmed'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== DRIVER ROUTES ====================

@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    try:
        db = get_db()
        drivers = db.execute('SELECT * FROM drivers ORDER BY created_at DESC').fetchall()
        return jsonify([dict(d) for d in drivers]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/drivers', methods=['POST'])
def add_driver():
    try:
        data = request.json
        db = get_db()
        
        # Auto-generate driver number
        last_driver = db.execute('SELECT driver_number FROM drivers ORDER BY id DESC LIMIT 1').fetchone()
        
        if last_driver:
            # Extract number from driver_number (e.g., "driver10" -> 10)
            last_num = int(last_driver['driver_number'].replace('driver', ''))
            new_num = last_num + 1
        else:
            new_num = 1
        
        driver_number = f'driver{new_num}'
        
        # Hash password
        hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
        db.execute(
            'INSERT INTO drivers (driver_number, name, phone, password, vehicle, license_plate) VALUES (?, ?, ?, ?, ?, ?)',
            (driver_number, data['name'], data['phone'], hashed_password, 
             data.get('vehicle'), data.get('license_plate'))
        )
        db.commit()
        
        return jsonify({
            'message': 'Driver added successfully',
            'driver_number': driver_number
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    try:
        db = get_db()
        db.execute('UPDATE drivers SET status = ? WHERE id = ?', ('inactive', driver_id))
        db.commit()
        return jsonify({'message': 'Driver removed successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/drivers/<int:driver_id>/earnings', methods=['GET'])
def get_driver_earnings(driver_id):
    try:
        db = get_db()
        driver = db.execute('SELECT * FROM drivers WHERE id = ?', (driver_id,)).fetchone()
        
        # Get delivery history
        deliveries = db.execute('''
            SELECT o.id, o.created_at, o.delivered_at, o.delivery_fee, u.username, u.address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.driver_id = ? AND o.status = 'delivered'
            ORDER BY o.delivered_at DESC
        ''', (driver_id,)).fetchall()
        
        return jsonify({
            'driver': dict(driver) if driver else None,
            'deliveries': [dict(d) for d in deliveries],
            'total_earnings': driver['total_earnings'] if driver else 0,
            'total_deliveries': driver['total_deliveries'] if driver else 0,
            'commission_rate': DRIVER_COMMISSION
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== FEEDBACK ROUTES ====================

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    try:
        db = get_db()
        feedback = db.execute('''
            SELECT f.*, u.username, u.email as user_email
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        ''').fetchall()
        return jsonify([dict(f) for f in feedback]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        db = get_db()
        
        db.execute(
            'INSERT INTO feedback (user_id, name, email, type, message) VALUES (?, ?, ?, ?, ?)',
            (data.get('user_id'), data.get('name'), data.get('email'), 
             data['type'], data['message'])
        )
        db.commit()
        
        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/feedback/<int:feedback_id>', methods=['PUT'])
def update_feedback_status(feedback_id):
    try:
        data = request.json
        db = get_db()
        db.execute('UPDATE feedback SET status = ? WHERE id = ?', (data['status'], feedback_id))
        db.commit()
        return jsonify({'message': 'Feedback status updated'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== DRIVER APPLICATION ROUTES ====================

@app.route('/api/driver-applications', methods=['GET'])
def get_driver_applications():
    try:
        db = get_db()
        applications = db.execute('SELECT * FROM driver_applications ORDER BY created_at DESC').fetchall()
        return jsonify([dict(a) for a in applications]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/driver-applications', methods=['POST'])
def submit_driver_application():
    try:
        data = request.json
        db = get_db()
        
        db.execute(
            'INSERT INTO driver_applications (name, email, phone, vehicle, license_plate, experience) VALUES (?, ?, ?, ?, ?, ?)',
            (data['name'], data['email'], data['phone'], 
             data.get('vehicle'), data.get('license_plate'), data.get('experience'))
        )
        db.commit()
        
        return jsonify({'message': 'Application submitted successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/driver-applications/<int:app_id>/approve', methods=['POST'])
def approve_driver_application(app_id):
    try:
        data = request.json
        db = get_db()
        
        # Get application
        app = db.execute('SELECT * FROM driver_applications WHERE id = ?', (app_id,)).fetchone()
        
        if not app:
            return jsonify({'message': 'Application not found'}), 404
        
        # Create driver account
        last_driver = db.execute('SELECT driver_number FROM drivers ORDER BY id DESC LIMIT 1').fetchone()
        
        if last_driver:
            last_num = int(last_driver['driver_number'].replace('driver', ''))
            new_num = last_num + 1
        else:
            new_num = 1
        
        driver_number = f'driver{new_num}'
        
        # Hash the provided password
        hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
        db.execute(
            'INSERT INTO drivers (driver_number, name, phone, password, vehicle, license_plate) VALUES (?, ?, ?, ?, ?, ?)',
            (driver_number, app['name'], app['phone'], hashed_password, 
             app['vehicle'], app['license_plate'])
        )
        
        # Update application status
        db.execute('UPDATE driver_applications SET status = ? WHERE id = ?', ('approved', app_id))
        
        db.commit()
        
        # TODO: Send email to applicant with credentials
        
        return jsonify({
            'message': 'Driver approved successfully',
            'driver_number': driver_number
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/driver-applications/<int:app_id>/reject', methods=['POST'])
def reject_driver_application(app_id):
    try:
        db = get_db()
        db.execute('UPDATE driver_applications SET status = ? WHERE id = ?', ('rejected', app_id))
        db.commit()
        return jsonify({'message': 'Application rejected'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== ADMIN UTILITY ROUTES ====================

@app.route('/api/admin/import-products', methods=['POST'])
def import_products_route():
    """Import products from products.py - ADMIN ONLY"""
    try:
        from products import PRODUCTS
        
        db = get_db()
        
        # Clear existing products
        db.execute('DELETE FROM products')
        
        # Import all products
        imported = 0
        for product in PRODUCTS:
            db.execute('''
                INSERT INTO products (name, price, category, description, image, stock)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                product['name'],
                product['price'],
                product['category'],
                product['description'],
                product['image_url'],
                100
            ))
            imported += 1
        
        db.commit()
        
        return jsonify({
            'message': f'Successfully imported {imported} products!',
            'count': imported
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        db = get_db()
        
        # Get counts
        total_users = db.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
        total_orders = db.execute('SELECT COUNT(*) as count FROM orders').fetchone()['count']
        total_products = db.execute('SELECT COUNT(*) as count FROM products').fetchone()['count']
        total_drivers = db.execute('SELECT COUNT(*) as count FROM drivers WHERE status = "active"').fetchone()['count']
        
        # Get revenue
        total_revenue = db.execute('SELECT SUM(total_amount + delivery_fee) as revenue FROM orders WHERE payment_status = "paid"').fetchone()['revenue'] or 0
        
        # Pending orders
        pending_orders = db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "pending"').fetchone()['count']
        
        return jsonify({
            'total_users': total_users,
            'total_orders': total_orders,
            'total_products': total_products,
            'total_drivers': total_drivers,
            'total_revenue': total_revenue,
            'pending_orders': pending_orders
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== SERVER ====================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)