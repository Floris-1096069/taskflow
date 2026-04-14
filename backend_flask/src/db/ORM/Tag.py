from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_flask.src.db.base import Base
from backend_flask.src.db.database_manager import DatabaseManager

class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    tag = Column(String(50), unique=True, nullable=False)  # Column is named 'tag'

    tasks = relationship("Task", secondary="tasktags", back_populates="tags")

    _db_manager = DatabaseManager()


    @classmethod
    def get_all(cls):
        with cls._db_manager.get_db() as db:
            return db.query(cls).all()


    @classmethod
    def create(cls, name):
        try:
            with cls._db_manager.get_db() as db:
                #check if a tag with this name already exists
                existing_tag = db.query(cls).filter(cls.tag == name).first()
                if existing_tag:
                    raise ValueError("Tag already exists")

                new_tag = cls(tag=name)
                db.add(new_tag)
                db.commit()
                db.refresh(new_tag)
                return new_tag

        except Exception as e:
            db.rollback()
            raise e


    @classmethod
    def delete(cls, tag_id):
        try:
            with cls._db_manager.get_db() as db:
                tag = db.query(cls).filter(cls.tag_id == tag_id).first()
                if not tag:
                    raise ValueError("Tag doesn't exist")

                db.delete(tag)
                db.commit()

        except Exception as e:
            db.rollback()
            raise e


    def to_dict(self):
        return {
            "tag_id": self.tag_id,
            "name": self.tag,
        }