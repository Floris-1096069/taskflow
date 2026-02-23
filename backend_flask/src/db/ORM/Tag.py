from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.base import Base


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    tag = Column(String(50), unique=True, nullable=False)

    tasks = relationship("Task", secondary="tasktags", back_populates="tags")