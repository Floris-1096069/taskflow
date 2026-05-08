from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
from flask_socketio import emit

from backend_flask.src.websocket.socketio import socketio
from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Tag import Tag
from backend_flask.src.db.ORM.Status import Status
from backend_flask.src.db.ORM.TaskProblem import TaskProblem
from backend_flask.src.db.database_manager import DatabaseManager
from backend_flask.src.tasks.delegation import delegate_tasks



task_api = Blueprint(
    'task_api',
    __name__,
    url_prefix='/api/task',
)
_db_manager = DatabaseManager()

"""This is the main API for anything that has to do with tasks"""
"""This means: Tags, Status, Checkin/out, Task filtering, Continuous tasks"""
"""and Problematic tasks (not the problem reactions themselves"""

@task_api.post("/checkin/<int:task_id>")
@cross_origin()
@jwt_required()
def check_in_to_task(task_id):
    user_id = get_jwt_identity()
    try:
        Task.check_in_user(task_id, user_id)

        task = Task.get_continuous_by_id(task_id=task_id)

        return jsonify({
            "message": "Checked in successfully",
            "task": task.to_dict()
        }), 200

    except ValueError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        print(f"Error checking in: {e}")
        return jsonify({"error": "Failed to check in"}), 500


@task_api.post("/checkout/<int:task_id>")
@cross_origin()
@jwt_required()
def check_out_of_task(task_id):
    user_id = get_jwt_identity()
    try:
        Task.check_out_user(task_id, user_id)

        task = Task.get_continuous_by_id(task_id)

        return jsonify({
            "message": "Checked out successfully",
            "task": task.to_dict()
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        print(f"Error checking out: {e}")
        return jsonify({"error": "Failed to check out"}), 500


@task_api.get("/checkins/<int:task_id>")
@cross_origin()
@jwt_required()
def get_task_checkins(task_id):
    try:
        checkins = Task.get_checkins(task_id)
        return jsonify([{"user_id": ci.user_id, "checked_in_at": ci.checked_in_at.isoformat()} for ci in checkins]), 200

    except Exception as e:
        print(f"Error fetching check-ins: {e}")
        return jsonify({"error": "Failed to fetch check-ins"}), 500


@task_api.get("/filtered")
@cross_origin()
@jwt_required()
def get_filtered_tasks():
    try:
        filters = {key: request.args.getlist(key) if key == 'tag_ids' else request.args.get(key) for key in request.args}

        if 'created_by' in filters and filters['created_by'] == 'null':
            filters['created_by'] = None

        filters['is_continuous'] = False

        if 'delegated_to' in filters and filters['delegated_to'] == 'null':
            filters['delegated_to'] = None

        tasks = Task.get_filtered(**filters)
        return jsonify([task.to_dict() for task in tasks])

    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return jsonify({"error": "Failed to fetch tasks"}), 500


@task_api.get("/continuous")
@cross_origin()
@jwt_required()
def get_continuous_tasks():
    try:
        tasks = Task.get_continuous()
        return jsonify([task.to_dict() for task in tasks])

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_api.get("/problems")
@cross_origin()
@jwt_required()
def get_problem_tasks():
    user_id = get_jwt_identity()
    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    try:
        tasks = Task.get_filtered(status_id=4)
        tasks_with_problems = []
        for task in tasks:
            problems = TaskProblem.get_by_task_id(task.task_id)
            task_dict = task.to_dict()
            task_dict['problems'] = [problem.to_dict() for problem in problems]
            tasks_with_problems.append(task_dict)
        return jsonify(tasks_with_problems)

    except Exception as e:
        print(f"Error fetching problem tasks: {e}")
        return jsonify({"error": "Failed to fetch problem tasks"}), 500


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


@task_api.route('/undelegated', methods=['GET'])
@cross_origin()
@jwt_required()
def get_undelegated_tasks():
    tasks = Task.get_undelegated()
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
        if new_task.delegated_to is not None:
            socketio.emit(
                "notification",
                {
                    "message": f"You've been assigned task {new_task.task_id}: {new_task.name}!",
                    "task_id": new_task.task_id,
                    "task_name": new_task.name,
                    "type": "task_assigned"
                },
                room=str(new_task.delegated_to)
            )
        return jsonify(new_task.to_dict()), 200

    except Exception as e:
        print(f"Error creating task: {e}")
        return jsonify({"error": "Failed to create task"}), 500


@task_api.put("/archive/<int:task_id>")
@cross_origin()
@jwt_required()
def archive_task(task_id):
    try:
        updated_task = Task.update(task_id, archived=True)
        return jsonify({"message": "Task archived successfully", "task": updated_task.to_dict()}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    except Exception as e:
        return jsonify({"error": "An error occurred while archiving the task"}), 500


@task_api.post('/delegate/<int:task_id>')
@cross_origin()
@jwt_required()
def delegate_single_task(task_id):
    result = delegate_tasks(task_id=task_id)
    if result["success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@task_api.put("/update/<int:task_id>")
@cross_origin()
@jwt_required()
def update_task(task_id):
    try:
        data = request.get_json()
        filtered_data = {
            k: v for k, v in data.items()
            if k in ['name', 'description', 'priority', 'status_id', 'delegated_to', 'tag_ids']
        }
        current_task = Task.get_by_id(task_id)
        if not current_task:
            return jsonify({"error": "Task not found"}), 404

        if 'delegated_to' in filtered_data and filtered_data['delegated_to'] != current_task.delegated_to:
            new_user_id = filtered_data['delegated_to']
            print(f"Emitting notification to user {new_user_id} for task {task_id}")
            socketio.emit(
                "notification",
                {
                    "message": f"You've been assigned task {task_id}: {current_task.name}!",
                    "task_id": task_id,
                    "task_name": current_task.name,
                    "type": "task_assigned"
                },
                room=str(new_user_id)
            )

        updated_task = Task.update(task_id, **filtered_data)
        return jsonify(updated_task.to_dict()), 200

    except Exception as e:
        print(f"Error updating task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to update task"}), 500


@task_api.delete("/delete/<int:task_id>")
@cross_origin()
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    created_by = Task.get_created_by(task_id)

    if not User.is_authorized(user_id) and user_id != created_by:
        print('User is unauthorised')
        return jsonify({"error": "Unauthorized"}), 403

    try:
        Task.delete(task_id)
        return jsonify({"message": "Task deleted successfully"})

    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to delete task"}), 500


@task_api.get("/tags")
@cross_origin()
@jwt_required()
def get_all_tags():
    tags = Tag.get_all()
    return jsonify([tag.to_dict() for tag in tags])


@task_api.get("/tags/<int:task_id>")
@cross_origin()
@jwt_required()
def get_task_tags(task_id):
    try:
        task = Task.get_by_id(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        tags = Task.get_tags(task_id)
        return jsonify([tag.to_dict() for tag in tags] if tags else [])

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_api.route('/test/notification', methods=['GET'])
def test_notification():

    user_id = "3"
    print(f"emitting notification to {user_id}")
    socketio.emit('notification', {
        'title': 'Test Notification',
        'message': 'This is a test notification from the backend!'
    }, room=str(user_id))
    return jsonify({'status': 'notification sent'})


@task_api.get("/status")
@cross_origin()
@jwt_required()
def get_all_statuses():
    statuses = Status.get_all()
    return jsonify([status.to_dict() for status in statuses])