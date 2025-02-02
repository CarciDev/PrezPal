import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import threading
import time
from pipeline_queues import analyzer_queue
import re

# Global storage variables
frequency = {}
times = []
paces = []
filler_count = {}

# Filler words to track
FILLER_WORDS = ['UM', 'UH', 'LIKE', 'YOU KNOW', 'SO', 'ACTUALLY', 'BASICALLY', 'SERIOUSLY']

def main():
    print("[Analyzer] Thread started and waiting for data...")
    while True:
        try:
            sentence = analyzer_queue.get(timeout=1)  # Wait for data (timeout prevents indefinite blocking)
            process_sentence(sentence)
        except Exception as e:
            pass

def process_sentence(sentence):
    global frequency, times, paces, filler_count

    text, duration = sentence["text"], sentence["duration"]
    words = text.upper().split()
    words = re.sub(r'[^A-Z\s]', '', text.upper()).split()

    # Update word frequency
    for word in words:
        frequency[word] = frequency.get(word, 0) + 1

    # Update filler count
    for word in FILLER_WORDS:
        filler_count[word] = frequency.get(word, 0)

    # Update time and pace tracking
    if times:
        times.append(times[-1] + duration)
    else:
        times.append(duration)
    paces.append(len(words) / duration if duration > 0 else 0)

def get_summary():
    return frequency, filler_count, times, paces

if __name__ == "__main__":
    main()
