from backend_flask.src.db.ORM import Task
from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Role import Role
from backend_flask.src.db.ORM.Tag import Tag
from backend_flask.src.db.database_manager import DatabaseManager
from collections import defaultdict
from datetime import datetime, timedelta

def delegate_tasks(task_id = None):
    """Delegate tasks based on tags, and user workload."""
    db_manager = DatabaseManager()
    with db_manager.get_db() as db:
        roles = db.query(Role).filter(Role.name != "Admin").all()
        users_by_role = {role.name: db.query(User).filter(User.role_id == role.role_id, User.is_online == True).all()
                         for role in roles}

        if task_id is not None:
            tasks = [db.query(Task).filter(
                Task.task_id == task_id,
                Task.delegated_to == None,
                Task.is_continuous == False
            ).first()]

        else:
            tasks = db.query(Task).filter(Task.delegated_to == None, Task.is_continuous == False).all()

        if not tasks or (task_id is not None and not tasks[0]):
            print("Task not found or user already delegated")
            return {"success": False, "message": "Task not found or already delegated"}

        user_task_counts = defaultdict(int)
        for user_id, in db.query(Task.delegated_to).filter(Task.delegated_to.isnot(None)).distinct():
            user_task_counts[user_id] = db.query(Task).filter(Task.delegated_to == user_id).count()

        delegation_rules = {
            "Teamleider" : {
                "tags": [
                    "Crediteren", "Binnenkomend", "Missend Product", "Kreekweg", "In de Wacht", "Probleem met Bak", "Hoge Prio",
                    "Bijvullen", "Meten", "PGS", "Wegleg", "Tellen", "Inventariseren", "Verzenden", "Orderpick", "Multiorder",
                    "Bijpick", "Opboeken","Afboeken", "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden", "Boven", "Wegbrengen"

                ]
            },
            "Binnenkomend" : {
                "tags": [
                    "Binnenkomend", "Missend Product", "Kreekweg", "In de Wacht", "Probleem met Bak", "Hoge Prio",
                    "Bijvullen", "PGS", "Wegleg", "Inventariseren", "Opboeken","Afboeken", "Ophalen", "Beneden", "Boven", "Wegbrengen"
                ]
            },
            "Zelfstandigscanmedewerker": {
                "tags": [
                    "In de Wacht", "Probleem met Bak", "Hoge Prio", "Bijvullen", "Meten", "PGS",
                    "Wegleg", "Tellen", "Inventariseren", "Verzenden", "Orderpick", "Multiorder", "Bijpick", "Opboeken",
                    "Afboeken", "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden", "Boven", "Wegbrengen"
                ]
            },
            "Scanmedewerkerplus": {
                "tags": [
                    "Wegleg", "Tellen", "Inventariseren", "Verzenden", "Orderpick", "Multiorder", "Bijpick", "Opboeken",
                    "Afboeken", "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden", "Boven", "Wegbrengen"
                ]
            },
            "Scanmedewerker": {
                "tags": [
                    "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden", "Boven", "Wegbrengen"
                ]
            }
        }

        for task in tasks:
            if not task:
                continue

            eligible_roles = []
            for role_name, rule in delegation_rules.items():
                if any(tag in rule["tags"] for tag in [t.tag for t in task.tags]):
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
                task.updated_by = 1  #admin
                db.commit()
                if task_id is not None:
                    print(f"Task delegated to {best_user.username}")
                    return {"success": True, "message": f"Task delegated to {best_user.username}",
                            "user": best_user.username}
                else:
                    print(f"Delegated task {task.task_id} to {best_user.username}")

        if task_id is None:
            print(f"Delegated {len(tasks)} tasks.")
            return {"success": True, "message": f"Delegated {len(tasks)} tasks"}

        return {"success": False, "message": "No suitable user found"}

if __name__ == "__main__":
    delegate_tasks()