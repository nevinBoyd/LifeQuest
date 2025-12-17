from flask import Blueprint, jsonify, request
from ..extensions import db
from ..models.models import Task, User, Quest
from ..services.quest_logic import (
    build_initial_quest_plan,
    finalize_quest_plan
)

quests_bp = Blueprint("quests", __name__)


def get_or_create_default_user():
    user = User.query.filter_by(username="default").first()
    if not user:
        user = User(username="default", motivation="normal")
        db.session.add(user)
        db.session.commit()
    return user

@quests_bp.route("/tasks/<int:task_id>/finalize-quests", methods=["POST"])
def finalize_quests(task_id):
    user = get_or_create_default_user()

    task = Task.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return jsonify({"error": "task not found"}), 404

    if task.generated:
        return jsonify({"error": "quests already generated"}), 400

    data = request.get_json(silent=True) or {}

    selected_subtasks = data.get("subtasks") or []
    difficulty = data.get("difficulty")
    estimated_time = data.get("estimated_time")

    if not selected_subtasks:
        return jsonify({"error": "subtasks required"}), 400

    if difficulty not in ("easy", "medium", "hard"):
        return jsonify({"error": "invalid difficulty"}), 400

    if not isinstance(estimated_time, int) or estimated_time <= 0:
        return jsonify({"error": "invalid estimated_time"}), 400

    plan = finalize_quest_plan(
        selected_subtasks=selected_subtasks,
        chosen_difficulty=difficulty,
        chosen_minutes=estimated_time,
        motivation=user.motivation
    )

    created_quests = []

    for text in plan["subtasks"]:
        quest = Quest(
            task_id=task.id,
            text=text,
            difficulty=plan["effective_difficulty"],
            estimated_time=plan["estimated_time"],
            bonus_window=plan["bonus_window"],
            base_xp=plan["base_xp"]
        )
        db.session.add(quest)
        created_quests.append(quest)

    task.generated = True
    db.session.commit()

    return jsonify({
        "task_id": task.id,
        "generated": True,
        "quests": [
            {
                "id": q.id,
                "text": q.text,
                "difficulty": q.difficulty,
                "estimated_time": q.estimated_time,
                "bonus_window": q.bonus_window,
                "base_xp": q.base_xp
            }
            for q in created_quests
        ]
    }), 201

@quests_bp.route("/tasks/<int:task_id>/quests", methods=["GET"])
def get_task_quests(task_id):
    user = get_or_create_default_user()

    task = Task.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return jsonify({"error": "task not found"}), 404

    quests = (
        Quest.query
        .filter_by(task_id=task.id)
        .order_by(Quest.id)
        .all()
    )

    return jsonify([
        {
            "id": q.id,
            "text": q.text,
            "difficulty": q.difficulty,
            "estimated_time": q.estimated_time,
            "bonus_window": q.bonus_window,
            "base_xp": q.base_xp,
            "completed": q.completed,
            "started_at": q.started_at,
            "completed_at": q.completed_at
        }
        for q in quests
    ]), 200
