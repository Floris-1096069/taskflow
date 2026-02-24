import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, scoped_session

from .base import Base
from .ORM import *  # noqa: F401

load_dotenv()


class DatabaseManager:
    def __init__(self, echo: bool = False):
        self.engine = create_engine(os.getenv("DATABASE_URL"), echo=echo)

        self.SessionLocal = scoped_session(
            sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        )


    def get_db(self):
        db = self.SessionLocal()

        try:
            yield db

        finally:
            db.close()


    def recreate_db(self):
        with self.engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS taskproblems CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS tasktags CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS tags CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS status CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS roles CASCADE;"))
            conn.commit()

        Base.metadata.create_all(bind=self.engine)

        with self.engine.connect() as conn:
            #insert fixed roles with their IDs
            roles = [
                {"role_id": 1, "name": "admin"},
                {"role_id": 2, "name": "manager"},
                {"role_id": 3, "name": "teamleider"},
                {"role_id": 4, "name": "scanmedewerkerplus"},
                {"role_id": 5, "name": "scanmedewerker"},
            ]
            for role in roles:
                conn.execute(
                    text("INSERT INTO roles (role_id, name) VALUES (:role_id, :name)"),
                    {"role_id": role["role_id"], "name": role["name"]}
                )
            conn.commit()


    def dispose(self):
        self.SessionLocal.remove()
        self.engine.dispose()