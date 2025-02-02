from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time
import random

from pipeline_queues import moonshine_queue, analyzer_queue
from asr import main as asr_main
from analyzerUtil import main as analyzer_main
from analyzerUtil import get_summary

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

@app.route("/summary", methods=["GET"])
def summary():
    """Endpoint to get analyzed summary data"""
    frequency, filler_count, times, paces = get_summary()
    return jsonify({
        "word_frequency": frequency,
        "filler_count": filler_count,
        "times": times,
        "paces": paces
    })


if __name__ == "__main__":
    threading.Thread(target=asr_main, daemon=True).start()
    threading.Thread(target=analyzer_main, daemon=True).start()

    # Run the Flask app
    app.run(debug=True, port=5002)
