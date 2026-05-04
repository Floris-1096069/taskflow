from flask_socketio import emit, join_room, leave_room, SocketIO, disconnect
from flask import request
from flask_jwt_extended import jwt_required, get_jwt, decode_token
from jwt import ExpiredSignatureError, InvalidTokenError


def init_socketio_handlers(socketio_instance):
    @socketio_instance.on("connect")
    def handle_connect():
        try:
            token = request.args.get("token")
            if not token:
                print("No token provided in WebSocket connection")
                disconnect()
                return

            #manually decode and verify the JWT
            try:
                decoded_token = decode_token(token)
                user_id = decoded_token["sub"]
                print(f"User {user_id} connected and joined room {user_id}")
                join_room(str(user_id))

            except ExpiredSignatureError:
                print("Token expired")
                disconnect()

            except InvalidTokenError as e:
                print(f"Invalid token: {e}")
                disconnect()

            except Exception as e:
                print(f"Token decode error: {e}")
                disconnect()

        except Exception as e:
            print(f"WebSocket authentication failed: {e}")
            disconnect()


    @socketio_instance.on("disconnect")
    def handle_disconnect():
        try:
            print(f"Client {request.sid} disconnected")

        except Exception as e:
            print(f"Error during WebSocket disconnect: {e}")


    @socketio_instance.on("custom_event")
    def handle_custom_event(data):
        try:
            user_id = request.sid
            print(f"User {user_id} sent: {data}")
            # Example: Broadcast to the user's room
            emit("notification", {"title": "Event Received", "message": f"You sent: {data}"}, room=user_id)
        except Exception as e:
            print(f"Error handling custom event: {e}")

    
    @socketio_instance.on_error_default
    def default_error_handler(e):
        print(f"WebSocket error: {e}")