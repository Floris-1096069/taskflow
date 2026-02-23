from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.ORM import Base
from backend_flask.src.db.ORM.enums import RoleEnum


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, nullable=False, autoincrement=False)
    name = Column(String(20), unique=True, nullable=False)

    users = relationship("User", back_populates="role")

    Admin = RoleEnum.ADMIN.value
    Manager = RoleEnum.MANAGER.value
    Teamleider = RoleEnum.TEAMLEIDER.value
    Scanmedewerkerplus = RoleEnum.SCANMEDEWERKERPLUS.value
    Scanmedewerker = RoleEnum.SCANMEDEWERKER.value


    @classmethod
    def initialize_roles(cls, db):
        for role in RoleEnum:
            existing_role = db.query(cls).filter_by(role_id=role.value).one_or_none()
            if not existing_role:
                new_role = cls(role_id=role.value, role=role.name)
                db.add(new_role)
        db.commit()


    @classmethod
    def get_role(cls, role_id: int):
        if not role_id:
            return None

        if not isinstance(role_id, int):
            return None

        with cls._db_manager.get_db() as db:
            return db.query(cls).filter_by(role_id=role_id).first()