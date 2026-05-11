from datetime import datetime, timedelta

from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.ORM.TaskUserCheckIn import TaskUserCheckIn


def cleanup_inactive_users():
    """Set accounts that haven't sent a heartbeat for 3 minutes as offline"""
    with User._db_manager.get_db() as db:
        three_minutes_ago = datetime.now() - timedelta(minutes=3)

        inactive_users = db.query(User).filter(
            User.is_online == True,
            User.last_seen < three_minutes_ago,
        ).all()

        if not inactive_users:
            print("No active users to cleanup")
            return

        db.query(User).filter(
            User.is_online == True,
            User.last_seen < three_minutes_ago,
        ).update({User.is_online: False}, synchronize_session=False)

        for user in inactive_users:
            checkins = db.query(TaskUserCheckIn).join(Task).filter(
                TaskUserCheckIn.user_id == user.user_id,
                Task.is_continuous == True
            ).all()

            for checkin in checkins:
                db.delete(checkin)

        db.commit()
        print(f"Cleaned up {inactive_users.count} inactive accounts")