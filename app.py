# app.py - Flask backend serving React frontend
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from products import PRODUCTS
import copy
from datetime import datetime

app = Flask(__name__, static_folder="static")

# Enable CORS for all routes (crucial for Vercel frontend)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ===== In-memory storage =====
# ===== In-memory storage =====
orders_db = []
loyalty_cards_db = []
users_db = []
drivers_db = []  # Store drivers here
products_db = copy.deepcopy(PRODUCTS)  # Mutable product list

# ===== PRODUCTS =====
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
        
        # Validate required fields
        if not data.get('name') or not data.get('price'):
            return jsonify({"error": "Name and price are required"}), 400
        
        # Generate new product ID
        existing_ids = [int(p['id']) for p in products_db]
        new_id = str(max(existing_ids) + 1) if existing_ids else "1"
        
        # Create new product
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
        
        # Update product fields
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

# ===== ORDERS =====
@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_name', 'phone', 'address', 'items', 'total', 'delivery_zone']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create order
        order = {
            "order_id": f"ORD-{len(orders_db) + 1:05d}",
            "customer_name": data['customer_name'],
            "phone": data['phone'],
            "address": data['address'],
            "delivery_zone": data['delivery_zone'],
            "items": data['items'],
            "subtotal": data.get('subtotal', 0),
            "delivery_fee": data.get('delivery_fee', 0),
            "total": data['total'],
            "payment_method": data.get('payment_method', 'mpesa'),
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "driver_assigned": None,
            "delivery_notes": data.get('delivery_notes', '')
        }
        
        orders_db.append(order)
        
        return jsonify({
            "message": "Order created successfully",
            "order": order
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify(orders_db)

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    order = next((o for o in orders_db if o['order_id'] == order_id), None)
    if order:
        return jsonify(order)
    return jsonify({"error": "Order not found"}), 404

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    try:
        data = request.get_json()
        order = next((o for o in orders_db if o['order_id'] == order_id), None)
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        order['status'] = data.get('status', order['status'])
        order['driver_assigned'] = data.get('driver_assigned', order['driver_assigned'])
        
        return jsonify({"message": "Order updated", "order": order})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== LOYALTY CARDS =====
@app.route('/api/loyalty/card', methods=['POST'])
def create_loyalty_card():
    try:
        data = request.get_json()
        
        # Check if card already exists for this phone
        existing_card = next((c for c in loyalty_cards_db if c['phone'] == data['phone']), None)
        if existing_card:
            return jsonify({"error": "Loyalty card already exists for this phone"}), 400
        
        card = {
            "card_id": f"CARD-{len(loyalty_cards_db) + 1:05d}",
            "customer_name": data['customer_name'],
            "phone": data['phone'],
            "points": 0,
            "tier": "Bronze",
            "created_at": datetime.now().isoformat()
        }
        
        loyalty_cards_db.append(card)
        
        return jsonify(card), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/loyalty/card/<phone>', methods=['GET'])
def get_loyalty_card(phone):
    card = next((c for c in loyalty_cards_db if c['phone'] == phone), None)
    if card:
        return jsonify(card)
    return jsonify({"error": "Loyalty card not found"}), 404

# ===== SEARCH =====
@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify(PRODUCTS)
    
    results = [p for p in PRODUCTS if query in p['name'].lower() or query in p.get('description', '').lower()]
    return jsonify(results)

# ===== AUTHENTICATION ROUTES =====
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        email = data.get('email', '').strip()
        
        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400
        
        # Check if user already exists
        existing_user = next((u for u in users_db if u['username'] == username), None)
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400
        
        # Create new user
        user = {
            "id": f"USER-{len(users_db) + 1:05d}",
            "username": username,
            "password": password,  # In production, hash this!
            "email": email,
            "phone": data.get('phone', ''),
            "type": "customer",
            "created_at": datetime.now().isoformat()
        }
        
        users_db.append(user)
        
        return jsonify({
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "type": user['type']
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400
        
        # Check for admin password
        ADMIN_PASSWORD = 'ITSALOTOFWORKMAN'
        if password == ADMIN_PASSWORD:
            return jsonify({
                "user": {
                    "username": username,
                    "type": "admin",
                    "displayName": f"{username} - ADMIN"
                }
            }), 200
        
        # Check for driver password (format: DRIVER1-secret)
        import re
        driver_pattern = r'^DRIVER(\d+)-(.+)$'
        driver_match = re.match(driver_pattern, password)
        
        if driver_match:
            driver_number = driver_match.group(1)
            secret_key = driver_match.group(2)
            driver_id = f"DRIVER{driver_number}"
            
            # Find driver in database
            driver = next((d for d in drivers_db if d['driverNumber'] == driver_id and d['secretKey'] == secret_key), None)
            
            if driver:
                return jsonify({
                    "user": {
                        "id": driver['id'],
                        "username": driver['name'],
                        "type": "driver",
                        "driverNumber": driver_id,
                        "displayName": f"{driver['name']} - {driver_id}"
                    }
                }), 200
            else:
                return jsonify({"error": "Invalid driver credentials"}), 401
        
        # Regular customer login
        user = next((u for u in users_db if u['username'] == username and u['password'] == password), None)
        
        if not user:
            return jsonify({"error": "Invalid username or password"}), 401
        
        return jsonify({
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "type": user['type'],
                "displayName": user['username']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== DRIVER MANAGEMENT ROUTES (ADMIN ONLY) =====
@app.route('/api/admin/drivers', methods=['GET'])
def get_drivers():
    return jsonify(drivers_db)

@app.route('/api/admin/drivers', methods=['POST'])
def create_driver():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['driverNumber', 'name', 'phone', 'secretKey']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if driver number already exists
        existing_driver = next((d for d in drivers_db if d['driverNumber'] == data['driverNumber']), None)
        if existing_driver:
            return jsonify({"error": "Driver number already exists"}), 400
        
        # Create driver
        driver = {
            "id": f"DRV-{len(drivers_db) + 1:05d}",
            "driverNumber": data['driverNumber'],
            "name": data['name'],
            "phone": data['phone'],
            "vehicleType": data.get('vehicleType', 'motorcycle'),
            "vehicleReg": data.get('vehicleReg', ''),
            "secretKey": data['secretKey'],
            "fullPassword": data.get('fullPassword', f"{data['driverNumber']}-{data['secretKey']}"),
            "totalEarnings": 0,
            "completedDeliveries": 0,
            "createdAt": datetime.now().isoformat()
        }
        
        drivers_db.append(driver)
        
        return jsonify(driver), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/admin/drivers/<driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    try:
        global drivers_db
        driver = next((d for d in drivers_db if d['id'] == driver_id), None)
        
        if not driver:
            return jsonify({"error": "Driver not found"}), 404
        
        drivers_db = [d for d in drivers_db if d['id'] != driver_id]
        
        return jsonify({"message": "Driver deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/admin/drivers/<driver_id>', methods=['PUT'])
def update_driver(driver_id):
    try:
        data = request.get_json()
        driver = next((d for d in drivers_db if d['id'] == driver_id), None)
        
        if not driver:
            return jsonify({"error": "Driver not found"}), 404
        
        # Update driver fields
        driver['name'] = data.get('name', driver['name'])
        driver['phone'] = data.get('phone', driver['phone'])
        driver['vehicleType'] = data.get('vehicleType', driver['vehicleType'])
        driver['vehicleReg'] = data.get('vehicleReg', driver['vehicleReg'])
        driver['totalEarnings'] = data.get('totalEarnings', driver['totalEarnings'])
        driver['completedDeliveries'] = data.get('completedDeliveries', driver['completedDeliveries'])
        
        return jsonify(driver), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===== SERVE REACT APP =====
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)