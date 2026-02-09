# app.py - Flask backend serving React frontend
import os
import logging
import sys
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from products import PRODUCTS
from datetime import datetime

# Suppress Flask startup banner and Render messages
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
cli = sys.modules['flask.cli']
cli.show_server_banner = lambda *x: None

app = Flask(__name__, static_folder="static")

# Enable CORS for all routes (crucial for frontend-backend communication)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# In-memory data storage (replace with database in production)
users_db = []
orders_db = []
drivers_db = []

# Admin credentials (hardcoded for now)
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}

# ============================================
# AUTHENTICATION ROUTES
# ============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    # Check if username already exists
    if any(user['username'] == data['username'] for user in users_db):
        return jsonify({"error": "Username already exists"}), 400
    
    # Check if email already exists
    if any(user['email'] == data['email'] for user in users_db):
        return jsonify({"error": "Email already exists"}), 400
    
    # Create new user
    new_user = {
        "id": len(users_db) + 1,
        "username": data['username'],
        "email": data['email'],
        "password": data['password'],  # In production, hash this!
        "phone": data.get('phone', ''),
        "role": "customer",
        "created_at": datetime.now().isoformat()
    }
    
    users_db.append(new_user)
    
    return jsonify({
        "message": "Registration successful",
        "user": {
            "id": new_user['id'],
            "username": new_user['username'],
            "email": new_user['email'],
            "role": new_user['role']
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user or admin"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Check admin credentials first
    if username == ADMIN_CREDENTIALS['username'] and password == ADMIN_CREDENTIALS['password']:
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": 0,
                "username": "admin",
                "role": "admin"
            }
        }), 200
    
    # Check driver credentials
    driver = next((d for d in drivers_db if d['username'] == username and d['password'] == password), None)
    if driver:
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": driver['id'],
                "username": driver['username'],
                "role": "driver"
            }
        }), 200
    
    # Check customer credentials
    user = next((u for u in users_db if u['username'] == username and u['password'] == password), None)
    if user:
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "role": user['role']
            }
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

# ============================================
# PRODUCT ROUTES
# ============================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    return jsonify({"products": PRODUCTS})

@app.route('/api/admin/products', methods=['POST'])
def add_product():
    """Add a new product (admin only)"""
    data = request.json
    
    new_product = {
        "id": max([p['id'] for p in PRODUCTS]) + 1,
        "name": data['name'],
        "category": data['category'],
        "price": float(data['price']),
        "description": data.get('description', ''),
        "image": data.get('image', '🛒'),
        "stock": int(data.get('stock', 100))
    }
    
    PRODUCTS.append(new_product)
    
    return jsonify({
        "message": "Product added successfully",
        "product": new_product
    }), 201

@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update a product (admin only)"""
    data = request.json
    
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    product['name'] = data.get('name', product['name'])
    product['category'] = data.get('category', product['category'])
    product['price'] = float(data.get('price', product['price']))
    product['description'] = data.get('description', product['description'])
    product['stock'] = int(data.get('stock', product['stock']))
    
    return jsonify({
        "message": "Product updated successfully",
        "product": product
    }), 200

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product (admin only)"""
    global PRODUCTS
    
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    PRODUCTS = [p for p in PRODUCTS if p['id'] != product_id]
    
    return jsonify({"message": "Product deleted successfully"}), 200

# ============================================
# ORDER ROUTES
# ============================================

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.json
    
    new_order = {
        "id": len(orders_db) + 1,
        "user_id": data.get('user_id'),
        "customer_name": data['customer_name'],
        "phone": data['phone'],
        "address": data['address'],
        "items": data['items'],
        "total": data['total'],
        "status": "pending",
        "driver_id": None,
        "created_at": datetime.now().isoformat()
    }
    
    orders_db.append(new_order)
    
    return jsonify({
        "message": "Order placed successfully",
        "order": new_order
    }), 201

@app.route('/api/admin/orders', methods=['GET'])
def get_all_orders():
    """Get all orders (admin only)"""
    return jsonify({"orders": orders_db})

@app.route('/api/driver/orders', methods=['GET'])
def get_driver_orders():
    """Get orders for a specific driver"""
    driver_id = request.args.get('driver_id', type=int)
    
    if driver_id:
        driver_orders = [o for o in orders_db if o['driver_id'] == driver_id]
    else:
        driver_orders = [o for o in orders_db if o['status'] == 'pending']
    
    return jsonify({"orders": driver_orders})

@app.route('/api/admin/orders/<int:order_id>/assign', methods=['PUT'])
def assign_driver(order_id):
    """Assign a driver to an order"""
    data = request.json
    
    order = next((o for o in orders_db if o['id'] == order_id), None)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    order['driver_id'] = data['driver_id']
    order['status'] = 'assigned'
    
    return jsonify({
        "message": "Driver assigned successfully",
        "order": order
    }), 200

@app.route('/api/driver/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status (driver)"""
    data = request.json
    
    order = next((o for o in orders_db if o['id'] == order_id), None)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    order['status'] = data['status']
    
    return jsonify({
        "message": "Order status updated",
        "order": order
    }), 200

# ============================================
# DRIVER ROUTES
# ============================================

@app.route('/api/admin/drivers', methods=['GET'])
def get_drivers():
    """Get all drivers"""
    return jsonify({"drivers": drivers_db})

@app.route('/api/admin/drivers', methods=['POST'])
def add_driver():
    """Add a new driver"""
    data = request.json
    
    # Check if username already exists
    if any(driver['username'] == data['username'] for driver in drivers_db):
        return jsonify({"error": "Username already exists"}), 400
    
    new_driver = {
        "id": len(drivers_db) + 1,
        "name": data['name'],
        "username": data['username'],
        "password": data['password'],
        "phone": data['phone'],
        "vehicle": data['vehicle'],
        "status": "available",
        "created_at": datetime.now().isoformat()
    }
    
    drivers_db.append(new_driver)
    
    return jsonify({
        "message": "Driver added successfully",
        "driver": new_driver
    }), 201

@app.route('/api/admin/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    """Delete a driver"""
    global drivers_db
    
    driver = next((d for d in drivers_db if d['id'] == driver_id), None)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404
    
    drivers_db = [d for d in drivers_db if d['id'] != driver_id]
    
    return jsonify({"message": "Driver deleted successfully"}), 200

# ============================================
# SERVE REACT APP (for production)
# ============================================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React frontend"""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# ============================================
# RUN SERVER
# ============================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'🚀 NOORIY Backend starting on port {port}...')
    app.run(host='0.0.0.0', port=port, debug=False)