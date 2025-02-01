from flask import Flask
from flask_socketio import SocketIO
import asyncio
from moonshineBufferedQueue import data_queue
import ASR_dummy  # Import to ensure the thread starts

app = Flask(__name__)
socketio = SocketIO(app, async_mode='eventlet')

@app.route('/')
def index():
    return "Flask WebSocket Server Running"

@socketio.on('connect')
def handle_connect():
    print("Client Connected!")

@socketio.on('disconnect')
def handle_disconnect():
    print("Client Disconnected!")

async def send_data():
    """Push data to WebSocket clients as soon as it's available."""
    while True:
        data = await data_queue.get()  # Wait for new data (async)
        socketio.emit('new_data', {'message': data})
        print(f"Sent: {data}")

# Start the async task for handling WebSocket messages
if __name__ == '__main__':
    socketio.start_background_task(send_data)  # Runs the WebSocket data push loop
    socketio.run(app, debug=True)
