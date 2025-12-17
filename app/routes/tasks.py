from flask import Blueprint, request, jsonify
from app import db
from app.models.models import User, Task

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks")


def get_or_create_default_user():
    # Default stub user until auth exists
    user = User.query.filter_by(username="default").first()
    if not user:
        user = User(username="default", motivation="normal")
        db.session.add(user)
        db.session.commit()
    return user


@tasks_bp.route("", methods=["POST"])
def create_task():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400

    user = get_or_create_default_user()

    task = Task(title=title, user_id=user.id, generated=False)
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
def get_tasks():
    user = get_or_create_default_user()

    tasks = Task.query.filter_by(user_id=user.id).all()

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
def get_task(task_id):
    user = get_or_create_default_user()

    task = Task.query.filter_by(id=task_id, user_id=user.id).first()

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
