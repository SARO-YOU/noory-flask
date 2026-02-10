import sqlite3
from products import PRODUCTS

DATABASE = 'nooriy.db'

def import_products():
    """Import all products from products.py into the database"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Clear existing products
    cursor.execute('DELETE FROM products')
    print('🗑️ Cleared existing products')
    
    # Import all products
    imported = 0
    for product in PRODUCTS:
        try:
            # Map the product structure from products.py to database
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
    
    print(f'✅ Successfully imported {imported} products!')
    print(f'📦 Total products in database: {imported}')

if __name__ == '__main__':
    import_products()