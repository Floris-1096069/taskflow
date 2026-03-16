from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.base import Base
from backend_flask.src.db.ORM.enums import RoleEnum


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, nullable=False, autoincrement=False)
    name = Column(String(30), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


    @classmethod
    def get_role(cls, role_id: int, _db_manager: DatabaseManager):
        if not role_id:
            return None

        if not isinstance(role_id, int):
            return None

        with _db_manager.get_db() as db:
            return db.query(cls).filter_by(role_id=role_id).first()