from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, current_user
from app.models.models import User
from app.extensions import db

auth_bp = Blueprint("auth", __name__)

# POST /signup
@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 409

    user = User(username=username)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    login_user(user)
    return jsonify({"id": user.id, "username": user.username}), 201

# POST /login
@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    login_user(user)
    return jsonify({"id": user.id, "username": user.username}), 200

# POST /logout
@auth_bp.post("/logout")
def logout():
    logout_user()
    return jsonify({"message": "logged out"}), 204

# GET /me
@auth_bp.get("/me")
def me():
    if not current_user.is_authenticated:
        return jsonify({"error": "unauthorized"}), 401

    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "total_xp": current_user.total_xp,
    }), 200
