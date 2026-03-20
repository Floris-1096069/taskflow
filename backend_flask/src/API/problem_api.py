from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend_flask.src.db.ORM.TaskProblem import TaskProblem
from backend_flask.src.db.ORM.User import User


problem_api = Blueprint(
    'problem_api',
    __name__,
    url_prefix='/api/problem',
)


@problem_api.post("/create")
@jwt_required()
def create_task_problem():
    data = request.get_json()
    user_id = get_jwt_identity()
    task_id = data.get("task_id")
    content = data.get("content")

    if not task_id or not content:
        return jsonify({"error": "task_id and content are required"}), 400

    problem = TaskProblem.create(task_id, user_id, content)

    if not problem:
        return jsonify({"error": "Task is not in 'problem' status"}), 403

    return jsonify(problem.to_dict()), 201


@problem_api.delete("/delete/<int:problem_id>")
@jwt_required()
def delete_task_problem(problem_id):
    user_id = get_jwt_identity()
    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    try:
        success = TaskProblem.delete(problem_id)
        if not success:
            return jsonify({"error": "Problem not found"}), 404

        return jsonify({"message": "Problem deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting problem: {e}")
        return jsonify({"error": "Failed to delete problem"}), 500



@problem_api.get("/task/<int:task_id>")
@jwt_required()
def get_problems_by_task(task_id):
    user_id = get_jwt_identity()

    if not User.is_authorized(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    problems = TaskProblem.get_by_task_id(task_id)
    return jsonify([problem.to_dict() for problem in problems])


@problem_api.get("/all")
@jwt_required()
def get_all_problems():
    user_id = get_jwt_identity()
    if not User.get_user(user_id):
        return jsonify({"error": "User doesnt exist"}), 401

    problems = TaskProblem.get_all()
    return jsonify([problem.to_dict() for problem in problems])