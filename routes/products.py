from flask import Blueprint, jsonify
from models import Product

products_bp = Blueprint("products", __name__)

@products_bp.route("/api/products")
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])
