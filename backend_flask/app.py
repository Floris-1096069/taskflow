import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from backend_flask.src.API.auth_api import auth_api
from backend_flask.src.API.task_api import task_api
from backend_flask.src.API.problem_api import problem_api


def create_app():
    app = Flask(__name__)

    #load environment variables
    load_dotenv()
    localhostfront_url = os.getenv("LOCALHOSTFRONT_URL")
    frontend_url = os.getenv("FRONTEND_URL")
    basedir = os.path.abspath(os.path.dirname(__file__))

    #configure Flask app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'secret')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'secret')
    app.config['FRONTEND_URL'] = frontend_url

    #CORS configuration
    CORS(app, supports_credentials=True, origins = [
    localhostfront_url,
    frontend_url
    ])

    #initialize extensions
    JWTManager(app)

    #register blueprints
    app.register_blueprint(auth_api)
    app.register_blueprint(problem_api)
    app.register_blueprint(task_api)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)