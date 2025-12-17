from flask import Blueprint, jsonify
from ..extensions import db
from ..models.models import Task, User
from ..services.quest_logic import build_initial_quest_plan

quests_bp = Blueprint("quests", __name__)


def get_or_create_default_user():
    user = User.query.filter_by(username="default").first()
    if not user:
        user = User(username="default", motivation="normal")
        db.session.add(user)
        db.session.commit()
    return user
