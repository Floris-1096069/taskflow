from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, joinedload
from backend_flask.src.db.database_manager import DatabaseManager
from werkzeug.security import generate_password_hash, check_password_hash

from backend_flask.src.db.base import Base
from backend_flask.src.db.ORM.enums import RoleEnum


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
    def get_role(cls, user_id: int):
        db = next(cls._db_manager.get_db())
        try:
            user = db.query(cls).filter_by(user_id=user_id).first()

            if user:
                return RoleEnum(user.role_id)

            return None

        finally:
            db.close()

    @classmethod
    def is_authorized(cls, user_id: int):
        user_role = cls.get_role(user_id)

        if user_role is None:
            return False

        return user_role in {RoleEnum.ADMIN, RoleEnum.TEAMLEIDER}

    @classmethod
    def get_user(cls, user_id: int = None, username: str = ""):
        with cls._db_manager.get_db() as db:
            query = db.query(cls)
            if user_id is not None:
                user = query.options(joinedload(cls.role)).filter_by(user_id=user_id).one_or_none()
                return user
            elif username != "":
                user = query.options(joinedload(cls.role)).filter_by(username=username).one_or_none()
                return user
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