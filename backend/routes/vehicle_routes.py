from flask import Blueprint, request, jsonify
from db import get_connection

vehicle_routes = Blueprint("vehicle_routes", __name__)

@vehicle_routes.route("/vehicles", methods=["POST"])
def create_vehicle():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO vehicles 
        (user_id, make, model, year, registration_number, fuel_type, mileage)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    cursor.execute(query, (
        data["user_id"],
        data["make"],
        data["model"],
        data["year"],
        data["registration_number"],
        data["fuel_type"],
        data["mileage"]
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Vehicle created successfully"}), 201
