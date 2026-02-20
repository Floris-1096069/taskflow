from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.ORM import Base


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    role = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")