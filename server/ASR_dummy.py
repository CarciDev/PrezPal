import time
import threading
import asyncio
from moonshineBufferedQueue import data_queue


def data_generator():
    """Simulates real-time data generation."""
    loop = asyncio.new_event_loop()  # Create a new asyncio event loop
    asyncio.set_event_loop(loop)  # Set the loop for this thread

    while True:
        time.sleep(1)  # Simulate delay
        data = f"Data at {time.time()}"
        print(f"Generated: {data}")

        # Run the coroutine in this thread's event loop
        loop.run_until_complete(data_queue.put(data))


# Start data generation in a separate thread
threading.Thread(target=data_generator, daemon=True).start()
