from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, text
from sqlalchemy.orm import relationship, joinedload

from backend_flask.src.db.base import Base
from backend_flask.src.db.database_manager import DatabaseManager
from backend_flask.src.db.ORM.TaskTag import TaskTag
from backend_flask.src.db.ORM.Tag import Tag
from backend_flask.src.db.ORM.TaskUserCheckIn import TaskUserCheckIn


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
    is_continuous = Column(Boolean, default=False, nullable=False)

    status = relationship("Status", back_populates="tasks")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tasks")
    assignee = relationship("User", foreign_keys=[delegated_to], back_populates="delegated_tasks")
    tags = relationship("Tag", secondary="tasktags", back_populates="tasks")
    task_problems = relationship("TaskProblem", back_populates="task")
    checkins = relationship("TaskUserCheckIn", back_populates="task")

    _db_manager = DatabaseManager()


    @classmethod
    def get_all(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).options(joinedload(cls.tags)).all()

    @classmethod
    def get_created_by(cls, task_id):
        with cls._db_manager.get_db() as db:
            task = db.query(cls).filter_by(task_id=task_id).one_or_none()
            return task.created_by if task else None


    @classmethod
    def get_by_delegated_to(cls, user_id: int):
        with cls._db_manager.get_db() as db:
            return db.query(cls).options(joinedload(cls.tags)).filter(cls.delegated_to == user_id).all()

    @classmethod
    def get_undelegated(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).filter(cls.delegated_to == None).all()

    @classmethod
    def get_filtered(cls, **filters):
        with cls._db_manager.get_db() as db:
            query = db.query(cls).options(joinedload(cls.tags))

            if 'status_id' not in filters:
                query = query.filter(cls.status_id != 4)
            elif filters['status_id'] != '4':
                query = query.filter(cls.status_id == filters['status_id'])

            if 'archived' in filters and filters['archived'] is not None:
                query = query.filter(cls.archived == filters['archived'])
            if 'priority' in filters and filters['priority'] is not None:
                query = query.filter(cls.priority == filters['priority'])
            if 'delegated_to' in filters and filters['delegated_to'] is not None:
                query = query.filter(cls.delegated_to == filters['delegated_to'])
            if 'tag_ids' in filters and filters['tag_ids']:
                query = query.join(cls.tags).filter(Tag.tag_id.in_(filters['tag_ids']))

            return query.all()

    @classmethod
    def is_standard_continuous_task(cls, task_id):
        standard_task_names = [
            "Multi-Picken",
            "Order-Picken",
            "Bij-Picken",
            "Verzenden",
            "Binnenkomend",
            "Wegleg",
        ]

        with cls._db_manager.get_db() as db:
            task = db.query(cls).filter(cls.task_id == task_id).one_or_none()
            return task and task.is_continuous and task.name in standard_task_names


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
                    tag = db.query(Tag).get(tag_id)
                    if tag:
                        new_task.tags.append(tag)
                db.commit()
                db.refresh(new_task)

            return new_task

    @classmethod
    def delete(cls, task_id):
        with cls._db_manager.get_db() as db:
            if cls.is_standard_continuous_task(task_id):
                raise ValueError("Standard continuous tasks cannot be deleted.")

            db.execute(text("DELETE FROM taskproblems WHERE task_id = :task_id"), {"task_id": task_id})

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

            if cls.is_standard_continuous_task(task_id):
                raise ValueError("Standard continuous tasks cannot be modified.")

            # Update task fields (excluding tags)
            for key, value in kwargs.items():
                if hasattr(task, key) and key != 'tag_ids':
                    setattr(task, key, value)

            # Handle tag updates if tag_ids is provided
            if 'tag_ids' in kwargs:
                new_tag_ids = kwargs['tag_ids']
                if not isinstance(new_tag_ids, list):
                    new_tag_ids = [new_tag_ids]
                new_tag_ids = [int(tag_id) for tag_id in new_tag_ids if str(tag_id).isdigit()]

                # Clear all tags if new_tag_ids is empty
                if not new_tag_ids:
                    task.tags = []
                else:
                    # Get the current tag IDs
                    current_tag_ids = {tag.tag_id for tag in task.tags}
                    # Remove tags not in the new list
                    for tag in task.tags[:]:
                        if tag.tag_id not in new_tag_ids:
                            task.tags.remove(tag)
                    # Add new tags
                    for tag_id in new_tag_ids:
                        if tag_id not in current_tag_ids:
                            tag = db.query(Tag).get(tag_id)
                            if tag:
                                task.tags.append(tag)

            task.update_time = datetime.now()
            db.commit()
            db.refresh(task)
            return task

    @classmethod
    def check_in_user(cls, task_id, user_id):
        with cls._db_manager.get_db() as db:
            # Check if the task is continuous
            task = db.query(cls).filter(cls.task_id == task_id, cls.is_continuous == True).one_or_none()
            if not task:
                raise ValueError("Task not found or not continuous")

            # Check if the user is already checked in
            existing = db.query(TaskUserCheckIn).filter_by(task_id=task_id, user_id=user_id).first()
            if existing:
                raise ValueError("User already checked in")

            # Add the check-in
            checkin = TaskUserCheckIn(task_id=task_id, user_id=user_id)
            db.add(checkin)
            db.commit()
            return checkin

    @classmethod
    def check_out_user(cls, task_id, user_id):
        with cls._db_manager.get_db() as db:
            # Find and remove the check-in
            checkin = db.query(TaskUserCheckIn).filter_by(task_id=task_id, user_id=user_id).first()
            if not checkin:
                raise ValueError("User not checked in")

            db.delete(checkin)
            db.commit()
            return checkin

    @classmethod
    def get_checkins(cls, task_id):
        with cls._db_manager.get_db() as db:
            return db.query(TaskUserCheckIn).filter_by(task_id=task_id).all()

    def to_dict(self):
        try:
            tags = [tag.to_dict() for tag in self.tags] if self.tags else []
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
                "tag_ids": [tag.tag_id for tag in self.tags] if self.tags else [],
            }
        except Exception as e:
            print(f"Error serializing task: {e}")
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
                "tags": [],
                "tag_ids": [],
            }
