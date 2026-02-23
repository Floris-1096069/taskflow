import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base


load_dotenv()
Base = declarative_base()


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
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)


    def dispose(self):
        self.SessionLocal.remove()
        self.engine.dispose()