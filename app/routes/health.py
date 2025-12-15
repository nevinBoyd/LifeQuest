from flask import Blueprint, jsonify
from sqlalchemy import text
from app import db

health_bp = Blueprint("health", __name__)


@health_bp.route("/", methods=["GET"])
def health_check():
    # Simple DB check
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
