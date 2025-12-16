from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://personal-vehicle-management-pj.vercel.app",
]

CORS(
    app,
    resources={r"/*": {"origins": [r"https://.*\.vercel\.app", "http://localhost:5173"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

@app.route("/health")
def health():
    return {"status": "ok"}

@app.route("/test-db")
def test_db():
    from db import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DATABASE();")
    db = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify({"database": db[0]})

# IMPORT ROUTES AFTER app exists
from routes.auth_routes import auth_routes
from routes.vehicle_routes import vehicle_routes
from routes.maintenance_routes import maintenance_routes
from routes.reminder_routes import reminder_routes
from routes.vehicle_image_routes import vehicle_image_routes


app.register_blueprint(auth_routes)
app.register_blueprint(vehicle_routes)
app.register_blueprint(maintenance_routes)
app.register_blueprint(reminder_routes)
app.register_blueprint(vehicle_image_routes) 

