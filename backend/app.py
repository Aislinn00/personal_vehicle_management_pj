from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)

@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users")     # change table name as needed
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(result), 200


@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO users (name) VALUES (%s)", (name,))
    conn.commit()

    cursor.close()
    conn.close()
    return jsonify({"message": "User added"}), 201


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True)
