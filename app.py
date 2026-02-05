from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from models import Product
from routes.products import products_bp

app.register_blueprint(products_bp)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run()
