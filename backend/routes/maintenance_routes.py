from flask import Blueprint, request, jsonify, g
from mysql.connector import Error as MySQLError
from db import get_connection
from utils.auth_role import auth_required

maintenance_routes = Blueprint("maintenance_routes", __name__)

def _vehicle_belongs_to_user(vehicle_id: int, user_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT user_id FROM vehicles WHERE vehicle_id = %s AND is_active = 1",
        (vehicle_id,)
    )
    v = cursor.fetchone()
    cursor.close()
    conn.close()
    return bool(v) and v["user_id"] == user_id


def _maintenance_belongs_to_user(maintenance_id: int, user_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT v.user_id
        FROM maintenance_logs m
        JOIN vehicles v ON v.vehicle_id = m.vehicle_id
        WHERE m.maintenance_id = %s
          AND m.is_active = 1
          AND v.is_active = 1
        """,
        (maintenance_id,)
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return bool(row) and row["user_id"] == user_id


def _fetchall_from_proc(cursor) -> list:
    rows = []
    for r in cursor.stored_results():
        rows = r.fetchall()
    return rows


def _fetchone_from_proc(cursor):
    row = None
    for r in cursor.stored_results():
        row = r.fetchone()
    return row

# CREATE maintenance (per vehicle)-
@maintenance_routes.route("/vehicles/<int:vehicle_id>/maintenance", methods=["POST"])
@auth_required
def create_maintenance(vehicle_id):
    user_id = g.current_user["user_id"]

    if not _vehicle_belongs_to_user(vehicle_id, user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}

    required = ["service_date", "type", "cost", "maintenance_status"]
    missing = [f for f in required if data.get(f) in (None, "", [])]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    try:
        cost_val = float(data["cost"])
        if cost_val < 0:
            return jsonify({"error": "cost must be >= 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "cost must be a number"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    args = [
        vehicle_id,
        data["service_date"],
        data["type"],
        cost_val,
        data["maintenance_status"],
        0 
    ]

    try:
        result = cursor.callproc("create_maintenance_log", args)
        conn.commit()
        new_id = result[-1]
        return jsonify({"maintenance_id": new_id}), 201
    except MySQLError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# READ maintenance by vehicle
@maintenance_routes.route("/vehicles/<int:vehicle_id>/maintenance", methods=["GET"])
@auth_required
def get_maintenance_by_vehicle(vehicle_id):
    user_id = g.current_user["user_id"]

    if not _vehicle_belongs_to_user(vehicle_id, user_id):
        return jsonify({"error": "Forbidden"}), 403

    status = request.args.get("status")  # optional

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.callproc("get_maintenance_logs_by_vehicle", [vehicle_id, status])
        logs = _fetchall_from_proc(cursor)
        return jsonify(logs), 200
    except MySQLError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# READ single maintenance record
@maintenance_routes.route("/maintenance/<int:maintenance_id>", methods=["GET"])
@auth_required
def get_maintenance(maintenance_id):
    user_id = g.current_user["user_id"]

    if not _maintenance_belongs_to_user(maintenance_id, user_id):
        # Do not reveal existence if unauthorized
        return jsonify({"error": "Not found"}), 404

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.callproc("get_maintenance_log_by_id", [maintenance_id])
        log = _fetchone_from_proc(cursor)
        if not log:
            return jsonify({"error": "Not found"}), 404
        return jsonify(log), 200
    except MySQLError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# UPDATE maintenance
@maintenance_routes.route("/maintenance/<int:maintenance_id>", methods=["PUT"])
@auth_required
def update_maintenance(maintenance_id):
    user_id = g.current_user["user_id"]

    if not _maintenance_belongs_to_user(maintenance_id, user_id):
        return jsonify({"error": "Not found"}), 404

    data = request.get_json() or {}
    required = ["service_date", "type", "cost", "maintenance_status"]
    missing = [f for f in required if data.get(f) in (None, "", [])]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        cost_val = float(data["cost"])
        if cost_val < 0:
            return jsonify({"error": "cost must be >= 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "cost must be a number"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.callproc("update_maintenance_log", [
            maintenance_id,
            data["service_date"],
            data["type"],
            cost_val,
            data["maintenance_status"]
        ])
        conn.commit()
        return jsonify({"message": "Maintenance updated"}), 200
    except MySQLError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# DELETE maintenance
@maintenance_routes.route("/maintenance/<int:maintenance_id>", methods=["DELETE"])
@auth_required
def delete_maintenance(maintenance_id):
    user_id = g.current_user["user_id"]

    if not _maintenance_belongs_to_user(maintenance_id, user_id):
        return jsonify({"error": "Not found"}), 404

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.callproc("delete_maintenance_log", [maintenance_id])
        conn.commit()
        return jsonify({"message": "Maintenance deleted"}), 200
    except MySQLError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()
