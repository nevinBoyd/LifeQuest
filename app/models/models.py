from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# USER MODEL

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)

    # Motivation: low / normal / high
    motivation = db.Column(db.String, default="normal")  
    
    # optional future: xp, personas, avatar, etc.
    total_xp = db.Column(db.Integer, default=0)
    
    tasks = db.relationship("Task", back_populates="user")


# MAIN TASK (BIG GOAL)
class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", back_populates="tasks")

    # Quests generated from this task
    quests = db.relationship("Quest", back_populates="task", cascade="all, delete")

    # Track whether quests have been generated or not
    generated = db.Column(db.Boolean, default=False)

# QUEST (MICRO STEP)
class Quest(db.Model):
    __tablename__ = "quests"

    id = db.Column(db.Integer, primary_key=True)

    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    task = db.relationship("Task", back_populates="quests")

    text = db.Column(db.String, nullable=False)

    # Difficulty: easy / medium / hard
    difficulty = db.Column(db.String, default="medium")

    # User manually chooses estimated time (5-minute increments)
    estimated_time = db.Column(db.Integer, nullable=False)

    # Bonus window (auto: estimated * 0.8)
    bonus_window = db.Column(db.Integer, nullable=False)

    # TIMER fields set when the quest is actually given
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

    completed = db.Column(db.Boolean, default=False)

    # SIMPLE XP VALUE for now
    base_xp = db.Column(db.Integer, nullable=False)

    def start(self):
        """Called automatically when quest is first served to user."""
        if not self.started_at:
            self.started_at = datetime.utcnow()

    def complete(self):
        """Mark quest complete & set timestamp."""
        self.completed = True
        if not self.completed_at:
            self.completed_at = datetime.utcnow()
