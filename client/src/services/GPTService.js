class GPTService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async analyzeMessage(message) {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are a slides editor assistant. Analyze the following message and determine the appropriate operation. 
                       Valid operations are: addSlide, addTitleText, addBodyText, deleteSlide, updateSlide.
                       Return only a JSON object with 'operation' and 'parameters' fields.`,
              },
              {
                role: "user",
                content: message,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("Error analyzing message with GPT:", error);
      throw error;
    }
  }
}

export default GPTService;
