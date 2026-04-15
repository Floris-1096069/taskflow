from datetime import datetime, timedelta
from backend_flask.src.db.ORM.User import User


def cleanup_inactive_users():
    with User._db_manager.get_db() as db:
        three_minutes_ago = datetime.now() - timedelta(minutes=3)
        db.query(User).filter(
            User.is_online == True,
            User.last_seen < three_minutes_ago,
        ).update({User.is_online: False}, synchronize_session=False)
        db.commit()
        print("Cleaned up inactive accounts")