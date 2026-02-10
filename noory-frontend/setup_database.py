import sqlite3
from products import PRODUCTS

DATABASE = 'nooriy.db'

def init_database():
    """Create all database tables and import products"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    print('📦 Creating database tables...')
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print('✅ Users table created')
    
    # Products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            image TEXT,
            stock INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print('✅ Products table created')
    
    # Orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            delivery_fee REAL DEFAULT 50,
            status TEXT DEFAULT 'pending',
            driver_id INTEGER,
            payment_status TEXT DEFAULT 'pending',
            mpesa_code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            delivered_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (driver_id) REFERENCES drivers (id)
        )
    ''')
    print('✅ Orders table created')
    
    # Order items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    print('✅ Order items table created')
    
    # Drivers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS drivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            password TEXT NOT NULL,
            vehicle TEXT,
            license_plate TEXT,
            status TEXT DEFAULT 'active',
            total_earnings REAL DEFAULT 0,
            total_deliveries INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print('✅ Drivers table created')
    
    # Feedback table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    print('✅ Feedback table created')
    
    # Driver applications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS driver_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            vehicle TEXT,
            license_plate TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print('✅ Driver applications table created')
    
    # Password reset tokens table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    print('✅ Password reset tokens table created')
    
    conn.commit()
    
    # Now import products
    print('\n📦 Importing products...')
    
    # Clear existing products
    cursor.execute('DELETE FROM products')
    
    # Import all products
    imported = 0
    for product in PRODUCTS:
        try:
            cursor.execute('''
                INSERT INTO products (name, price, category, description, image, stock)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                product['name'],
                product['price'],
                product['category'],
                product['description'],
                product['image_url'],
                100  # Default stock
            ))
            imported += 1
        except Exception as e:
            print(f'❌ Error importing {product["name"]}: {str(e)}')
    
    conn.commit()
    conn.close()
    
    print(f'\n🎉 SUCCESS!')
    print(f'✅ Successfully imported {imported} products!')
    print(f'📦 Database ready with all tables and products!')

if __name__ == '__main__':
    init_database()