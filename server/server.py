from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time
import random

from moonshineBufferedQueue import data_queue
from asr import main as asr_main


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global state variable
current_state = {"value": 0, "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")}


@app.route("/next-sentence", methods=["GET"])
def get_state():
    """Endpoint to get the current state"""
    next_sentence = data_queue.get()
    return jsonify(
        {
            "sentence": next_sentence,
        }
    )


if __name__ == "__main__":
    # Start the background thread before running the Flask app
    updater_thread = threading.Thread(target=asr_main, daemon=True)
    updater_thread.start()

    # Run the Flask app
    app.run(debug=True)
