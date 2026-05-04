from backend_flask.src.db.ORM import Task
from backend_flask.src.db.ORM.Task import Task
from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.ORM.Role import Role
from backend_flask.src.db.ORM.Tag import Tag
from backend_flask.src.websocket.socketio import socketio
from backend_flask.src.db.database_manager import DatabaseManager
from collections import defaultdict
import traceback

def delegate_tasks(task_id=None):
    """
    Delegate tasks based on tags and user workload.
    Emits a WebSocket notification to the user when a task is assigned.
    """
    try:
        db_manager = DatabaseManager()
        with db_manager.get_db() as db:
            # --- Fetch roles (excluding Admin) ---
            roles = db.query(Role).filter(Role.name != "Admin").all()
            if not roles:
                print("⚠️ No non-Admin roles found in the database.")
                return {"success": False, "message": "No roles found"}

            # --- Fetch online users by role ---
            users_by_role = {}
            for role in roles:
                online_users = db.query(User).filter(
                    User.role_id == role.role_id,
                    User.is_online == True
                ).all()
                users_by_role[role.name] = online_users
                print(f"👥 Found {len(online_users)} online users for role: {role.name}")

            # --- Fetch tasks to delegate ---
            if task_id is not None:
                task = db.query(Task).filter(
                    Task.task_id == task_id,
                    Task.delegated_to == None,
                    Task.is_continuous == False
                ).first()
                tasks = [task] if task else []
                print(f"🔍 Processing single task: {task_id}")
            else:
                tasks = db.query(Task).filter(
                    Task.delegated_to == None,
                    Task.is_continuous == False
                ).all()
                print(f"📋 Found {len(tasks)} undelegated tasks to process.")

            if not tasks:
                print("⚠️ No undelegated tasks found.")
                return {"success": False, "message": "No undelegated tasks found"}

            # --- Count current tasks per user ---
            user_task_counts = defaultdict(int)
            for user_id, in db.query(Task.delegated_to).filter(
                Task.delegated_to.isnot(None)
            ).distinct():
                user_task_counts[user_id] = db.query(Task).filter(
                    Task.delegated_to == user_id
                ).count()

            # --- Delegation rules ---
            delegation_rules = {
                "Teamleider": {
                    "tags": [
                        "Crediteren", "Binnenkomend", "Missend Product", "Kreekweg", "In de Wacht", "Probleem met Bak",
                        "Hoge Prio",
                        "Bijvullen", "Meten", "PGS", "Wegleg", "Tellen", "Inventariseren", "Verzenden", "Orderpick",
                        "Multiorder",
                        "Bijpick", "Opboeken", "Afboeken", "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden",
                        "Boven", "Wegbrengen"

                    ]
                },
                "Binnenkomend": {
                    "tags": [
                        "Binnenkomend", "Missend Product", "Kreekweg", "In de Wacht", "Probleem met Bak", "Hoge Prio",
                        "Bijvullen", "PGS", "Wegleg", "Inventariseren", "Opboeken", "Afboeken", "Ophalen", "Beneden",
                        "Boven", "Wegbrengen"
                    ]
                },
                "Zelfstandigscanmedewerker": {
                    "tags": [
                        "In de Wacht", "Probleem met Bak", "Hoge Prio", "Bijvullen", "Meten", "PGS",
                        "Wegleg", "Tellen", "Inventariseren", "Verzenden", "Orderpick", "Multiorder", "Bijpick",
                        "Opboeken",
                        "Afboeken", "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden", "Boven", "Wegbrengen"
                    ]
                },
                "Scanmedewerkerplus": {
                    "tags": [
                        "Wegleg", "Tellen", "Inventariseren", "Verzenden", "Orderpick", "Multiorder", "Bijpick",
                        "Opboeken",
                        "Afboeken", "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden", "Boven", "Wegbrengen"
                    ]
                },
                "Scanmedewerker": {
                    "tags": [
                        "Band", "Afval", "Schoonmaak", "Dozen", "Ophalen", "Beneden", "Boven", "Wegbrengen"
                    ]
                }
            }

            delegated_count = 0

            for task in tasks:
                if not task:
                    continue

                print(f"🔍 Processing task {task.task_id}: {task.name}")

                # --- Find eligible roles for this task ---
                eligible_roles = []
                task_tags = [t.tag for t in task.tags]
                for role_name, rule in delegation_rules.items():
                    if any(tag in rule["tags"] for tag in task_tags):
                        eligible_roles.append(role_name)

                if not eligible_roles:
                    print(f"⚠️ No eligible roles for task {task.task_id} (tags: {task_tags})")
                    continue

                print(f"✅ Eligible roles for task {task.task_id}: {eligible_roles}")

                # --- Find the least busy user in eligible roles ---
                best_user = None
                min_tasks = float('inf')
                for role_name in eligible_roles:
                    for user in users_by_role.get(role_name, []):
                        current_tasks = user_task_counts.get(user.user_id, 0)
                        if current_tasks < min_tasks:
                            min_tasks = current_tasks
                            best_user = user

                if best_user:
                    print(f"🎯 Delegating task {task.task_id} to {best_user.username} (current tasks: {min_tasks})")
                    task.delegated_to = best_user.user_id
                    task.updated_by = 1  # admin
                    db.commit()

                    # --- Emit notification ---
                    try:
                        socketio.emit(
                            "notification",
                            {
                                "message": f"You've been assigned task {task.task_id}: {task.name}!",
                                "task_id": task.task_id,
                                "task_name": task.name,
                                "type": "task_assigned"
                            },
                            room=str(best_user.user_id)
                        )
                        print(f"📢 Notification sent to user {best_user.user_id} for task {task.task_id}")
                    except Exception as emit_error:
                        print(f"⚠️ Failed to emit notification to {best_user.user_id}: {emit_error}")
                        db.rollback()

                    delegated_count += 1

                    if task_id is not None:
                        print(f"✅ Task {task.task_id} delegated to {best_user.username}")
                        return {
                            "success": True,
                            "message": f"Task {task.task_id} delegated to {best_user.username}",
                            "user": best_user.username,
                            "task_id": task.task_id
                        }
                else:
                    print(f"⚠️ No suitable user found for task {task.task_id}")

            # --- Batch delegation result ---
            if task_id is None:
                print(f"✅ Delegated {delegated_count} tasks.")
                return {
                    "success": True,
                    "message": f"Delegated {delegated_count} tasks",
                    "count": delegated_count
                }

            return {"success": False, "message": "No suitable user found"}

    except Exception as e:
        print(f"❌ Critical error in delegate_tasks: {e}")
        traceback.print_exc()
        return {"success": False, "message": f"Critical error: {str(e)}"}

if __name__ == "__main__":
    result = delegate_tasks()
    print(f"Result: {result}")