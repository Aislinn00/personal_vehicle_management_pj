from flask import Blueprint, request, jsonify, g
from db import get_connection
from utils.auth_role import auth_required

reminder_routes = Blueprint("reminder_routes", __name__)


def _vehicle_owned(vehicle_id, user_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT user_id FROM vehicles WHERE vehicle_id = %s AND is_active = 1",
        (vehicle_id,)
    )
    v = cur.fetchone()
    cur.close()
    conn.close()
    return v and v["user_id"] == user_id


# CREATE
@reminder_routes.route("/vehicles/<int:vehicle_id>/reminders", methods=["POST"])
@auth_required
def create_reminder(vehicle_id):
    if not _vehicle_owned(vehicle_id, g.current_user["user_id"]):
        return jsonify({"error": "Forbidden"}), 403

    d = request.get_json() or {}
    required = ["title", "reminder_type", "priority"]
    missing = [f for f in required if not d.get(f)]
    if missing:
        return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

    conn = get_connection()
    cur = conn.cursor()

    args = [
        vehicle_id,
        d["title"],
        d["reminder_type"],
        d["priority"],
        0
    ]

    res = cur.callproc("create_reminder", args)
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"reminder_id": res[-1]}), 201


# FILTER (dashboard)
@reminder_routes.route("/reminders", methods=["GET"])
@auth_required
def list_reminders():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.callproc("filter_reminders", [
        g.current_user["user_id"],
        request.args.get("vehicle_id", type=int),
        request.args.get("status")
    ])

    rows = []
    for r in cur.stored_results():
        rows = r.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows), 200


# GET ONE
@reminder_routes.route("/reminders/<int:reminder_id>", methods=["GET"])
@auth_required
def get_reminder(reminder_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.callproc("get_reminder_by_id", [reminder_id])

    reminder = None
    for r in cur.stored_results():
        reminder = r.fetchone()

    cur.close()
    conn.close()

    if not reminder:
        return jsonify({"error": "Not found"}), 404

    if not _vehicle_owned(reminder["vehicle_id"], g.current_user["user_id"]):
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(reminder), 200


# UPDATE
@reminder_routes.route("/reminders/<int:reminder_id>", methods=["PUT"])
@auth_required
def update_reminder(reminder_id):
    d = request.get_json() or {}

    conn = get_connection()
    cur = conn.cursor()

    cur.callproc("update_reminder", [
        reminder_id,
        d["title"],
        d["reminder_type"],
        d["priority"]
    ])

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Reminder updated"}), 200


# COMPLETE
@reminder_routes.route("/reminders/<int:reminder_id>/complete", methods=["PATCH"])
@auth_required
def complete_reminder(reminder_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.callproc("complete_reminder", [reminder_id])
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Reminder completed"}), 200


# DELETE (SOFT)
@reminder_routes.route("/reminders/<int:reminder_id>", methods=["DELETE"])
@auth_required
def delete_reminder(reminder_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.callproc("delete_reminder", [reminder_id])
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Reminder deleted"}), 200
