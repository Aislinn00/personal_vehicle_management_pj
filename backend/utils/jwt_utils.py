import os
import jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta
from flask import request, jsonify, g

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
TOKEN_EXP_HOURS = 168

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is missing.")

def create_token(user_id: int, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXP_HOURS)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
   

    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def auth_required(f):
    from functools import wraps

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
            "role": payload.get("role")
        }
        return f(*args, **kwargs)

    return wrapper
