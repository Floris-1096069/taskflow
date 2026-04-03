from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend_flask.src.db.base import Base

class TaskUserCheckIn(Base):
    __tablename__ = "task_user_checkins"

    task_id = Column(Integer, ForeignKey("tasks.task_id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    checked_in_at = Column(DateTime, default=datetime.now)

    task = relationship("Task", back_populates="checkins")
    user = relationship("User", back_populates="checkins")