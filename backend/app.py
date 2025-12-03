from flask import Flask, jsonify
from db import get_connection
from routes.vehicle_routes import vehicle_routes

app = Flask(__name__)

@app.route('/test-db')
def test_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DATABASE();")
    db = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify({"database": db[0]})

if __name__ == "__main__":
    app.run(debug=True)
    
app.register_blueprint(vehicle_routes)
