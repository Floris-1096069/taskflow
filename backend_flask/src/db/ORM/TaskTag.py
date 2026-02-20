from sqlalchemy import Column, Integer, ForeignKey
from backend_flask.src.db.database_manager import Base


class TaskTag(Base):
    __tablename__ = "tasktags"

    task_id = Column(Integer, ForeignKey("tasks.task_id"), primary_key=True, nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.tag_id"), primary_key=True, nullable=False)