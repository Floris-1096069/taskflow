from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin

from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Tag import Tag
from backend_flask.src.db.database_manager import DatabaseManager


task_api = Blueprint(
    'task_api',
    __name__,
    url_prefix='/api/task',
)

_db_manager = DatabaseManager()
@task_api.get("/filtered")
@cross_origin()
@jwt_required()
def get_filtered_tasks():
    user_id = get_jwt_identity()

    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    archived = request.args.get('archived', default=None, type=lambda v: v.lower() == 'true')
    priority = request.args.get('priority', default=None, type=int)
    delegated_to = request.args.get('delegated_to', default=None, type=int)
    status_id = request.args.get('status_id', default=None, type=int)

    filters = {}
    if archived is not None:
        filters['archived'] = archived
    if priority is not None:
        filters['priority'] = priority
    if delegated_to is not None:
        filters['delegated_to'] = delegated_to
    if status_id is not None:
        filters['status_id'] = status_id

    tasks = Task.get_filtered(**filters)
    return jsonify([task.to_dict() for task in tasks])


@task_api.get("/getall")
@cross_origin()
@jwt_required()
def get_all_tasks():
    user_id = get_jwt_identity()

    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    tasks = Task.get_all()

    return jsonify([task.to_dict() for task in tasks])


@task_api.get("/delegated/me")
@cross_origin()
@jwt_required()
def get_tasks_delegated_to_my_account():
    user_id = get_jwt_identity()
    tasks = Task.get_by_delegated_to(user_id)

    return jsonify([task.to_dict() for task in tasks])


@task_api.get("/delegated/<int:user_id>")
@cross_origin()
@jwt_required()
def get_tasks_by_delegated_user_id(delegated_id):
    user_id = get_jwt_identity()

    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    tasks = Task.get_by_delegated_to(delegated_id)
    return jsonify([task.to_dict() for task in tasks])


@task_api.post("/create")
@cross_origin()
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()
    required_fields = ['name', 'priority', 'status_id', 'delegated_to']

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    new_task = Task.create(
        name=data['name'],
        description=data.get('description', ''),
        priority=data['priority'],
        status_id=data['status_id'],
        delegated_to=data['delegated_to'],
        created_by=user_id,
        tag_ids=data.get('tag_ids', []),
    )

    return jsonify(new_task.to_dict()), 201


@task_api.get("/tags")
@cross_origin()
@jwt_required()
def get_all_tags():
    tags = Tag.get_all()
    return jsonify([tag.to_dict() for tag in tags])


@task_api.post("/tags")
@cross_origin()
@jwt_required()
def create_tag():
    user_id = get_jwt_identity()
    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Tag name is required"}), 400

    try:
        new_tag = Tag.create(name=data['name'])
        return jsonify(new_tag.to_dict()), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": "Failed to create tag"}), 500