from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os
import sys
import logging

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

# Database setup
DATABASE = 'nooriy.db'

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
                status TEXT DEFAULT 'pending',
                driver_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
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
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                vehicle TEXT,
                license_plate TEXT,
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
            
            # 📧 SEND REGISTRATION EMAIL (if enabled)
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
                    'role': 'user'
                }
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
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
            SELECT o.*, u.username, u.email, u.phone, u.address, d.name as driver_name
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

@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        user_id = data.get('user_id')
        items = data.get('items', [])
        total_amount = data.get('total_amount')
        
        db = get_db()
        
        # Get user info for email
        user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        
        # Create order
        cursor = db.execute(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            (user_id, total_amount, 'pending')
        )
        order_id = cursor.lastrowid
        
        # Add order items
        for item in items:
            db.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                (order_id, item['product_id'], item['quantity'], item['price'])
            )
        
        db.commit()
        
        # 📧 SEND ORDER CONFIRMATION EMAIL (if enabled)
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
                    total_amount,
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
        
        # Get current order info for email
        order = db.execute('''
            SELECT o.*, u.username, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        ''', (order_id,)).fetchone()
        
        old_status = order['status'] if order else None
        new_status = data.get('status')
        
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
        
        db.commit()
        
        # 📧 SEND STATUS UPDATE EMAIL (if enabled and status changed)
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
        db.execute(
            'INSERT INTO drivers (name, phone, vehicle, license_plate) VALUES (?, ?, ?, ?)',
            (data['name'], data['phone'], data.get('vehicle'), data.get('license_plate'))
        )
        db.commit()
        return jsonify({'message': 'Driver added successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    try:
        db = get_db()
        db.execute('DELETE FROM drivers WHERE id = ?', (driver_id,))
        db.commit()
        return jsonify({'message': 'Driver deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== SERVER ====================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)