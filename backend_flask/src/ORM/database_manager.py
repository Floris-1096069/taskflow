from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from backend_flask.src.ORM.models import Base

class DatabaseManager:
    def __init__(self, database_url: str, echo: bool = False):
        self.engine = create_engine(database_url, echo=echo)
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
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

    def dispose(self):
        self.SessionLocal.remove()
        self.engine.dispose()