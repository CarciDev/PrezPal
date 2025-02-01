from flask import Flask, jsonify
import threading
import time
import random

from moonshineBufferedQueue import data_queue
from asr import main as asr_main

app = Flask(__name__)

# Global state variable
current_state = {"value": 0, "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")}


def random_update_to_state():
    """Function to randomly update the state in a separate thread"""
    global current_state
    while True:
        # Random update between -10 and 10
        new_value = current_state["value"] + random.randint(-10, 10)
        current_state = {
            "value": new_value,
            "last_updated": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        # Sleep for a random interval between 1-5 seconds
        time.sleep(1)


@app.route("/", methods=["GET"])
def get_state():
    """Endpoint to get the current state"""
    return data_queue.get()


if __name__ == "__main__":
    # Start the background thread before running the Flask app
    updater_thread = threading.Thread(target=asr_main, daemon=True)
    updater_thread.start()

    # Run the Flask app
    app.run(debug=True)
