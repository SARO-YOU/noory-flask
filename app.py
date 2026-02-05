from flask import Flask, render_template
from models import Product
from routes.products import products_bp
app.register_blueprint(products_bp)

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run()
