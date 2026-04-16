import os
import warnings
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from jwt import InsecureKeyLengthWarning
from datetime import timedelta
from apscheduler.schedulers.background import BackgroundScheduler


from backend_flask.src.API.auth_api import auth_api
from backend_flask.src.API.task_api import task_api
from backend_flask.src.API.problem_api import problem_api
from backend_flask.src.API.user_api import user_api
from backend_flask.src.db.database_manager import DatabaseManager
from backend_flask.src.tasks.cleanup import cleanup_inactive_users
from backend_flask.src.tasks.delegation import delegate_tasks


socketio = SocketIO()
def create_app():
    app = Flask(__name__)

    #load environment variables
    load_dotenv()
    frontend_url = os.getenv("FRONTEND_URL")

    #configure Flask app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'secret')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'secret')
    app.config['FRONTEND_URL'] = frontend_url
    warnings.filterwarnings("ignore", category=InsecureKeyLengthWarning)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

    #CORS configuration
    #SET UP ORIGINS FROM ENV IN PROD!
    CORS(app, supports_credentials=True, origins = "*")

    #initialize extensions
    socketio.init_app(app, cors_allowed_origins="*")
    JWTManager(app)
    scheduler = BackgroundScheduler()

    #add scheduled scripts
    scheduler.add_job(
        func=cleanup_inactive_users,
        trigger="interval",
        minutes=3,
        id="cleanup_inactive_users",
        name="Mark inactive users as offline",
        replace_existing=True,
    )
    scheduler.add_job(
        func=delegate_tasks,
        trigger="interval",
        minutes=3,
        id="delegate_tasks",
        name="Automatically delegate tasks",
        replace_existing=True,
    )
    scheduler.start()

    #register blueprints
    app.register_blueprint(auth_api)
    app.register_blueprint(problem_api)
    app.register_blueprint(task_api)
    app.register_blueprint(user_api)

    #configure database
    db_manager = DatabaseManager()
    with app.app_context():
        #uncomment drop_db() to drop database before creating entries
        #db_manager.drop_db()
        db_manager.create_all()

    return app, socketio

#websocket handlers
@socketio.on("connect")
def handle_connect():
    print("Client connected via WebSocket")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected via WebSocket")

if __name__ == '__main__':
    app, socketio = create_app()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)