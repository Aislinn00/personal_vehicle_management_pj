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
    return bool(v) and v["user_id"] == user_id


def _reminder_belongs_to_user(reminder_id, user_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT v.user_id
        FROM reminders r
        JOIN vehicles v ON v.vehicle_id = r.vehicle_id
        WHERE r.reminder_id = %s
          AND r.is_active = 1
          AND v.is_active = 1
        """,
        (reminder_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return bool(row) and row["user_id"] == user_id


def _fetchall_from_proc(cur):
    rows = []
    for r in cur.stored_results():
        rows = r.fetchall()
    return rows


def _fetchone_from_proc(cur):
    row = None
    for r in cur.stored_results():
        row = r.fetchone()
    return row


# CREATE (per vehicle)

@reminder_routes.route("/vehicles/<int:vehicle_id>/reminders", methods=["POST"])
@auth_required
def create_reminder(vehicle_id):
    user_id = g.current_user["user_id"]

    if not _vehicle_owned(vehicle_id, user_id):
        return jsonify({"error": "Forbidden"}), 403

    d = request.get_json() or {}
    required = ["title", "reminder_type", "priority"]
    missing = [f for f in required if d.get(f) in (None, "", [])]
    if missing:
        return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

    if d["reminder_type"] not in ("DATE", "MILEAGE", "BOTH"):
        return jsonify({"error": "Invalid reminder_type"}), 400

    if d["priority"] not in ("low", "medium", "high"):
        return jsonify({"error": "Invalid priority"}), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        res = cur.callproc("create_reminder", [
            vehicle_id,
            d["title"],
            d["reminder_type"],
            d["priority"],
            0  # is_active
        ])
        conn.commit()
        return jsonify({"reminder_id": res[-1]}), 201
    finally:
        cur.close()
        conn.close()


# READ (per vehicle)

@reminder_routes.route("/vehicles/<int:vehicle_id>/reminders", methods=["GET"])
@auth_required
def list_reminders_by_vehicle(vehicle_id):
    user_id = g.current_user["user_id"]

    if not _vehicle_owned(vehicle_id, user_id):
        return jsonify({"error": "Forbidden"}), 403

    status = request.args.get("status")  # upcoming | completed | None

    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.callproc("get_reminders_by_vehicle", [
            vehicle_id,
            status
        ])
        rows = _fetchall_from_proc(cur)
        return jsonify(rows), 200
    finally:
        cur.close()
        conn.close()


# READ ONE

@reminder_routes.route("/reminders/<int:reminder_id>", methods=["GET"])
@auth_required
def get_reminder(reminder_id):
    user_id = g.current_user["user_id"]

    if not _reminder_belongs_to_user(reminder_id, user_id):
        return jsonify({"error": "Not found"}), 404

    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.callproc("get_reminder_by_id", [reminder_id])
        reminder = _fetchone_from_proc(cur)
        if not reminder:
            return jsonify({"error": "Not found"}), 404
        return jsonify(reminder), 200
    finally:
        cur.close()
        conn.close()


# UPDATE

@reminder_routes.route("/reminders/<int:reminder_id>", methods=["PUT"])
@auth_required
def update_reminder(reminder_id):
    user_id = g.current_user["user_id"]

    if not _reminder_belongs_to_user(reminder_id, user_id):
        return jsonify({"error": "Not found"}), 404

    d = request.get_json() or {}
    required = ["title", "reminder_type", "priority"]
    missing = [f for f in required if d.get(f) in (None, "", [])]
    if missing:
        return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.callproc("update_reminder", [
            reminder_id,
            d["title"],
            d["reminder_type"],
            d["priority"]
        ])
        conn.commit()
        return jsonify({"message": "Reminder updated"}), 200
    finally:
        cur.close()
        conn.close()


# MARK COMPLETED

@reminder_routes.route("/reminders/<int:reminder_id>/complete", methods=["PUT"])
@auth_required
def complete_reminder(reminder_id):
    user_id = g.current_user["user_id"]

    if not _reminder_belongs_to_user(reminder_id, user_id):
        return jsonify({"error": "Not found"}), 404

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.callproc("mark_reminder_completed", [reminder_id])
        conn.commit()
        return jsonify({"message": "Reminder completed"}), 200
    finally:
        cur.close()
        conn.close()


# DELETE (SOFT)

@reminder_routes.route("/reminders/<int:reminder_id>", methods=["DELETE"])
@auth_required
def delete_reminder(reminder_id):
    user_id = g.current_user["user_id"]

    if not _reminder_belongs_to_user(reminder_id, user_id):
        return jsonify({"error": "Not found"}), 404

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.callproc("delete_reminder", [reminder_id])
        conn.commit()
        return jsonify({"message": "Reminder deleted"}), 200
    finally:
        cur.close()
        conn.close()
