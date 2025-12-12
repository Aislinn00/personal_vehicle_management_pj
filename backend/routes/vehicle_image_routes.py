from flask import Blueprint, request, jsonify, g
from db import get_connection
from utils.auth_role import auth_required

vehicle_image_routes = Blueprint("vehicle_image_routes", __name__)


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
@vehicle_image_routes.route("/vehicles/<int:vehicle_id>/images", methods=["POST"])
@auth_required
def add_vehicle_image(vehicle_id):
    if not _vehicle_owned(vehicle_id, g.current_user["user_id"]):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    if not data.get("image_path"):
        return jsonify({"error": "image_path required"}), 400

    conn = get_connection()
    cur = conn.cursor()

    args = [vehicle_id, data["image_path"], 0]
    res = cur.callproc("create_vehicle_image", args)
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"image_id": res[-1]}), 201


# LIST images for vehicle
@vehicle_image_routes.route("/vehicles/<int:vehicle_id>/images", methods=["GET"])
@auth_required
def list_vehicle_images(vehicle_id):
    if not _vehicle_owned(vehicle_id, g.current_user["user_id"]):
        return jsonify({"error": "Forbidden"}), 403

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.callproc("get_vehicle_images", [vehicle_id])

    images = []
    for r in cur.stored_results():
        images = r.fetchall()

    cur.close()
    conn.close()
    return jsonify(images), 200


# GET one image
@vehicle_image_routes.route("/images/<int:image_id>", methods=["GET"])
@auth_required
def get_vehicle_image(image_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.callproc("get_vehicle_image_by_id", [image_id])

    image = None
    for r in cur.stored_results():
        image = r.fetchone()

    cur.close()
    conn.close()

    if not image:
        return jsonify({"error": "Not found"}), 404

    if not _vehicle_owned(image["vehicle_id"], g.current_user["user_id"]):
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(image), 200


# UPDATE
@vehicle_image_routes.route("/images/<int:image_id>", methods=["PUT"])
@auth_required
def update_vehicle_image(image_id):
    data = request.get_json() or {}
    if not data.get("image_path"):
        return jsonify({"error": "image_path required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.callproc("update_vehicle_image", [image_id, data["image_path"]])
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Image updated"}), 200


# DELETE (soft)
@vehicle_image_routes.route("/images/<int:image_id>", methods=["DELETE"])
@auth_required
def delete_vehicle_image(image_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.callproc("delete_vehicle_image", [image_id])
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Image deleted"}), 200
