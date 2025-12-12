from flask import Blueprint, request, jsonify, g
from db import get_connection
from utils.auth_role import auth_required
from utils.azure_blob import upload_vehicle_image

vehicle_image_routes = Blueprint("vehicle_image_routes", __name__)


def _vehicle_owned(vehicle_id, user_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT user_id FROM vehicles WHERE vehicle_id = %s AND is_active = 1",
        (vehicle_id,)
    )
    vehicle = cur.fetchone()
    cur.close()
    conn.close()
    return vehicle and vehicle["user_id"] == user_id

# UPLOAD IMAGE (AZURE)

@vehicle_image_routes.route("/vehicles/<int:vehicle_id>/images/upload", methods=["POST"])
@auth_required
def upload_image(vehicle_id):
    if not _vehicle_owned(vehicle_id, g.current_user["user_id"]):
        return jsonify({"error": "Forbidden"}), 403

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Upload to Azure Blob
    image_url = upload_vehicle_image(file, vehicle_id)

    # Save URL in DB
    conn = get_connection()
    cur = conn.cursor()
    res = cur.callproc(
        "create_vehicle_image",
        [vehicle_id, image_url, 0]
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "photo_id": res[-1],
        "image_path": image_url
    }), 201

# LIST IMAGES FOR VEHICLE

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

# GET SINGLE IMAGE
@vehicle_image_routes.route("/images/<int:photo_id>", methods=["GET"])
@auth_required
def get_vehicle_image(photo_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.callproc("get_vehicle_image_by_id", [photo_id])

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

# SOFT DELETE IMAGE
@vehicle_image_routes.route("/images/<int:photo_id>", methods=["DELETE"])
@auth_required
def delete_vehicle_image(photo_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.callproc("sp_delete_vehicle_image", [photo_id])
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Image deleted"}), 200
