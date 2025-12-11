# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection
from routes.auth_routes import auth_routes


app = Flask(__name__)
CORS(app)

@app.route("/test-db")
def test_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DATABASE();")
    db = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify({"database": db[0]})

app.register_blueprint(auth_routes)

if __name__ == "__main__":
    app.run(debug=True)
