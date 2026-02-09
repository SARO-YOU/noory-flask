# create_tables.py - Creates all database tables

from app import app, db

with app.app_context():
    print("🗄️ Creating database tables...")
    db.create_all()
    print("✅ All tables created successfully!")
    print("📊 Tables created:")
    print("   - admins")
    print("   - users")
    print("   - drivers")
    print("   - driver_applications")
    print("   - orders")
    print("   - cart_items")
    print("   - feedback")