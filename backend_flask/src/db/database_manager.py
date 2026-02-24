import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, scoped_session
from contextlib import contextmanager

from backend_flask.src.db.base import Base

load_dotenv()

class DatabaseManager:
    def __init__(self, echo: bool = False):
        self.engine = create_engine(os.getenv("DATABASE_URL"), echo=echo)

        self.SessionLocal = scoped_session(
            sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        )

    @contextmanager
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
                {"role_id": 1, "name": "Admin"},
                {"role_id": 2, "name": "Manager"},
                {"role_id": 3, "name": "Teamleider"},
                {"role_id": 4, "name": "Scanmedewerkerplus"},
                {"role_id": 5, "name": "Scanmedewerker"},
            ]
            for role in roles:
                conn.execute(
                    text("INSERT INTO roles (role_id, name) VALUES (:role_id, :name)"),
                    {"role_id": role["role_id"], "name": role["name"]}
                )
            conn.commit()

    def init_roles(self):
        from backend_flask.src.db.ORM.Role import Role
        """Ensure all predefined roles exist in the database."""
        with self.get_db() as db:
            existing_role_ids = {role.role_id for role in db.query(Role).all()}

            roles_to_create = [
                {"role_id": 1, "name": "Admin"},
                {"role_id": 2, "name": "Manager"},
                {"role_id": 3, "name": "Teamleider"},
                {"role_id": 4, "name": "Scanmedewerkerplus"},
                {"role_id": 5, "name": "Scanmedewerker"},
            ]

            for role_data in roles_to_create:
                if role_data["role_id"] not in existing_role_ids:
                    new_role = Role(role_id=role_data["role_id"], name=role_data["name"])
                    db.add(new_role)

            db.commit()


    def create_all(self):
        Base.metadata.create_all(bind=self.engine)
        self.init_roles()


    def dispose(self):
        self.SessionLocal.remove()
        self.engine.dispose()