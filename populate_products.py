from app import app, db
from models import Product

kenyan_products = [
    {"name": "Tusker Lager Beer 500ml", "price": 250.0, "category": "beverages", "image_url": "https://example.com/tusker.jpg"},
    {"name": "Blue Band Margarine 500g", "price": 180.0, "category": "dairy", "image_url": "https://example.com/blueband.jpg"},
    {"name": "UHT Milk 1L", "price": 120.0, "category": "dairy", "image_url": "https://example.com/milk.jpg"},
    {"name": "Aloevera Soap", "price": 50.0, "category": "personal_care", "image_url": "https://example.com/aloevera_soap.jpg"},
    {"name": "Sunlight Dishwashing Liquid 750ml", "price": 220.0, "category": "household", "image_url": "https://example.com/sunlight.jpg"},
    {"name": "Maize Flour 2kg", "price": 250.0, "category": "groceries", "image_url": "https://example.com/maize_flour.jpg"},
    {"name": "Indomie Instant Noodles 70g", "price": 30.0, "category": "snacks", "image_url": "https://example.com/indomie.jpg"},
    {"name": "Chipsy Potato Chips 50g", "price": 40.0, "category": "snacks", "image_url": "https://example.com/chipsy.jpg"},
    {"name": "Coca-Cola 1.5L", "price": 180.0, "category": "beverages", "image_url": "https://example.com/coke.jpg"},
    {"name": "Eggs 12 pack", "price": 400.0, "category": "dairy", "image_url": "https://example.com/eggs.jpg"},
]

with app.app_context():
    for prod in kenyan_products:
        p = Product(
            name=prod["name"],
            price=prod["price"],
            in_stock=True,
            category=prod["category"],
            image_url=prod["image_url"]
        )
        db.session.add(p)
    db.session.commit()
    print("Products added successfully!")
