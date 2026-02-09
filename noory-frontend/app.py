# app.py - Flask backend
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from products import PRODUCTS
from datetime import datetime
import copy
import os

app = Flask(__name__, static_folder="static")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ===== In-memory storage =====
orders_db = []
loyalty_cards_db = []
users_db = []
drivers_db = []
products_db = copy.deepcopy(PRODUCTS)

# Admin password
ADMIN_PASSWORD = "ITSALOTOFWORKMAN"

# ===== PRODUCTS =====
@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products_db)

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products_db if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

# ===== ADMIN PRODUCT MANAGEMENT =====
@app.route('/api/admin/products', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('price'):
            return jsonify({"error": "Name and price are required"}), 400
        
        existing_ids = [int(p['id']) for p in products_db]
        new_id = str(max(existing_ids) + 1) if existing_ids else "1"
        
        new_product = {
            "id": new_id,
            "name": data['name'],
            "description": data.get('description', ''),
            "price": float(data['price']),
            "category": data.get('category', 'pantry'),
            "in_stock": data.get('in_stock', True),
            "image_url": data.get('image_url', '')
        }
        
        products_db.append(new_product)
        return jsonify(new_product), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/admin/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.get_json()
        product = next((p for p in products_db if p['id'] == product_id), None)
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        product['name'] = data.get('name', product['name'])
        product['description'] = data.get('description', product['description'])
        product['price'] = float(data.get('price', product['price']))
        product['category'] = data.get('category', product['category'])
        product['in_stock'] = data.get('in_stock', product['in_stock'])
        product['image_url'] = data.get('image_url', product.get('image_url', ''))
        
        return jsonify(product), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/admin/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        global products_db
        product = next((p for p in products_db if p['id'] == product_id), None)
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        products_db = [p for p in products_db if p['id'] != product_id]
        return jsonify({"message": "Product deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== AUTHENTICATION =====
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    
    print(f"🔍 Login attempt - Username: {username}, Password: {password}")
    
    # Check if admin password (regardless of username)
    if password == ADMIN_PASSWORD:
        print("✅ ADMIN LOGIN SUCCESSFUL!")
        return jsonify({
            "user": {
                "id": 0,
                "username": username if username else "admin",
                "email": "admin@nooriy.com",
                "role": "admin"
            }
        }), 200
    
    # Check regular users
    user = next((u for u in users_db if u['username'] == username and u['password'] == password), None)
    if user:
        print(f"✅ Regular user login: {user}")
        return jsonify({"user": user}), 200
    
    print("❌ Login failed - invalid credentials")
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if any(u['username'] == data['username'] for u in users_db):
        return jsonify({"error": "Username already exists"}), 400
    
    new_user = {
        "id": len(users_db) + 1,
        "username": data['username'],
        "email": data['email'],
        "password": data['password'],
        "phone": data.get('phone', ''),
        "role": "customer"
    }
    
    users_db.append(new_user)
    return jsonify({"user": new_user}), 201

# ===== ORDERS =====
@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify(orders_db)

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    new_order = {
        "order_id": f"ORD-{len(orders_db) + 1:04d}",
        **data,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    orders_db.append(new_order)
    return jsonify(new_order), 201

@app.route('/api/admin/orders/<order_id>', methods=['PUT'])
def update_order(order_id):
    try:
        data = request.get_json()
        order = next((o for o in orders_db if o['order_id'] == order_id), None)
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        if 'status' in data:
            order['status'] = data['status']
        if 'driver_id' in data:
            order['driver_id'] = data['driver_id']
        
        return jsonify(order), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== DRIVERS =====
@app.route('/api/admin/drivers', methods=['GET'])
def get_drivers():
    return jsonify(drivers_db)

@app.route('/api/admin/drivers', methods=['POST'])
def create_driver():
    data = request.get_json()
    new_driver = {
        "id": len(drivers_db) + 1,
        **data
    }
    drivers_db.append(new_driver)
    return jsonify(new_driver), 201

@app.route('/api/admin/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    global drivers_db
    drivers_db = [d for d in drivers_db if d.get('id') != driver_id]
    return jsonify({"message": "Driver deleted"}), 200

# ===== SERVE FRONTEND =====
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting server on port {port}...")
    print(f"🔐 Admin password: {ADMIN_PASSWORD}")
    app.run(host='0.0.0.0', port=port, debug=True)