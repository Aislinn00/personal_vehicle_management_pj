from functools import wraps
from flask import request, jsonify, g
import jwt
from utils.jwt_utils import decode_token, SECRET_KEY, ALGORITHM


def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or invalid"}), 401

        token = auth_header.split(" ", 1)[1].strip()

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        g.current_user = {
            "user_id": payload.get("user_id"),
            "role": payload.get("role"),
        }
        return f(*args, **kwargs)

    return wrapper


def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            current = getattr(g, "current_user", None)
            if not current:
                return jsonify({"error": "Not authenticated"}), 401

            if current.get("role") not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient role"}), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator
