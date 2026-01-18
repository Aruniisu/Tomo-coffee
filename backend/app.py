from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pymysql
import bcrypt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
jwt = JWTManager(app)

# Database connection
def get_db_connection():
    return pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        cursorclass=pymysql.cursors.DictCursor
    )

# Authentication endpoint
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            access_token = create_access_token(identity={'username': user['username']})
            return jsonify({'token': access_token, 'username': user['username']}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    finally:
        conn.close()

# Get all products (Protected)
@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM products ORDER BY name")
            products = cursor.fetchall()
        return jsonify(products), 200
    finally:
        conn.close()

# Create new order (Protected)
@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    items = data.get('items', [])
    total_amount = data.get('total_amount', 0)
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Create order
            cursor.execute(
                "INSERT INTO orders (total_amount) VALUES (%s)",
                (total_amount,)
            )
            order_id = cursor.lastrowid
            
            # Add order items and update stock
            for item in items:
                # Get current product details
                cursor.execute(
                    "SELECT price, cost_price, stock_quantity FROM products WHERE id = %s",
                    (item['product_id'],)
                )
                product = cursor.fetchone()
                
                # Insert order item
                cursor.execute("""
                    INSERT INTO order_items 
                    (order_id, product_id, quantity, price_at_sale, cost_at_sale)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    order_id,
                    item['product_id'],
                    item['quantity'],
                    product['price'],
                    product['cost_price']
                ))
                
                # Update stock
                new_stock = product['stock_quantity'] - item['quantity']
                cursor.execute(
                    "UPDATE products SET stock_quantity = %s WHERE id = %s",
                    (new_stock, item['product_id'])
                )
            
            conn.commit()
            return jsonify({'message': 'Order created successfully', 'order_id': order_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Daily sales report (Protected)
@app.route('/api/reports/daily_sales', methods=['GET'])
@jwt_required()
def get_daily_sales():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT COALESCE(SUM(total_amount), 0) as total_sales
                FROM orders 
                WHERE DATE(order_date) = %s
            """, (date,))
            result = cursor.fetchone()
        return jsonify({'date': date, 'total_sales': float(result['total_sales'])}), 200
    finally:
        conn.close()

# Daily profit report (Protected)
@app.route('/api/reports/daily_profit', methods=['GET'])
@jwt_required()
def get_daily_profit():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(oi.quantity * oi.price_at_sale), 0) as total_revenue,
                    COALESCE(SUM(oi.quantity * oi.cost_at_sale), 0) as total_cost
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                WHERE DATE(o.order_date) = %s
            """, (date,))
            result = cursor.fetchone()
            
            total_profit = float(result['total_revenue']) - float(result['total_cost'])
            
        return jsonify({
            'date': date,
            'total_revenue': float(result['total_revenue']),
            'total_cost': float(result['total_cost']),
            'total_profit': total_profit
        }), 200
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)