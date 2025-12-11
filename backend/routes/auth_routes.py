from flask import Blueprint, request, jsonify, g
from mysql.connector import Error as MySQLError
from db import get_connection
from utils.hashing import hash_password, check_password
from utils.jwt_utils import create_token
from utils.auth_role import auth_required

auth_routes = Blueprint("auth_routes", __name__)


# ---------- REGISTER ----------
@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "PRIMARY")

    missing = [f for f in ["full_name", "email", "password"] if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    hashed_pw = hash_password(password)

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        args = [full_name, email, hashed_pw, role, 0]
        result = cursor.callproc("create_user", args)
        conn.commit()

        new_user_id = result[-1]
    except MySQLError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return jsonify({
        "message": "User registered successfully",
        "user_id": new_user_id
    }), 201


# ---------- LOGIN ----------
@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = None
    cursor = None
    user = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # returns a result set
        cursor.callproc("get_user_by_email", [email])

        for result in cursor.stored_results():
            user = result.fetchone()
            break

    except MySQLError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 400

    if user.get("is_active") != 1:
        return jsonify({"error": "Account is inactive"}), 403

    if not check_password(password, user["password"]):
        return jsonify({"error": "Invalid email or password"}), 400

    token = create_token(user["user_id"], user["role"])

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


# ---------- LOGOUT ----------
@auth_routes.route("/logout", methods=["POST"])
@auth_required
def logout():
    return jsonify({"message": "Logged out. Please delete the token on the client."}), 200


# ---------- WHO AM I ----------
@auth_routes.route("/me", methods=["GET"])
@auth_required
def me():

    #returns the current authenticated user's basic info.
    from db import get_connection
    user_id = g.current_user["user_id"]

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT user_id, full_name, email, role, is_active, created_at, updated_at "
        "FROM users WHERE user_id = %s",
        (user_id,)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user or user["is_active"] != 1:
        return jsonify({"error": "User not found or inactive"}), 404

    return jsonify({"user": user}), 200
