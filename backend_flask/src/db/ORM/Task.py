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
    def get_by_id(cls, task_id: int):
        with cls._db_manager.get_db() as db:
            return db.query(cls).filter(cls.task_id == task_id).one_or_none()


    @classmethod
    def get_by_delegated_to(cls, user_id: int):
        with cls._db_manager.get_db() as db:
            return db.query(cls).options(joinedload(cls.tags)).filter(cls.delegated_to == user_id).all()

    @classmethod
    def get_undelegated(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).filter(cls.delegated_to == None).all()

    @classmethod
    def get_continuous(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).filter(cls.is_continuous == True).all()

    @classmethod
    def get_tags(cls, task_id: int):
        with cls._db_manager.get_db() as db:
            task = db.query(cls).options(joinedload(cls.tags)).filter(cls.task_id == task_id).one_or_none()
            if not task:
                return None
            return task.tags

    @classmethod
    def get_filtered(cls, **filters):
        with cls._db_manager.get_db() as db:
            query = db.query(cls).options(joinedload(cls.tags))

            # --- FORCE: Exclude continuous tasks ---
            query = query.filter(cls.is_continuous == False)

            # Handle status_id filter
            if 'status_id' in filters:
                if filters['status_id'] == '4':
                    query = query.filter(cls.status_id == 4)  # Only problem tasks
                else:
                    query = query.filter(cls.status_id == filters['status_id'])  # Specific status
            else:
                query = query.filter(cls.status_id != 4)  # Exclude problem tasks by default

            # Apply other filters
            if 'archived' in filters and filters['archived'] is not None:
                query = query.filter(cls.archived == filters['archived'])
            if 'priority' in filters and filters['priority'] is not None:
                query = query.filter(cls.priority == filters['priority'])

            # Handle delegated_to filter
            if 'delegated_to' in filters:
                if filters['delegated_to'] is None or filters['delegated_to'] == 'null':
                    query = query.filter(cls.delegated_to.is_(None))  # Undelegated tasks
                elif filters['delegated_to'] == 'not_null':
                    query = query.filter(cls.delegated_to.isnot(None))  # Only delegated tasks
                else:
                    query = query.filter(cls.delegated_to == filters['delegated_to'])  # Specific user

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

            for key, value in kwargs.items():
                if key == 'tag_ids':
                    if not isinstance(value, list):
                        value = [value]
                    if not value:
                        task.tags = []
                    else:
                        tag_ids = [int(tag_id) for tag_id in value if isinstance(tag_id, (int, str))]
                        new_tags = db.query(Tag).filter(Tag.tag_id.in_(tag_ids)).all()
                        task.tags = new_tags
                elif hasattr(task, key):
                    setattr(task, key, value)

            task.update_time = datetime.utcnow()
            db.commit()

            # Return a fresh task object from the database
            updated_task = db.query(cls).options(joinedload(cls.tags)).filter(cls.task_id == task_id).one()
            return updated_task  # Let Flask serialize it in the endpoint

    @classmethod
    def update_status(cls, task_id, status_id):
        with cls._db_manager.get_db() as db:
            # Load the task WITH its tags to preserve them
            task = db.query(cls).options(joinedload(cls.tags)).filter(cls.task_id == task_id).one_or_none()
            if not task:
                raise ValueError("Task not found")

            print(f"Before update - Task {task_id} tags: {task.tags}")
            # Update ONLY the status_id
            task.status_id = status_id
            task.update_time = datetime.utcnow()

            db.commit()

            # Return a fresh task object from the database
            updated_task = db.query(cls).options(joinedload(cls.tags)).filter(cls.task_id == task_id).one()
            print(f"After update - Task {task_id} tags: {updated_task.tags}")
            return updated_task

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
            active_users = [{"user_id": ci.user_id} for ci in self.checkins] if hasattr(self, 'checkins') else []
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
                "is_continuous": self.is_continuous,
                "active_users": active_users,  # Add this line
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
                "is_continuous": self.is_continuous,
                "active_users": [],
                "tags": [],
                "tag_ids": [],
            }
