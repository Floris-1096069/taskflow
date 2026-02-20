from datetime import datetime
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend_flask.src.db.ORM import Base


class TaskProblem(Base):
    __tablename__ = "taskproblems"
    task_problem_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    creation_time = Column(DateTime, nullable=False, default=datetime.now)
    content = Column(Text, nullable=False)

    task = relationship("Task", back_populates="task_problems")
    user = relationship("User", back_populates="task_problems")