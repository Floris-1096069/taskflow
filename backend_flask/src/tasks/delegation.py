from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Role import Role
from backend_flask.src.db.ORM.Tag import Tag
from backend_flask.src.db.database_manager import DatabaseManager
from collections import defaultdict
from datetime import datetime, timedelta

def delegate_tasks():
    """Delegate tasks based on priority, tags, and user workload."""
    db_manager = DatabaseManager()
    with db_manager.get_db() as db:
        roles = db.query(Role).filter(Role.name != "Admin").all()
        users_by_role = {role.name: db.query(User).filter(User.role_id == role.role_id, User.is_online == True).all()
                         for role in roles}

        tasks = db.query(Task).filter(Task.delegated_to == None).all()

        user_task_counts = defaultdict(int)
        for user_id, in db.query(Task.delegated_to).filter(Task.delegated_to.isnot(None)).distinct():
            user_task_counts[user_id] = db.query(Task).filter(Task.delegated_to == user_id).count()

        delegation_rules = {
            "Teamleider" : {
                "tags": [

                ]
            },
            "Binnenkomend" : {
                "tags": [

                ]
            },
            "Zelfstandigscanmedewerker": {
                "tags": [

                ]
            },
            "Scanmedewerkerplus": {
                "tags": [

                ]
            },
            "Scanmedewerker": {
                "tags": [

                ]
            }
        }

        for task in tasks:
            eligible_roles = []
            for role_name, rule in delegation_rules.items():
                if any(tag in rule["tags"] for tag in task.tags):
                    eligible_roles.append(role_name)

            best_user = None
            min_tasks = float('inf')
            for role_name in eligible_roles:
                for user in users_by_role.get(role_name, []):
                    current_tasks = user_task_counts.get(user.user_id, 0)
                    if current_tasks < min_tasks:
                        min_tasks = current_tasks
                        best_user = user

            if best_user:
                task.delegated_to = best_user.user_id
                task.updated_by = 1
                user_task_counts[best_user.user_id] += 1
                print(
                    f"Delegated task {task.task_id} (priority {task.priority}) to {best_user.username} (current tasks: {min_tasks + 1})")

            db.commit()
            print(f"Delegated {len(tasks)} tasks.")

if __name__ == "__main__":
    delegate_tasks()