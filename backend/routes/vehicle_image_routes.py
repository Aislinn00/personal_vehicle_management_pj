from flask import Blueprint, request, jsonify, g
from db import get_connection
from utils.auth_role import auth_required
from utils.azure_blob import upload_to_blob

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
    return bool(v) and v["user_id"] == user_id

def _image_owned(photo_id, user_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT v.user_id
        FROM vehicle_images vi
        JOIN vehicles v ON v.vehicle_id = vi.vehicle_id
        WHERE vi.photo_id = %s
          AND vi.is_active = 1
          AND v.is_active = 1
        """,
        (photo_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return bool(row) and row["user_id"] == user_id


# GET images

@vehicle_image_routes.route("/vehicles/<int:vehicle_id>/images", methods=["GET"])
@auth_required
def list_vehicle_images(vehicle_id):
    user_id = g.current_user["user_id"]

    if not _vehicle_owned(vehicle_id, user_id):
        return jsonify({"error": "Forbidden"}), 403

    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        """
        SELECT photo_id, image_path
        FROM vehicle_images
        WHERE vehicle_id = %s
          AND is_active = 1
        ORDER BY photo_id DESC
        """,
        (vehicle_id,)
    )
    images = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(images), 200


# UPLOAD image

@vehicle_image_routes.route("/vehicles/<int:vehicle_id>/images", methods=["POST"])
@auth_required
def upload_vehicle_image(vehicle_id):
    user_id = g.current_user["user_id"]

    if not _vehicle_owned(vehicle_id, user_id):
        return jsonify({"error": "Forbidden"}), 403

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]

    if not file or file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Validate content type
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        return jsonify({"error": "Invalid image type"}), 400

    # Optional size check (5MB)
    if file.content_length and file.content_length > 5 * 1024 * 1024:
        return jsonify({"error": "File too large (max 5MB)"}), 400

    # Upload to Azure Blob
    image_url = upload_to_blob(file, vehicle_id)

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO vehicle_images (vehicle_id, image_path, is_active)
            VALUES (%s, %s, 1)
            """,
            (vehicle_id, image_url)
        )
        conn.commit()
        return jsonify({"image_path": image_url}), 201
    finally:
        cur.close()
        conn.close()


# DELETE image (SOFT)

@vehicle_image_routes.route("/vehicle-images/<int:photo_id>", methods=["DELETE"])
@auth_required
def delete_vehicle_image(photo_id):
    user_id = g.current_user["user_id"]

    if not _image_owned(photo_id, user_id):
        return jsonify({"error": "Not found"}), 404

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            UPDATE vehicle_images
            SET is_active = 0
            WHERE photo_id = %s
            """,
            (photo_id,)
        )
        conn.commit()
        return jsonify({"message": "Image deleted"}), 200
    finally:
        cur.close()
        conn.close()
