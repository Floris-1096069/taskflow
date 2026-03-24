from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship, joinedload
from backend_flask.src.db.database_manager import DatabaseManager
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

from backend_flask.src.db.base import Base
from backend_flask.src.db.ORM.enums import RoleEnum


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    last_seen = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    is_online = Column(Boolean, default=False)

    role = relationship("Role", back_populates="users")
    created_tasks = relationship("Task", foreign_keys="Task.created_by", back_populates="creator")
    delegated_tasks = relationship("Task", foreign_keys="Task.delegated_to", back_populates="assignee")
    task_problems = relationship("TaskProblem", back_populates="user")

    _db_manager = DatabaseManager()


    @classmethod
    def get_role(cls, user_id):
        try:
            with cls._db_manager.get_db() as db:
                user = db.query(cls).filter(cls.user_id == user_id).first()
                return user.role_id if user else None

        except Exception as e:
            print(f"Error fetching role for user {user_id}: {e}")
            return None


    @classmethod
    def get_all(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).options(joinedload(cls.role)).all()


    @classmethod
    def is_authorized(cls, user_id):
        role = cls.get_role(user_id)
        return role in {RoleEnum.ADMIN.value, RoleEnum.TEAMLEIDER.value}


    @classmethod
    def get_user(cls, user_id: int = None, username: str = ""):
        with cls._db_manager.get_db() as db:
            query = db.query(cls).options(joinedload(cls.role))  # Eager load role
            if user_id is not None:
                return query.filter_by(user_id=user_id).one_or_none()
            elif username != "":
                return query.filter_by(username=username).one_or_none()
            else:
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


    @classmethod
    def update_user(cls, user_id, username, role_id):
        with cls._db_manager.get_db() as db:
            user = db.query(cls).options(joinedload(cls.role)).filter_by(user_id=user_id).one_or_none()
            if not user:
                return None
            user.username = username
            user.role_id = role_id
            db.commit()
            return user.to_dict()


    @classmethod
    def set_last_online(cls, user_id: int):
        with cls._db_manager.get_db() as db:
            user = db.query(cls).filter(cls.user_id == user_id).one_or_none()
            if user:
                user.is_online = True
                user.last_seen = datetime.now()
                db.commit()

            return None


    @classmethod
    def set_offline(cls, user_id: int):
        with cls._db_manager.get_db() as db:
            user = db.query(cls).filter(cls.user_id == user_id).one_or_none()
            if user:
                user.is_online = False
                db.commit()


    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "role_id": self.role_id,
            "role_name": self.role.name if hasattr(self.role, 'name') else None,
        }