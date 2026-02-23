from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from backend_flask.src.db.ORM import Base
from backend_flask.src.db.database_manager import DatabaseManager


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

    _db_manager = DatabaseManager()

    @classmethod
    def get_all(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).all()


    @classmethod
    def get_by_delegated_to(cls, user_id: int):
        with cls._db_manager.get_db() as db:
            return db.query(cls).filter(cls.delegated_to == user_id).all()


    def to_dict(self):
        return {
            "task_id": self.task_id,
            "name": self.name,
            "description": self.description,
            "creation_time": self.creation_time.isoformat(),
            "update_time": self.update_time.isoformat(),
            "archived": self.archived,
            "priority": self.priority,
            "status_id": self.status_id,
            "delegated_to": self.delegated_to,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
        }