from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Role import Role
from backend_flask.src.db.database_manager import DatabaseManager


auth_api = Blueprint(
    'auth_api',
    __name__,
    url_prefix='/api/auth',
)
_db_manager = DatabaseManager()


@auth_api.post("/login")
@cross_origin()
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Missing email or password"}), 403

    user = User.get_user(username=username)
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not User.authenticate(user.user_id, password):
        return jsonify({"message": "Invalid credentials"}), 401

    User.set_last_online(user.user_id)

    access_token = create_access_token(
        identity=str(user.user_id),
        additional_claims={"role": User.get_role(user.user_id),
                           "username": user.username}
    )
    return jsonify({"token": access_token,}), 200


@auth_api.post("/heartbeat")
@cross_origin()
@jwt_required()
def heartbeat():
    user_id = get_jwt_identity()
    User.set_last_online(user_id)

    return jsonify({"status": "HeartBeat Success"}), 200


@auth_api.post("/register")
@cross_origin()
@jwt_required()
def register():
    """Since registering should only be dont from within the app by teamleiders, I added User.is_authorized"""
    data = request.get_json()
    user_id = get_jwt_identity()
    username = data.get('username')
    password = data.get('password')
    role_id = data.get('role_id')

    if not User.is_authorized(user_id):
        return jsonify({"message": "User not authorized"}), 403

    if not username or not password or not role_id:
        return jsonify({"message": "Missing username, password or role"}), 400

    try:
        role_id = int(role_id)

    except ValueError:
        return jsonify({"message": "role_id must be an integer"}), 401

    if not Role.get_role(role_id, _db_manager):
        return jsonify({"message": "Role doesn't exist"}), 404

    user = User.create_user(username=username, password=password, role_id=role_id)

    if not user:
        return jsonify({"message": "User already exists"}), 409

    return jsonify({"message": "User registered!"}), 201


@auth_api.post("/logout")
@cross_origin()
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    User.set_offline(user_id)
    print("Logout called")

    return jsonify({"message": "User logged out"}), 200