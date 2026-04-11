from datetime import datetime
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, joinedload
from backend_flask.src.db.base import Base
from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.database_manager import DatabaseManager


class TaskProblem(Base):
    __tablename__ = "taskproblems"
    task_problem_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    creation_time = Column(DateTime, nullable=False, default=datetime.now)
    content = Column(Text, nullable=False)

    task = relationship("Task", back_populates="task_problems")
    user = relationship("User", back_populates="task_problems")

    _db_manager = DatabaseManager()

    @classmethod
    def get_by_task_id(cls, task_id: int):
        with cls._db_manager.get_db() as db:
            return db.query(cls).filter(cls.task_id == task_id).all()

    @classmethod
    def get_all(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).all()

    @classmethod
    def create(cls, task_id: int, user_id: int, content: str):
        with cls._db_manager.get_db() as db:
            task = db.query(Task).filter(Task.task_id == task_id).one_or_none()
            if not task:
                return None

            new_problem = cls(
                task_id=task_id,
                user_id=user_id,
                content=content
            )
            db.add(new_problem)

            # Use Task.update_status to update the status (preserves tags)
            Task.update_status(task_id, 4)

            db.commit()
            db.refresh(new_problem)
            return new_problem

    @classmethod
    def delete(cls, problem_id: int):
        with cls._db_manager.get_db() as db:
            problem = db.query(cls).filter(cls.task_problem_id == problem_id).one_or_none()
            if not problem:
                return False

            db.delete(problem)
            db.commit()
            return True


    def to_dict(self):
        return {
            "task_problem_id": self.task_problem_id,
            "task_id": self.task_id,
            "user_id": self.user_id,
            "creation_time": self.creation_time.isoformat(),
            "content": self.content,
        }