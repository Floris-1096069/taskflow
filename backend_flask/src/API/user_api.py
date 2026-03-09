from flask import Blueprint, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required

from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.database_manager import DatabaseManager


user_api = Blueprint(
    'user_api',
    __name__,
    url_prefix='/api/user',
)

_db_manager = DatabaseManager()

@user_api.get("/all")
@cross_origin()
@jwt_required()
def get_all_users():
    users = User.get_all()
    return jsonify([user.to_dict() for user in users])