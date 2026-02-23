from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token

from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Role import Role


auth_api = Blueprint(
    'auth_api',
    __name__,
    url_prefix='/api/auth',
)

@auth_api.post("")
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

    access_token = create_access_token(identity=str(user.user_id))
    return jsonify({"token": access_token}), 200


@auth_api.post("/register")
@cross_origin()
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role_id = data.get('role')

    if not username or not password or not role_id:
        return jsonify({"message": "Missing username, password or role"}), 400

    if not Role.get_role(role_id):
        return jsonify({"message": "Role doesn't exist"}), 404

    user = User.create_user(username=username, password=password, role_id=role_id)

    if not user:
        return jsonify({"message": "User already exists"}), 409

    return jsonify({"message": "User registered!"}), 201

