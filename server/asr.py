# Altered version of https://github.com/usefulsensors/moonshine/blob/main/demo/moonshine-onnx/live_captions.py

import argparse
import os
import time
import asyncio
from queue import Queue


import numpy as np
from silero_vad import VADIterator, load_silero_vad
from sounddevice import InputStream

from moonshine_onnx import MoonshineOnnxModel, load_tokenizer
from pipeline_queues import moonshine_queue, analyzer_queue

SAMPLING_RATE = 16000

CHUNK_SIZE = 512  # Silero VAD requirement with sampling rate 16000.
LOOKBACK_CHUNKS = 5
MAX_LINE_LENGTH = 80

# These affect live caption updating - adjust for your platform speed and model.
MAX_SPEECH_SECS = 15
MIN_REFRESH_SECS = 0.2


class Transcriber(object):
    def __init__(self, model_name, rate=16000):
        if rate != 16000:
            raise ValueError("Moonshine supports sampling rate 16000 Hz.")
        self.model = MoonshineOnnxModel(model_name=model_name)
        self.rate = rate
        self.tokenizer = load_tokenizer()

        self.inference_secs = 0
        self.number_inferences = 0
        self.speech_secs = 0
        self.__call__(np.zeros(int(rate), dtype=np.float32))  # Warmup.

    def __call__(self, speech):
        """Returns string containing Moonshine transcription of speech."""
        self.number_inferences += 1
        self.speech_secs += len(speech) / self.rate
        start_time = time.time()

        tokens = self.model.generate(speech[np.newaxis, :].astype(np.float32))
        text = self.tokenizer.decode_batch(tokens)[0]

        self.inference_secs += time.time() - start_time
        return text


def create_input_callback(q):
    """Callback method for sounddevice InputStream."""

    def input_callback(data, frames, time, status):
        if status:
            print(status)
        q.put((data.copy().flatten(), status))

    return input_callback


def end_recording(speech, transcribe, caption_cache, do_print=True):
    """Transcribes and prints the caption, places it in a queue, then clears speech buffer."""
    text = transcribe(speech)
    if do_print:
        print_captions(text, caption_cache)
    caption_cache.append(text)
    speech *= 0.0
    moonshine_queue.put({"text": text, "duration": (len(speech) / SAMPLING_RATE)})
    analyzer_queue.put({"text": text, "duration": (len(speech) / SAMPLING_RATE)})

def print_captions(text, caption_cache):
    """Prints right justified on same line, prepending cached captions."""
    if len(text) < MAX_LINE_LENGTH:
        for caption in caption_cache[::-1]:
            text = caption + " " + text
            if len(text) > MAX_LINE_LENGTH:
                break
    if len(text) > MAX_LINE_LENGTH:
        text = text[-MAX_LINE_LENGTH:]
    else:
        text = " " * (MAX_LINE_LENGTH - len(text)) + text
    print("\r" + (" " * MAX_LINE_LENGTH) + "\r" + text, end="", flush=True)


def soft_reset(vad_iterator):
    """Soft resets Silero VADIterator without affecting VAD model state."""
    vad_iterator.triggered = False
    vad_iterator.temp_end = 0
    vad_iterator.current_sample = 0


def main():
    parser = argparse.ArgumentParser(
        prog="live_captions",
        description="Live captioning demo of Moonshine models",
    )
    parser.add_argument(
        "--model_name",
        help="Model to run the demo with",
        default="moonshine/base",
        choices=["moonshine/base", "moonshine/tiny"],
    )
    args = parser.parse_args()
    model_name = args.model_name
    print(f"ASR thread started (Moonshine model '{model_name}')")
    transcribe = Transcriber(model_name=model_name, rate=SAMPLING_RATE)

    vad_model = load_silero_vad(onnx=True)
    vad_iterator = VADIterator(
        model=vad_model,
        sampling_rate=SAMPLING_RATE,
        threshold=0.5,
        min_silence_duration_ms=300,
    )

    q = Queue()
    stream = InputStream(
        samplerate=SAMPLING_RATE,
        channels=1,
        blocksize=CHUNK_SIZE,
        dtype=np.float32,
        callback=create_input_callback(q),
    )
    stream.start()

    caption_cache = []
    lookback_size = LOOKBACK_CHUNKS * CHUNK_SIZE
    speech = np.empty(0, dtype=np.float32)

    recording = False

    with stream:
        print("ASR thread is listening...")
        try:
            while True:
                chunk, status = q.get()
                if status:
                    print(status)

                speech = np.concatenate((speech, chunk))
                if not recording:  # Only recording when VAD detects speech.
                    speech = speech[-lookback_size:]

                speech_dict = vad_iterator(chunk)
                if speech_dict:
                    if "start" in speech_dict and not recording:
                        recording = True
                        start_time = time.time()

                    if "end" in speech_dict and recording:
                        recording = False
                        end_recording(speech, transcribe, caption_cache)

                elif recording:
                    # Possible speech truncation can cause hallucination.

                    if (len(speech) / SAMPLING_RATE) > MAX_SPEECH_SECS:
                        recording = False
                        end_recording(speech, transcribe, caption_cache)
                        soft_reset(vad_iterator)

                    if (time.time() - start_time) > MIN_REFRESH_SECS:
                        print_captions(transcribe(speech), caption_cache)
                        start_time = time.time()

        except KeyboardInterrupt:
            stream.close()

            if recording:
                while not q.empty():
                    chunk, _ = q.get()
                    speech = np.concatenate((speech, chunk))
                end_recording(speech, transcribe, caption_cache, do_print=False)

            print("ASR thread interrupted.")


if __name__ == "__main__":
    main()
