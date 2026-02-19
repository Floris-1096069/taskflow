from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from backend_flask.src.ORM.database_manager import DatabaseManager
from werkzeug.security import generate_password_hash, check_password_hash

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)

    role = relationship("Role", back_populates="users")
    created_tasks = relationship("Task", foreign_keys="Task.created_by", back_populates="creator")
    delegated_tasks = relationship("Task", foreign_keys="Task.delegated_to", back_populates="assignee")
    task_problems = relationship("TaskProblem", back_populates="user")

    _db_manager = DatabaseManager()


    @classmethod
    def get_user(cls, username: str = ""):
        with cls._db_manager.get_db() as db:
            if username != "":
                user = db.query(cls).filter_by(username=username).one_or_none()
                return user
            return None


    @classmethod
    def authenticate(cls, user_id: int, password: str) -> bool:
        with cls._db_manager.get_db() as db:
            user = db.query(cls).filter_by(user_id=user_id).one_or_none()
            if not user:
                return False
            return check_password_hash(user.password_hash, password)


    @classmethod
    def create_user(cls, username: str, password: str, role_id: int):
        with cls._db_manager.get_db() as db:
            if db.query(cls).filter(cls.username == username).one_or_none():
                return None

            hashed_password = generate_password_hash(password)
            new_user = cls(
                username=username,
                password_hash=hashed_password,
                role_id=role_id
            )
            db.add(new_user)
            db.commit()
            return db.query(cls).filter_by(username=username).one_or_none()


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    role = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    tag = Column(String(50), unique=True, nullable=False)

    tasks = relationship("Task", secondary="tasktags", back_populates="tags")


class Status(Base):
    __tablename__ = "status"

    status_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    status = Column(String(50), unique=True, nullable=False)

    tasks = relationship("Task", back_populates="status")


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    creation_time = Column(DateTime, nullable=False, default=datetime.now)
    update_time = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    archived = Column(Boolean, default=False)
    priority = Column(Integer, nullable=False)
    status_id = Column(Integer, ForeignKey("status.status_id"), nullable=False)
    delegated_to = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    status = relationship("Status", back_populates="tasks")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tasks")
    assignee = relationship("User", foreign_keys=[delegated_to], back_populates="delegated_tasks")
    tags = relationship("Tag", secondary="tasktags", back_populates="tasks")
    task_problems = relationship("TaskProblem", back_populates="task")


class TaskTag(Base):
    __tablename__ = "tasktags"

    task_id = Column(Integer, ForeignKey("tasks.task_id"), primary_key=True, nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.tag_id"), primary_key=True, nullable=False)


class TaskProblem(Base):
    __tablename__ = "taskproblems"
    task_problem_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    creation_time = Column(DateTime, nullable=False, default=datetime.now)
    content = Column(Text, nullable=False)

    task = relationship("Task", back_populates="task_problems")
    user = relationship("User", back_populates="task_problems")