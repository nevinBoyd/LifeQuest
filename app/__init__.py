from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate

def create_app():
    app = Flask(__name__)

    # Basic configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///lifequest.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Enable CORS for frontend dev
    CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=False,
)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    from app.models import models
    from app.routes.health import health_bp
    from app.routes.tasks import tasks_bp
    from app.routes.quests import quests_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(quests_bp)

    return app
