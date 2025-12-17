from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Basic configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///lifequest.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    from app.models import models
    from app.routes.health import health_bp
    from app.routes.tasks import tasks_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(tasks_bp)

    return app
