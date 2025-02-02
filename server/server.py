from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time
import random

from pipeline_queues import moonshine_queue, analyzer_queue
from asr import main as asr_main


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/next-sentence", methods=["GET"])
def get_state():
    """Endpoint to get the current state"""
    next_element = moonshine_queue.get()
    analyzer_queue.put(next_element)
    return jsonify(
        {
            "sentence": next_element["text"],
        }
    )


if __name__ == "__main__":
    # Start the background thread before running the Flask app
    updater_thread = threading.Thread(target=asr_main, daemon=True)
    updater_thread.start()

    # Run the Flask app
    app.run(debug=True)
