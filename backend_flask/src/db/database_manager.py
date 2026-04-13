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


    def drop_db(self):
        print('Dropping Database...')
        with self.engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS taskproblems CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS tasktags CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS tags CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS status CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS roles CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS task_user_checkins CASCADE;"))
            conn.commit()


    def init_roles(self):
        from backend_flask.src.db.ORM.Role import Role

        with self.get_db() as db:
            existing_role_ids = {role.role_id for role in db.query(Role).all()}

            roles_to_create = [
                {"role_id": 1, "name": "Admin"},
                {"role_id": 2, "name": "Teamleider"},
                {"role_id": 3, "name": "Binnenkomend"},
                {"role_id": 4, "name": "Zelfstandigscanmedewerker"},
                {"role_id": 5, "name": "Scanmedewerkerplus"},
                {"role_id": 6, "name": "Scanmedewerker"},
            ]

            for role_data in roles_to_create:
                if role_data["role_id"] not in existing_role_ids:
                    new_role = Role(role_id=role_data["role_id"], name=role_data["name"])
                    db.add(new_role)
                    print(f'Added new role: {new_role}')
                else:
                    print(f'{role_data} already in database')

            db.commit()


    def init_tags(self):
        from backend_flask.src.db.ORM.Tag import Tag

        with self.get_db() as db:
            existing_tag_ids = {tag.tag_id for tag in db.query(Tag).all()}

            tags_to_create = [
                {"tag_id": 1, "tag": "Wegleg"},
                {"tag_id": 2, "tag": "Binnenkomend"},
                {"tag_id": 3, "tag": "Missend Product"},
                {"tag_id": 4, "tag": "Probleem met Bak"},
                {"tag_id": 5, "tag": "Hoge Prio"},
                {"tag_id": 6, "tag": "Orderpick"},
                {"tag_id": 7, "tag": "Multiorder"},
                {"tag_id": 8, "tag": "Verzenden"},
                {"tag_id": 9, "tag": "Band"},
                {"tag_id": 10, "tag": "PGS"},
                {"tag_id": 11, "tag": "Beneden"},
                {"tag_id": 12, "tag": "Boven"},
                {"tag_id": 13, "tag": "In de Wacht"},
                {"tag_id": 14, "tag": "Bijpick"},
                {"tag_id": 15, "tag": "Afval"},
                {"tag_id": 16, "tag": "Schoonmaak"},
                {"tag_id": 17, "tag": "Dozen"},
                {"tag_id": 18, "tag": "Ophalen"},
                {"tag_id": 19, "tag": "Kreekweg"},
                {"tag_id": 20, "tag": "Wegbrengen"},
                {"tag_id": 21, "tag": "Crediteren"},
                {"tag_id": 22, "tag": "Bijvullen"},
                {"tag_id": 23, "tag": "Tellen"},
                {"tag_id": 24, "tag": "Meten"},
                {"tag_id": 25, "tag": "Inventariseren"},
                {"tag_id": 26, "tag": "Opboeken"},
                {"tag_id": 27, "tag": "Afboeken"},
            ]

            for tag_data in tags_to_create:
                if tag_data["tag_id"] not in existing_tag_ids:
                    new_tag = Tag(tag_id=tag_data["tag_id"], tag=tag_data["tag"])
                    db.add(new_tag)
                    print(f'Added new tag: {new_tag}')
                else:
                    print(f'{tag_data} already in database')

            db.commit()


    def init_statuses(self):
        from backend_flask.src.db.ORM.Status import Status

        with self.get_db() as db:
            existing_status_ids = {status.status_id for status in db.query(Status).all()}

            statuses_to_create = [
                {"status_id": 1, "name": "To Do"},
                {"status_id": 2, "name": "In Progress"},
                {"status_id": 3, "name": "Done"},
                {"status_id": 4, "name": "Problem"},
            ]

            for status_data in statuses_to_create:
                if status_data["status_id"] not in existing_status_ids:
                    new_status = Status(status_id=status_data["status_id"], name=status_data["name"])
                    db.add(new_status)
                    print(f'Added new status: {new_status}')
                else:
                    print(f'Status {status_data} already in database')

            db.commit()


    def init_continuous_tasks(self):
        from backend_flask.src.db.ORM.Task import Task

        standard_tasks = [
            {"name": "Multi-Picken", "description": "Boven Multi Orderpicks Lopen", "priority": 2, "required_role": 6},
            {"name": "Order-Picken", "description": "Boven Orderpicks Lopen", "priority": 2, "required_role": 6},
            {"name": "Bij-Picken", "description": "Beneden Bijpicken", "priority": 2, "required_role": 6},
            {"name": "Verzenden", "description": "Bakken Verzenden", "priority": 2, "required_role": 5},
            {"name": "Binnenkomend", "description": "Producten binnenboeken", "priority": 2, "required_role": 3},
            {"name": "Wegleg", "description": "Producten wegleggen", "priority": 2, "required_role": 5},
        ]

        with self.get_db() as db:
            for task_data in standard_tasks:
                existing_task = db.query(Task).filter_by(name=task_data["name"], is_continuous=True).first()
                if not existing_task:
                    new_task = Task(
                        name=task_data["name"],
                        description=task_data["description"],
                        priority=task_data["priority"],
                        status_id=1,
                        delegated_to=None,
                        created_by=1,
                        updated_by=1,
                        is_continuous=True,
                    )
                    db.add(new_task)
                    print(f'Added new task: {new_task}')

                else:
                    print(f'Task {task_data} already in database')
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
        self.init_statuses()
        self.init_tags()
        self.ensure_admin_user()
        self.init_continuous_tasks()


    def dispose(self):
        self.SessionLocal.remove()
        self.engine.dispose()