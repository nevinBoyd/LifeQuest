from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, login_manager
from app.routes.auth import auth_bp

def create_app():
    app = Flask(__name__)

    # Basic configuration
    app.config["SECRET_KEY"] = "dev-secret-key"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///lifequest.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Enable CORS for frontend dev
    CORS(
        app,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:5173", 
                    "http://127.0.0.1:5173",
                 ]
            }
        },
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

    return app
