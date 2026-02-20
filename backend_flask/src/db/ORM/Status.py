from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.database_manager import Base


class Status(Base):
    __tablename__ = "status"

    status_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    status = Column(String(50), unique=True, nullable=False)

    tasks = relationship("Task", back_populates="status")