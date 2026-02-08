# app.py - Flask backend serving React frontend
# app.py - Flask backend serving React frontend

import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from products import PRODUCTS
from datetime import datetime
app = Flask(__name__, static_folder="static")

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://noory_db_user:uUC7vrO30xfq6cM8fLwPADR1YDG4SLGh@dpg-d642uc4hg0os73cstnl0-a.oregon-postgres.render.com/noory_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Enable CORS for all routes (critical for frontend connection)
CORS(app, resources={r"/*": {"origins": "*"}})
# ===== DATABASE MODELS =====

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Driver(db.Model):
    __tablename__ = 'drivers'
    id = db.Column(db.Integer, primary_key=True)
    driver_number = db.Column(db.Integer, unique=True, nullable=False)  # 1, 2, 3, etc.
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    vehicle_type = db.Column(db.String(50))
    total_earnings = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='active')  # active, inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DriverApplication(db.Model):
    __tablename__ = 'driver_applications'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    id_number = db.Column(db.String(50), nullable=False)
    vehicle_type = db.Column(db.String(50), nullable=False)
    vehicle_registration = db.Column(db.String(50), nullable=False)
    license_number = db.Column(db.String(50), nullable=False)
    experience = db.Column(db.Text)
    availability = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'))
    items = db.Column(db.JSON, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    delivery_fee = db.Column(db.Float, nullable=False)
    driver_earning = db.Column(db.Float, nullable=False)
    company_earning = db.Column(db.Float, nullable=False)
    delivery_address = db.Column(db.String(200), nullable=False)
    delivery_phone = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, accepted, picked_up, on_the_way, delivered, confirmed
    payment_status = db.Column(db.String(50), default='pending')  # pending, paid
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    type = db.Column(db.String(50), nullable=False)  # suggestion, complaint, compliment, question
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='new')  # new, reviewed, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # ===== AUTHENTICATION ENDPOINTS =====

# User Registration
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        
        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400
            
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            return jsonify({"error": "Email already exists"}), 400
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password=password,  # In production, hash this!
            phone=phone
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "message": "Registration successful",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# User Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        ADMIN_PASSWORD = 'ITSALOTOFWORKMAN'
        
        # Check if admin password
        if password == ADMIN_PASSWORD:
            # Check if admin exists in database
            admin = Admin.query.filter_by(username=username).first()
            if not admin:
                # Create admin if doesn't exist
                admin = Admin(username=username, password=password)
                db.session.add(admin)
                db.session.commit()
            
            return jsonify({
                "type": "admin",
                "username": username,
                "displayName": f"{username} - ADMIN"
            }), 200
        
        # Check if driver password (DRIVER1-secret format)
        import re
        driver_pattern = re.match(r'^DRIVER(\d+)-(.+)$', password)
        if driver_pattern:
            driver_number = int(driver_pattern.group(1))
            secret_password = driver_pattern.group(2)
            
            # Check if driver exists in database
            driver = Driver.query.filter_by(driver_number=driver_number).first()
            
            if not driver:
                return jsonify({"error": "Driver doesn't exist. Contact admin."}), 404
            
            # Check if password matches
            if driver.password != secret_password:
                return jsonify({"error": "Invalid password"}), 401
            
            return jsonify({
                "type": "driver",
                "username": driver.username,
                "driverNumber": driver_number,
                "displayName": f"{driver.username} - Driver #{driver_number}"
            }), 200
        
        # Regular customer login
        user = User.query.filter_by(username=username).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if user.password != password:
            return jsonify({"error": "Invalid password"}), 401
        
        return jsonify({
            "type": "customer",
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "displayName": user.username
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    # Save Feedback
@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        
        new_feedback = Feedback(
            user_id=data.get('user_id'),
            type=data.get('type'),
            subject=data.get('subject'),
            message=data.get('message'),
            status='new'
        )
        
        db.session.add(new_feedback)
        db.session.commit()
        
        return jsonify({
            "message": "Feedback submitted successfully",
            "id": new_feedback.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Get All Feedback (for admin)
@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    try:
        feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
        
        return jsonify([{
            "id": f.id,
            "user_id": f.user_id,
            "type": f.type,
            "subject": f.subject,
            "message": f.message,
            "status": f.status,
            "created_at": f.created_at.isoformat()
        } for f in feedbacks]), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Submit Driver Application
@app.route('/api/driver-applications', methods=['POST'])
def submit_driver_application():
    try:
        data = request.get_json()
        
        new_application = DriverApplication(
            full_name=data.get('fullName'),
            phone=data.get('phone'),
            email=data.get('email'),
            id_number=data.get('idNumber'),
            vehicle_type=data.get('vehicleType'),
            vehicle_registration=data.get('vehicleRegistration'),
            license_number=data.get('licenseNumber'),
            experience=data.get('experience'),
            availability=data.get('availability'),
            status='pending'
        )
        
        db.session.add(new_application)
        db.session.commit()
        
        return jsonify({
            "message": "Application submitted successfully",
            "id": new_application.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Get All Driver Applications (for admin)
@app.route('/api/driver-applications', methods=['GET'])
def get_driver_applications():
    try:
        applications = DriverApplication.query.order_by(DriverApplication.created_at.desc()).all()
        
        return jsonify([{
            "id": app.id,
            "full_name": app.full_name,
            "phone": app.phone,
            "email": app.email,
            "id_number": app.id_number,
            "vehicle_type": app.vehicle_type,
            "vehicle_registration": app.vehicle_registration,
            "license_number": app.license_number,
            "experience": app.experience,
            "availability": app.availability,
            "status": app.status,
            "created_at": app.created_at.isoformat()
        } for app in applications]), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Approve Driver Application (admin only)
@app.route('/api/driver-applications/<int:app_id>/approve', methods=['POST'])
def approve_driver_application(app_id):
    try:
        application = DriverApplication.query.get(app_id)
        
        if not application:
            return jsonify({"error": "Application not found"}), 404
        
        data = request.get_json()
        secret_password = data.get('password')
        
        # Get next driver number
        last_driver = Driver.query.order_by(Driver.driver_number.desc()).first()
        next_driver_number = (last_driver.driver_number + 1) if last_driver else 1
        
        # Create new driver
        new_driver = Driver(
            driver_number=next_driver_number,
            username=application.full_name,
            password=secret_password,
            phone=application.phone,
            email=application.email,
            vehicle_type=application.vehicle_type,
            status='active'
        )
        
        db.session.add(new_driver)
        
        # Update application status
        application.status = 'approved'
        
        db.session.commit()
        
        return jsonify({
            "message": "Driver approved successfully",
            "driver_number": next_driver_number,
            "driver_id": f"DRIVER{next_driver_number}"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
# ===== In-memory storage =====
orders_db = []
loyalty_cards_db = []

# ===== PRODUCTS ENDPOINTS =====
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    in_stock = request.args.get('in_stock')

    filtered_products = PRODUCTS

    if category and category != 'all':
        filtered_products = [p for p in filtered_products if p['category'] == category]

    if in_stock == 'true':
        filtered_products = [p for p in filtered_products if p.get('in_stock', True)]

    return jsonify(filtered_products)


@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404


# ===== ORDERS ENDPOINTS =====
@app.route('/api/orders', methods=['GET'])
def get_orders():
    buyer_email = request.args.get('buyer_email')
    if buyer_email:
        filtered_orders = [o for o in orders_db if o.get('buyer_email') == buyer_email]
        return jsonify(filtered_orders)
    return jsonify(orders_db)


@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        order_id = f"ORD-{len(orders_db) + 1:05d}"

        order = {
            "id": order_id,
            "buyer_email": data.get('buyer_email'),
            "buyer_name": data.get('buyer_name'),
            "items": data.get('items', []),
            "total_amount": data.get('total_amount'),
            "payment_option": data.get('payment_option', '100_percent'),
            "amount_paid": data.get('amount_paid'),
            "status": "pending",
            "delivery_address": data.get('delivery_address'),
            "delivery_phone": data.get('delivery_phone'),
            "notes": data.get('notes', ''),
            "created_at": datetime.now().isoformat()
        }

        orders_db.append(order)
        update_loyalty_card(data.get('buyer_email'))

        return jsonify(order), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    order = next((o for o in orders_db if o['id'] == order_id), None)
    if order:
        return jsonify(order)
    return jsonify({"error": "Order not found"}), 404


@app.route('/api/orders/<order_id>', methods=['PUT'])
def update_order(order_id):
    order = next((o for o in orders_db if o['id'] == order_id), None)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    order.update(data)
    return jsonify(order)


# ===== LOYALTY CARDS =====
@app.route('/api/loyalty-cards', methods=['GET'])
def get_loyalty_cards():
    user_email = request.args.get('email')
    if user_email:
        card = next((c for c in loyalty_cards_db if c['user_email'] == user_email), None)
        return jsonify([card] if card else [])
    return jsonify(loyalty_cards_db)


def update_loyalty_card(user_email):
    if not user_email:
        return

    card = next((c for c in loyalty_cards_db if c['user_email'] == user_email), None)
    if card:
        card['completed_orders'] += 1
        card['current_cycle_orders'] += 1
        if card['current_cycle_orders'] >= 10:
            card['rewards_earned'] += 1
            card['current_cycle_orders'] = 0
    else:
        new_card = {
            "id": f"LC-{len(loyalty_cards_db) + 1:05d}",
            "user_email": user_email,
            "completed_orders": 1,
            "rewards_earned": 0,
            "current_cycle_orders": 1
        }
        loyalty_cards_db.append(new_card)


# ===== CATEGORIES =====
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = {}
    for product in PRODUCTS:
        cat = product['category']
        categories[cat] = categories.get(cat, 0) + 1
    return jsonify(categories)


# ===== SEARCH =====
@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify(PRODUCTS)

    results = [p for p in PRODUCTS if query in p['name'].lower() or query in p.get('description', '').lower()]
    return jsonify(results)


# ===== ERROR HANDLERS =====
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500


# ===== REACT FRONTEND SERVING =====
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


# ===== RUN SERVER =====
if __name__ == '__main__':
    print("🚀 Starting NOORIY Flask Server...")
    print("📦 Loaded", len(PRODUCTS), "products")
    # Use environment port for Render, fallback to 8000 locally
    port = int(os.environ.get('PORT', 9000))
    app.run(host='0.0.0.0', port=port, debug=False)