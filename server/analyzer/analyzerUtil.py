from sentence import Sentence
import matplotlib.pyplot as plt
from pipeline_queues import analyzer_queue

frequency = {}
times = []
paces = []
filler_count = {}

#Pipeline:
def main():
#Get from Queue and get sentence object.
    sentence = analyzer_queue.get()
#Extract sentence, and place into a global collection of most common used words (frequency map)
    for word, count in sentence.frequency.items():
        if word in frequency:
            frequency[word] += count
        else:
            frequency[word] = count

#Generate a timed graph of the words used per minute. Allows for a visual representation of the pace of the speaker.    
    update_graph(sentence)
#Determine the filler words
    filler_words = ['UM', 'UH', 'LIKE', 'YOU KNOW', 'SO', 'ACTUALLY', 'BASICALLY', 'SERIOUSLY']
    filler_count = {word: frequency.get(word, 0) for word in filler_words}
    print("Filler words count:", filler_count)
    print("Word frequency count:", frequency)
    plt.show()

#Util Functions.

def update_graph(sentence):
    if times:
        times.append(times[-1] + sentence.duration)
    else:
        times.append(sentence.duration)
    paces.append(sentence.pace)

    plt.clf()
    plt.plot(times, paces, marker='o')
    plt.xlabel('Time')
    plt.ylabel('Pace (words per minute)')
    plt.title('Pace of Speaker Over Time')
    plt.draw()
    plt.pause(0.01)

def get_summary():
    return frequency, filler_count, times, paces

if __name__ == "__main__":
    main()