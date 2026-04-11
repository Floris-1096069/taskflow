from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.base import Base

from backend_flask.src.db.database_manager import DatabaseManager


class Status(Base):
    __tablename__ = "status"

    status_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    tasks = relationship("Task", back_populates="status")

    _db_manager = DatabaseManager()


    @classmethod
    def get_all(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).all()


    def to_dict(self):
        return {
            "status_id": self.status_id,
            "name": self.name,
        }