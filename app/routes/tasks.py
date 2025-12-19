from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.models import Task
from flask_login import login_required, current_user

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks")

@tasks_bp.route("", methods=["POST"])
@login_required
def create_task():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400

    task = Task(
        title=title,
        user_id=current_user.id,
        generated=False
    )

    db.session.add(task)
    db.session.commit()

    return (
        jsonify(
            {
                "id": task.id,
                "title": task.title,
                "user_id": task.user_id,
                "generated": task.generated,
            }
        ),
        201,
    )

@tasks_bp.route("", methods=["GET"])
@login_required
def get_tasks():
    tasks = Task.query.filter_by(user_id=current_user.id).all()

    return (
        jsonify(
            [
                {
                    "id": task.id,
                    "title": task.title,
                    "generated": task.generated,
                }
                for task in tasks
            ]
        ),
        200,
    )

@tasks_bp.route("/<int:task_id>", methods=["GET"])
@login_required
def get_task(task_id):
    task = Task.query.filter_by(
        id=task_id,
        user_id=current_user.id
    ).first()

    if not task:
        return jsonify({"error": "task not found"}), 404

    return (
        jsonify(
            {
                "id": task.id,
                "title": task.title,
                "generated": task.generated,
            }
        ),
        200,
    )
