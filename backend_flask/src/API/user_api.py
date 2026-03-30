from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.database_manager import DatabaseManager


user_api = Blueprint(
    'user_api',
    __name__,
    url_prefix='/api/user',
)
#_db_manager = DatabaseManager()


@user_api.get("/all")
@cross_origin()
@jwt_required()
def get_all_users():
    users = User.get_all()
    return jsonify([user.to_dict() for user in users])


@user_api.get("/online")
@cross_origin()
@jwt_required()
def get_online_users():
    users = User.get_all(online_only=True)
    return jsonify([user.to_dict() for user in users])


@user_api.get("/<int:user_id>")
@cross_origin()
@jwt_required()
def get_user(user_id):
    user_identity = get_jwt_identity()

    if not User.is_authorized(user_identity) or user_identity == user_id:
        return jsonify({"error": "Unauthorized"}), 403

    user = User.get_user(user_id)

    return jsonify([user.to_dict()])


@user_api.put("/<int:user_id>")
@cross_origin()
@jwt_required()
def update_user(user_id):
    user_identity = get_jwt_identity()

    if not User.is_authorized(user_identity) or user_identity == user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    username = data.get('username')
    role_id = data.get('role_id')

    if not username or not role_id:
        return jsonify({"error": "Username and role_id are required"}), 400

    try:
        updated_user = User.update_user(user_id, username, role_id)
        if not updated_user:
            return jsonify({"error": "User not found or update failed"}), 404

        return jsonify(updated_user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500