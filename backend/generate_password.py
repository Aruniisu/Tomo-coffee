# save as hash_password.py
import bcrypt

# Password to hash
password = "password123"

# Generate hash
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

print("Use this SQL command:")
print(f"INSERT INTO users (username, password_hash) VALUES ('cashier', '{hashed.decode()}');")