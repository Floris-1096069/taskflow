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
                {"role_id": 2, "name": "Teamleider"},
                {"role_id": 3, "name": "Binnenkomend"},
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
        with self.get_db() as db:
            existing_role_ids = {role.role_id for role in db.query(Role).all()}

            roles_to_create = [
                {"role_id": 1, "name": "Admin"},
                {"role_id": 2, "name": "Teamleider"},
                {"role_id": 3, "name": "Binnenkomend"},
                {"role_id": 4, "name": "Scanmedewerkerplus"},
                {"role_id": 5, "name": "Scanmedewerker"},
            ]

            for role_data in roles_to_create:
                if role_data["role_id"] not in existing_role_ids:
                    new_role = Role(role_id=role_data["role_id"], name=role_data["name"])
                    db.add(new_role)
                    print(f'Added new role: {new_role}')
                else:
                    print(f'{role_data} already in database')

            db.commit()

    def ensure_admin_user(self):
        from backend_flask.src.db.ORM.User import User
        from backend_flask.src.db.ORM.Role import Role
        from werkzeug.security import generate_password_hash

        with self.get_db() as db:
            admin_role = db.query(Role).filter_by(name="Admin").first()
            if not admin_role:
                raise ValueError("Admin role does not exist. Run `init_roles` first.")

            admin_user = db.query(User).filter_by(role_id=admin_role.role_id).first()

            if not admin_user:
                admin_user = User(
                    username="admin",
                    password_hash=generate_password_hash("123"),
                    role_id=admin_role.role_id,
                )
                db.add(admin_user)
                db.commit()
                print("Created default admin user: admin/123")
            else:
                print("Admin user already exists.")


    def create_all(self):
        Base.metadata.create_all(bind=self.engine)
        self.init_roles()
        self.ensure_admin_user()


    def dispose(self):
        self.SessionLocal.remove()
        self.engine.dispose()