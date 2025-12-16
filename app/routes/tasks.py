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
