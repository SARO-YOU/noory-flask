from db import db

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    in_stock = db.Column(db.Boolean, default=True)
    category = db.Column(db.String(50), default="other")
    image_url = db.Column(db.String(200), default="")
