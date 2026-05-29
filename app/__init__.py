import os
from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, login_manager
from app.routes.auth import auth_bp

def create_app():
    app = Flask(__name__)

    # Configuration from environment variables
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")

    # Database — use DATABASE_URL from Render (postgres://), fallback to SQLite for dev
    database_url = os.environ.get("DATABASE_URL", "sqlite:///lifequest.db")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Session cookie — SameSite=None + Secure=True required for cross-origin cookies in production
    is_production = os.environ.get("FLASK_ENV") == "production"
    app.config["SESSION_COOKIE_SAMESITE"] = "None" if is_production else "Lax"
    app.config["SESSION_COOKIE_SECURE"] = is_production

    # CORS — allow dev origins + production Netlify URL
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    netlify_url = os.environ.get("FRONTEND_URL")
    if netlify_url:
        allowed_origins.append(netlify_url)

    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        supports_credentials=True,
    )

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Initialize Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = None

    from app.models import models
    from app.routes.health import health_bp
    from app.routes.tasks import tasks_bp
    from app.routes.quests import quests_bp
    from app.models.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    app.register_blueprint(health_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(quests_bp)
    app.register_blueprint(auth_bp)

    # Auto-create tables
    with app.app_context():
        db.create_all()

    return app
