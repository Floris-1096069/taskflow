import unittest
from backend_flask.src.db.ORM.User import User
from backend_flask.src.db.database_manager import DatabaseManager
from backend_flask.src.db.ORM.enums import RoleEnum

class TestAuthorization(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_manager = DatabaseManager(echo=True)

    @classmethod
    def tearDownClass(cls):
        cls.db_manager.dispose()

    def setUp(self):
        self.db_manager.recreate_db()  # This will initialize roles
        self.session = next(self.db_manager.get_db())

    def tearDown(self):
        self.session.rollback()
        self.session.close()

    def test_get_role_admin(self):
        user = User(username="admin_user", password_hash="hashed_password", role_id=RoleEnum.ADMIN.value)
        self.session.add(user)
        self.session.commit()

        role = User.get_role(user.user_id)
        self.assertEqual(role, RoleEnum.ADMIN)

    def test_get_role_manager(self):
        user = User(username="manager_user", password_hash="hashed_password", role_id=RoleEnum.MANAGER.value)
        self.session.add(user)
        self.session.commit()

        role = User.get_role(user.user_id)
        self.assertEqual(role, RoleEnum.MANAGER)

    def test_get_role_teamleider(self):
        user = User(username="teamleider_user", password_hash="hashed_password", role_id=RoleEnum.TEAMLEIDER.value)
        self.session.add(user)
        self.session.commit()

        role = User.get_role(user.user_id)
        self.assertEqual(role, RoleEnum.TEAMLEIDER)

    def test_get_role_scanmedewerkerplus(self):
        user = User(username="scanmedewerkerplus_user", password_hash="hashed_password", role_id=RoleEnum.SCANMEDEWERKERPLUS.value)
        self.session.add(user)
        self.session.commit()

        role = User.get_role(user.user_id)
        self.assertEqual(role, RoleEnum.SCANMEDEWERKERPLUS)

    def test_get_role_scanmedewerker(self):
        user = User(username="scanmedewerker_user", password_hash="hashed_password", role_id=RoleEnum.SCANMEDEWERKER.value)
        self.session.add(user)
        self.session.commit()

        role = User.get_role(user.user_id)
        self.assertEqual(role, RoleEnum.SCANMEDEWERKER)

    def test_get_role_user_not_found(self):
        role = User.get_role(999)
        self.assertIsNone(role)

    def test_is_authorized_admin(self):
        user = User(username="admin_user", password_hash="hashed_password", role_id=RoleEnum.ADMIN.value)
        self.session.add(user)
        self.session.commit()

        is_authorized = User.is_authorized(user.user_id)
        self.assertTrue(is_authorized)

    def test_is_authorized_manager(self):
        user = User(username="manager_user", password_hash="hashed_password", role_id=RoleEnum.MANAGER.value)
        self.session.add(user)
        self.session.commit()

        is_authorized = User.is_authorized(user.user_id)
        self.assertTrue(is_authorized)

    def test_is_authorized_teamleider(self):
        user = User(username="teamleider_user", password_hash="hashed_password", role_id=RoleEnum.TEAMLEIDER.value)
        self.session.add(user)
        self.session.commit()

        is_authorized = User.is_authorized(user.user_id)
        self.assertTrue(is_authorized)

    def test_is_authorized_scanmedewerkerplus(self):
        user = User(username="scanmedewerkerplus_user", password_hash="hashed_password", role_id=RoleEnum.SCANMEDEWERKERPLUS.value)
        self.session.add(user)
        self.session.commit()

        is_authorized = User.is_authorized(user.user_id)
        self.assertFalse(is_authorized)

    def test_is_authorized_scanmedewerker(self):
        user = User(username="scanmedewerker_user", password_hash="hashed_password", role_id=RoleEnum.SCANMEDEWERKER.value)
        self.session.add(user)
        self.session.commit()

        is_authorized = User.is_authorized(user.user_id)
        self.assertFalse(is_authorized)

    def test_is_authorized_user_not_found(self):
        is_authorized = User.is_authorized(999)
        self.assertFalse(is_authorized)

if __name__ == "__main__":
    unittest.main()