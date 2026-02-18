import os
import unittest
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
from backend_flask.src.ORM.models import Base, User, Role, Status, Task, TaskProblem
from backend_flask.src.ORM.database_manager import DatabaseManager

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

class TestPostgresConnection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up the PostgreSQL database connection and create tables."""
        cls.db_manager = DatabaseManager(DATABASE_URL, echo=True)

    @classmethod
    def tearDownClass(cls):
        """Drop all tables after tests."""
        cls.db_manager.dispose()

    def setUp(self):
        """Create a new session and reset the database for each test."""
        self.db_manager.recreate_db()
        self.session = next(self.db_manager.get_db())

    def tearDown(self):
        """Rollback and close the session after each test."""
        self.session.rollback()
        self.session.close()

    def test_postgres_connection(self):
        """Test if the PostgreSQL connection is successful."""
        try:
            self.session.execute(text("SELECT 1"))
        except OperationalError as e:
            self.fail(f"PostgreSQL connection failed: {e}")

    def test_tables_exist(self):
        inspector = inspect(self.db_manager.engine)
        tables = inspector.get_table_names()
        expected_tables = ["users", "roles", "status", "tasks", "taskproblems", "tags", "tasktags"]
        for table in expected_tables:
            self.assertIn(table, tables, f"Table '{table}' not found in PostgreSQL.")

    def test_orm_insert_and_query_user(self):
        """Test ORM insert and query operations for User."""
        #create and add a role
        role = Role(role="test_role")
        self.session.add(role)
        self.session.commit()

        #create and add a user
        user = User(username="test_user", password_hash="hashed_password", role_id=role.role_id)
        self.session.add(user)
        self.session.commit()

        #query the user
        queried_user = self.session.query(User).filter_by(username="test_user").first()
        self.assertIsNotNone(queried_user, "User not found in PostgreSQL.")
        self.assertEqual(queried_user.username, "test_user")
        self.assertEqual(queried_user.role.role, "test_role")  # Test relationship

    def test_orm_insert_and_query_task(self):
        """Test ORM insert and query operations for Task."""
        #create and add a status
        status = Status(status="open")
        self.session.add(status)
        self.session.commit()

        #create and add a role and user
        role = Role(role="test_role")
        self.session.add(role)
        self.session.commit()
        user = User(username="test_user", password_hash="hashed_password", role_id=role.role_id)
        self.session.add(user)
        self.session.commit()

        #create and add a task
        task = Task(
            name="Test Task",
            description="This is a test task.",
            priority=1,
            status_id=status.status_id,
            delegated_to=user.user_id,
            created_by=user.user_id,
            updated_by=user.user_id,
        )
        self.session.add(task)
        self.session.commit()

        #query the task
        queried_task = self.session.query(Task).filter_by(name="Test Task").first()
        self.assertIsNotNone(queried_task, "Task not found in PostgreSQL.")
        self.assertEqual(queried_task.status.status, "open")  # Test relationship

    def test_orm_insert_and_query_task_problem(self):
        """Test ORM insert and query operations for TaskProblem."""
        #create and add a status
        status = Status(status="problem")
        self.session.add(status)
        self.session.commit()

        #create and add a role and user
        role = Role(role="test_role")
        self.session.add(role)
        self.session.commit()
        user = User(username="test_user", password_hash="hashed_password", role_id=role.role_id)
        self.session.add(user)
        self.session.commit()

        #create and add a task
        task = Task(
            name="Problem Task",
            description="This task has a problem.",
            priority=3,
            status_id=status.status_id,
            delegated_to=user.user_id,
            created_by=user.user_id,
            updated_by=user.user_id,
        )
        self.session.add(task)
        self.session.commit()

        #create and add a task problem
        problem = TaskProblem(
            task_id=task.task_id,
            user_id=user.user_id,
            content="This is a test problem description.",
        )
        self.session.add(problem)
        self.session.commit()

        #query the problem
        queried_problem = self.session.query(TaskProblem).filter_by(task_id=task.task_id).first()
        self.assertIsNotNone(queried_problem, "TaskProblem not found in PostgreSQL.")
        self.assertEqual(queried_problem.user.username, "test_user")  # Test relationship

    def test_orm_relationships(self):
        """Test ORM relationships between models."""
        #create and add a role
        role = Role(role="test_role")
        self.session.add(role)
        self.session.commit()

        #create and add a user
        user = User(username="test_user", password_hash="hashed_password", role_id=role.role_id)
        self.session.add(user)
        self.session.commit()

        #create and add a status
        status = Status(status="open")
        self.session.add(status)
        self.session.commit()

        #create and add a task
        task = Task(
            name="Relationship Task",
            description="This task tests relationships.",
            priority=2,
            status_id=status.status_id,
            delegated_to=user.user_id,
            created_by=user.user_id,
            updated_by=user.user_id,
        )
        self.session.add(task)
        self.session.commit()

        #test User ↔ Task relationship
        self.assertEqual(len(user.created_tasks), 1)
        self.assertEqual(user.created_tasks[0].name, "Relationship Task")

        #test Task - Status relationship
        self.assertEqual(task.status.status, "open")

        #test Task - TaskProblem relationship
        problem = TaskProblem(
            task_id=task.task_id,
            user_id=user.user_id,
            content="Test problem",
        )
        self.session.add(problem)
        self.session.commit()
        self.assertEqual(len(task.task_problems), 1)
        self.assertEqual(task.task_problems[0].content, "Test problem")


if __name__ == "__main__":
    unittest.main()