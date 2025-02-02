class Sentence:
    _id_counter = 0  # Class variable to keep track of the order of instances

    def __init__(self, text, duration):
        self.id = Sentence._id_counter  
        Sentence._id_counter += 1 

        self.text = text.upper()
        self.duration = duration
        self.calculatePace()
        self.calculateFrequency()

    def calculatePace(self):
        self.words = self.text.split()
        nbr_words = len(self.words)
        self.pace = self.duration / nbr_words

    def calculateFrequency(self):
        self.frequency = {}
        for word in self.words:
            if word in self.frequency:
                self.frequency[word] += 1
            else:
                self.frequency[word] = 1

    def __repr__(self):
        return f"Sentence(id={self.id}, text={self.text}, duration={self.duration}, pace={self.pace}, frequency={self.frequency})"