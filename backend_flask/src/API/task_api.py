from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin

from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Tag import Tag
from backend_flask.src.db.ORM.Status import Status
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
    try:
        filters = {key: request.args.getlist(key) if key == 'tag_ids' else request.args.get(key) for key in request.args}
        tasks = Task.get_filtered(**filters)
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return jsonify({"error": "Failed to fetch tasks"}), 500


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
    try:
        data = request.get_json()
        new_task = Task.create(
            name=data['name'],
            description=data.get('description', ''),
            priority=data['priority'],
            status_id=data['status_id'],
            delegated_to=data.get('delegated_to'),
            created_by=get_jwt_identity(),
            tag_ids=data.get('tag_ids')
        )
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        print(f"Error creating task: {e}")
        return jsonify({"error": "Failed to create task"}), 500


@task_api.put("/update/<int:task_id>")
@cross_origin()
@jwt_required()
def update_task(task_id):
    try:
        data = request.get_json()
        updated_task = Task.update(task_id, **data)
        return jsonify(updated_task.to_dict()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        print(f"Error updating task: {e}")
        return jsonify({"error": "Failed to update task"}), 500


@task_api.delete("/delete/<int:task_id>")
@cross_origin()
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    try:
        Task.delete(task_id)
        return jsonify({"message": "Task deleted successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to delete task"}), 500



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


@task_api.get("/status")
@cross_origin()
@jwt_required()
def get_all_statuses():
    statuses = Status.get_all()
    return jsonify([status.to_dict() for status in statuses])


@task_api.delete("/tags/<int:tag_id>")
@cross_origin()
@jwt_required()
def delete_tag(tag_id):
    try:
        Tag.delete(tag_id)
        return jsonify({"message": "Tag deleted successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to delete tag"}), 500