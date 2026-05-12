from flask_socketio import SocketIO

"""
set up socketIO instance in a separate file to avoid circular imports
"""

socketio = SocketIO()