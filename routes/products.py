from flask import Blueprint, jsonify

products_bp = Blueprint("products", __name__)

@products_bp.route("/api/test")
def test_api():
    return jsonify({"status": "OK", "source": "products blueprint"})
