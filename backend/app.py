from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/health")
def health():
    return {"status": "ok"}

@app.route("/test-db")
def test_db():
    from backend.db import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DATABASE();")
    db = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify({"database": db[0]})

# IMPORT ROUTES AFTER app exists
from backend.routes.auth_routes import auth_routes
from backend.routes.vehicle_routes import vehicle_routes
from backend.routes.maintenance_routes import maintenance_routes
from backend.routes.reminder_routes import reminder_routes
#from backend.routes.vehicle_image_routes import vehicle_image_routes

app.register_blueprint(auth_routes)
app.register_blueprint(vehicle_routes)
app.register_blueprint(maintenance_routes)
app.register_blueprint(reminder_routes)
# app.register_blueprint(vehicle_image_routes)

