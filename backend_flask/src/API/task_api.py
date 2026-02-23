from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin

from backend_flask.src.db.ORM.Task import Task


task_api = Blueprint(
    'task_api',
    __name__,
    url_prefix='/api/task',
)


@task_api.get("/getall")
@cross_origin()
@jwt_required()
def get_all_tasks():
    tasks = Task.get_all()
    return jsonify([task.to_dict() for task in tasks])


@task_api.get("/delegated/me")
@cross_origin()
@jwt_required()
def get_tasks_by_delegated_account():
    user_id = get_jwt_identity()
    tasks = Task.get_by_delegated_to(user_id)
    return jsonify([task.to_dict() for task in tasks])


@task_api.get("/delegated/<int:user_id>")
@cross_origin()
@jwt_required()
def get_tasks_by_delegated_to(user_id):
    tasks = Task.get_by_delegated_to(user_id)
    return jsonify([task.to_dict() for task in tasks])
