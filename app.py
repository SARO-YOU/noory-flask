# app.py - COMPLETE FLASK BACKEND

from flask import Flask, jsonify, request
from flask_cors import CORS
from products import PRODUCTS
import json
from datetime import datetime

app = Flask(__name__)

# Enable CORS for all routes - CRITICAL for frontend connection!
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# In-memory storage (replace with database later)
orders_db = []
loyalty_cards_db = []

# ===== ROOT ROUTE =====
@app.route('/')
def home():
    return jsonify({
        "message": "🚀 NOORIY API is LIVE!",
        "status": "running",
        "endpoints": {
            "products": "/api/products",
            "orders": "/api/orders",
            "loyalty_cards": "/api/loyalty-cards"
        }
    })

# ===== HEALTH CHECK =====
@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# ===== PRODUCTS ENDPOINTS =====
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products or filter by category/stock"""
    category = request.args.get('category')
    in_stock = request.args.get('in_stock')
    
    filtered_products = PRODUCTS
    
    # Filter by category
    if category and category != 'all':
        filtered_products = [p for p in filtered_products if p['category'] == category]
    
    # Filter by stock status
    if in_stock == 'true':
        filtered_products = [p for p in filtered_products if p.get('in_stock', True)]
    
    return jsonify(filtered_products)

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID"""
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

# ===== ORDERS ENDPOINTS =====
@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders or filter by buyer email"""
    buyer_email = request.args.get('buyer_email')
    
    if buyer_email:
        filtered_orders = [o for o in orders_db if o.get('buyer_email') == buyer_email]
        return jsonify(filtered_orders)
    
    return jsonify(orders_db)

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.get_json()
        
        # Generate order ID
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
        
        # Update loyalty card
        update_loyalty_card(data.get('buyer_email'))
        
        return jsonify(order), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """Get single order by ID"""
    order = next((o for o in orders_db if o['id'] == order_id), None)
    if order:
        return jsonify(order)
    return jsonify({"error": "Order not found"}), 404

@app.route('/api/orders/<order_id>', methods=['PUT'])
def update_order(order_id):
    """Update order status"""
    order = next((o for o in orders_db if o['id'] == order_id), None)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    data = request.get_json()
    order.update(data)
    
    return jsonify(order)

# ===== LOYALTY CARDS ENDPOINTS =====
@app.route('/api/loyalty-cards', methods=['GET'])
def get_loyalty_cards():
    """Get loyalty card by user email"""
    user_email = request.args.get('email')
    
    if user_email:
        card = next((c for c in loyalty_cards_db if c['user_email'] == user_email), None)
        if card:
            return jsonify([card])  # Return as array for compatibility
        return jsonify([])
    
    return jsonify(loyalty_cards_db)

def update_loyalty_card(user_email):
    """Update or create loyalty card after order"""
    if not user_email:
        return
    
    card = next((c for c in loyalty_cards_db if c['user_email'] == user_email), None)
    
    if card:
        card['completed_orders'] += 1
        card['current_cycle_orders'] += 1
        
        # Award reward every 10 orders
        if card['current_cycle_orders'] >= 10:
            card['rewards_earned'] += 1
            card['current_cycle_orders'] = 0
    else:
        # Create new loyalty card
        new_card = {
            "id": f"LC-{len(loyalty_cards_db) + 1:05d}",
            "user_email": user_email,
            "completed_orders": 1,
            "rewards_earned": 0,
            "current_cycle_orders": 1
        }
        loyalty_cards_db.append(new_card)

# ===== CATEGORIES ENDPOINT =====
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all product categories with counts"""
    categories = {}
    for product in PRODUCTS:
        cat = product['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    return jsonify(categories)

# ===== SEARCH ENDPOINT =====
@app.route('/api/products/search', methods=['GET'])
def search_products():
    """Search products by name or description"""
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify(PRODUCTS)
    
    results = [
        p for p in PRODUCTS 
        if query in p['name'].lower() or query in p.get('description', '').lower()
    ]
    
    return jsonify(results)

# ===== ERROR HANDLERS =====
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# ===== RUN SERVER =====
if __name__ == '__main__':
    print("🚀 Starting NOORIY Flask Server...")
    print("📦 Loaded", len(PRODUCTS), "products")
    app.run(host='0.0.0.0', port=5000, debug=True)