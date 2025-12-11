from flask import Blueprint, request, jsonify, g
from mysql.connector import Error as MySQLError
from db import get_connection
from utils.auth_role import auth_required

maintenance_routes = Blueprint("maintenance_routes", __name__)


def _vehicle_belongs_to_user(vehicle_id, user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT user_id FROM vehicles WHERE vehicle_id = %s AND is_active = 1",
        (vehicle_id,)
    )
    v = cursor.fetchone()
    cursor.close()
    conn.close()
    return v and v["user_id"] == user_id


# CREATE
@maintenance_routes.route("/vehicles/<int:vehicle_id>/maintenance", methods=["POST"])
@auth_required
def create_maintenance(vehicle_id):
    user_id = g.current_user["user_id"]
    if not _vehicle_belongs_to_user(vehicle_id, user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    required = ["service_date", "type", "cost", "maintenance_status"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    args = [
        vehicle_id,
        data["service_date"],
        data["type"],
        float(data["cost"]),
        data["maintenance_status"],
        0
    ]

    try:
        result = cursor.callproc("create_maintenance_log", args)
        conn.commit()
    except MySQLError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"maintenance_id": result[-1]}), 201


# READ (FILTERED)
@maintenance_routes.route("/maintenance/filter", methods=["GET"])
@auth_required
def filter_maintenance():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.callproc("filter_maintenance_logs", [
        g.current_user["user_id"],
        request.args.get("vehicle_id", type=int),
        request.args.get("status"),
        request.args.get("from_date"),
        request.args.get("to_date")
    ])

    logs = []
    for r in cursor.stored_results():
        logs = r.fetchall()

    cursor.close()
    conn.close()
    return jsonify(logs), 200


# READ (ONE)
@maintenance_routes.route("/maintenance/<int:maintenance_id>", methods=["GET"])
@auth_required
def get_maintenance(maintenance_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.callproc("get_maintenance_log_by_id", [maintenance_id])

    log = None
    for r in cursor.stored_results():
        log = r.fetchone()

    cursor.close()
    conn.close()

    if not log:
        return jsonify({"error": "Not found"}), 404

    if not _vehicle_belongs_to_user(log["vehicle_id"], g.current_user["user_id"]):
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(log), 200


# UPDATE
@maintenance_routes.route("/maintenance/<int:maintenance_id>", methods=["PUT"])
@auth_required
def update_maintenance(maintenance_id):
    data = request.get_json() or {}
    required = ["service_date", "type", "cost", "maintenance_status"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.callproc("update_maintenance_log", [
            maintenance_id,
            data["service_date"],
            data["type"],
            float(data["cost"]),
            data["maintenance_status"]
        ])
        conn.commit()
    except MySQLError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Maintenance updated"}), 200


# DELETE (SOFT)
@maintenance_routes.route("/maintenance/<int:maintenance_id>", methods=["DELETE"])
@auth_required
def delete_maintenance(maintenance_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.callproc("delete_maintenance_log", [maintenance_id])
        conn.commit()
    except MySQLError as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Maintenance deleted"}), 200
