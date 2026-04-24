from flask_socketio import emit, join_room, leave_room, SocketIO, disconnect
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def init_socketio_handlers(socketio: SocketIO):
    @socketio.on("connect")
    def handle_connect():
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            print(f"User {user_id} connected via WebSocket")
            join_room(str(user_id))
        except Exception as e:
            print(f"WebSocket authentication failed: {e}")
            disconnect()

    @socketio.on("disconnect")
    def handle_disconnect():
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            print(f"User {user_id} disconnected via WebSocket")
            leave_room(str(user_id))
        except Exception as e:
            print(f"Error during WebSocket disconnect: {e}")

    @socketio.on("custom_event")
    def handle_custom_event(data):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            print(f"User {user_id} sent: {data}")
        except Exception as e:
            print(f"Error handling custom event: {e}")

    @socketio.on_error_default
    def default_error_handler(e):
        print(f"WebSocket error: {e}")