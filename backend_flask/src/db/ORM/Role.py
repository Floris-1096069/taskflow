from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.ORM import Base


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    role = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


    @classmethod
    def get_role(cls, role_id: int):
        if not role_id:
            return None

        if not isinstance(role_id, int):
            return None

        with cls._db_manager.get_db() as db:
            return db.query(cls).filter_by(role_id=role_id).first()