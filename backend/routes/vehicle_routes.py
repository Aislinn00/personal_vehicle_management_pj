from flask import Blueprint, request, jsonify, g
from mysql.connector import Error as MySQLError
from db import get_connection
from utils.auth_role import auth_required

vehicle_routes = Blueprint("vehicle_routes", __name__)


# --------- validate required fields ---------
def _validate_vehicle_payload(data, require_all=True):
    required_fields = ["make", "model", "year", "registration_number", "fuel_type", "mileage"]
    if require_all:
        missing = [f for f in required_fields if data.get(f) in (None, "")]
    else:
        missing = []
    return missing


# ---------- CREATE VEHICLE (CURRENT USER) ----------
@vehicle_routes.route("/vehicles", methods=["POST"])
@auth_required
def create_vehicle():
    data = request.get_json() or {}
    missing = _validate_vehicle_payload(data, require_all=True)
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    user_id = g.current_user["user_id"]

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        args = [
            user_id,
            data["make"],
            data["model"],
            int(data["year"]),
            data["registration_number"],
            data["fuel_type"],
            int(data["mileage"]),
            0,
        ]

        result_args = cursor.callproc("create_vehicle", args)
        conn.commit()

        new_vehicle_id = result_args[-1]

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
        "message": "Vehicle created successfully",
        "vehicle_id": new_vehicle_id
    }), 201


# ---------- LIST VEHICLES (CURRENT USER) ----------
@vehicle_routes.route("/vehicles", methods=["GET"])
@auth_required
def list_vehicles():
    user_id = g.current_user["user_id"]

    conn = None
    cursor = None
    vehicles = []

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # sp_get_vehicles(IN p_user_id)
        cursor.callproc("get_all_vehicles", [user_id])

        for result in cursor.stored_results():
            vehicles = result.fetchall()
            break

    except MySQLError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return jsonify(vehicles), 200


# ---------- GET SINGLE VEHICLE (CURRENT USER) ----------
@vehicle_routes.route("/vehicles/<int:vehicle_id>", methods=["GET"])
@auth_required
def get_vehicle(vehicle_id):
    user_id = g.current_user["user_id"]

    conn = None
    cursor = None
    vehicle = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.callproc("get_vehicle_by_id", [vehicle_id])

        for result in cursor.stored_results():
            vehicle = result.fetchone()
            break

    except MySQLError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    if vehicle["user_id"] != user_id:
        return jsonify({"error": "Forbidden: this vehicle does not belong to you"}), 403

    return jsonify(vehicle), 200


# ---------- UPDATE VEHICLE (CURRENT USER) ----------
@vehicle_routes.route("/vehicles/<int:vehicle_id>", methods=["PUT"])
@auth_required
def update_vehicle(vehicle_id):
    user_id = g.current_user["user_id"]
    data = request.get_json() or {}
    missing = _validate_vehicle_payload(data, require_all=True)
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # Load vehicle to check ownership (using get_vehicle_by_id)
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.callproc("get_vehicle_by_id", [vehicle_id])
        vehicle = None
        for result in cursor.stored_results():
            vehicle = result.fetchone()
            break

        if not vehicle:
            cursor.close()
            conn.close()
            return jsonify({"error": "Vehicle not found"}), 404

        if vehicle["user_id"] != user_id:
            cursor.close()
            conn.close()
            return jsonify({"error": "Forbidden: this vehicle does not belong to you"}), 403

        cursor.close()

        cursor = conn.cursor()
        args = [
            vehicle_id,
            data["make"],
            data["model"],
            int(data["year"]),
            data["registration_number"],
            data["fuel_type"],
            int(data["mileage"]),
        ]

        cursor.callproc("update_vehicle", args)
        conn.commit()

    except MySQLError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return jsonify({"message": "Vehicle updated successfully"}), 200


# ---------- SOFT DELETE VEHICLE (CURRENT USER) ----------
@vehicle_routes.route("/vehicles/<int:vehicle_id>", methods=["DELETE"])
@auth_required
def delete_vehicle(vehicle_id):
    user_id = g.current_user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Check ownership first
        cursor.callproc("get_vehicle_by_id", [vehicle_id])
        vehicle = None
        for result in cursor.stored_results():
            vehicle = result.fetchone()
            break

        if not vehicle:
            cursor.close()
            conn.close()
            return jsonify({"error": "Vehicle not found"}), 404

        if vehicle["user_id"] != user_id:
            cursor.close()
            conn.close()
            return jsonify({"error": "Forbidden: this vehicle does not belong to you"}), 403

        cursor.close()

        # Now soft delete
        cursor = conn.cursor()
        cursor.callproc("sp_delete_vehicle", [vehicle_id])
        conn.commit()

    except MySQLError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return jsonify({"message": "Vehicle deleted successfully"}), 200
