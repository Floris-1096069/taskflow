from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship, joinedload

from backend_flask.src.db.base import Base
from backend_flask.src.db.database_manager import DatabaseManager
from backend_flask.src.db.ORM.TaskTag import TaskTag


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
    delegated_to = Column(Integer, ForeignKey("users.user_id"), nullable=True)
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
            return db.query(cls).options(joinedload(cls.tags)).all()


    @classmethod
    def get_by_delegated_to(cls, user_id: int):
        with cls._db_manager.get_db() as db:
            return db.query(cls).options(joinedload(cls.tags)).filter(cls.delegated_to == user_id).all()

    @classmethod
    def get_filtered(cls, **filters):
        with cls._db_manager.get_db() as db:
            query = db.query(cls).options(joinedload(cls.tags))

            if 'delegated_to' in filters:
                query = query.filter(cls.delegated_to == filters['delegated_to'])
            if 'archived' in filters:
                query = query.filter(cls.archived == filters['archived'])
            if 'priority' in filters:
                query = query.filter(cls.priority == filters['priority'])
            if 'tag_ids' in filters and filters['tag_ids']:
                query = query.join(TaskTag, TaskTag.task_id == cls.task_id).filter(
                    TaskTag.tag_id.in_(filters['tag_ids']))

            return query.distinct().all()

    @classmethod
    def create(cls, name, description, priority, status_id, delegated_to, created_by, tag_ids=None):
        with cls._db_manager.get_db() as db:
            new_task = cls(
                name=name,
                description=description,
                priority=priority,
                status_id=status_id,
                delegated_to=delegated_to,
                created_by=created_by,
                updated_by=created_by,
            )
            db.add(new_task)
            db.commit()
            db.refresh(new_task)

            if tag_ids:
                for tag_id in tag_ids:
                    task_tag = TaskTag(task_id=new_task.task_id, tag_id=tag_id)
                    db.add(task_tag)
                db.commit()
                db.refresh(new_task)

            return new_task

    @classmethod
    def delete(cls, task_id):
        with cls._db_manager.get_db() as db:
            task = db.query(cls).filter(cls.task_id == task_id).one_or_none()
            if not task:
                raise ValueError("Task not found")

            db.delete(task)
            db.commit()

    @classmethod
    def update(cls, task_id, **kwargs):
        with cls._db_manager.get_db() as db:
            task = db.query(cls).options(joinedload(cls.tags)).filter(cls.task_id == task_id).one_or_none()
            if not task:
                raise ValueError("Task not found")

            for key, value in kwargs.items():
                if hasattr(task, key):
                    setattr(task, key, value)

            task.update_time = datetime.now()

            db.commit()
            db.refresh(task)

            return task

    def to_dict(self):
        try:
            tags = [tag.to_dict() for tag in self.tags] if hasattr(self, 'tags') and self.tags else []
        except Exception as e:
            print(f"Error serializing tags: {e}")
            tags = []

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
            "tags": tags,
        }