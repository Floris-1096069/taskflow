from backend_flask.src.db.database_manager import DatabaseManager
from backend_flask.src.db.ORM.Role import Role

db_manager = DatabaseManager()
db_manager.recreate_db()
db = next(db_manager.get_db())
Role.initialize_roles(db)