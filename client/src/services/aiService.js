import OpenAI from "openai";

const GPT_TOOLS = [
  {
    type: "function",
    function: {
      name: "updateTitle",
      description: "Update the content of the current slide's title",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the slide",
          },
          color: {
            type: "string",
            description: "The color of the title in hex format",
          },
        },
        required: ["title", "color"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "updateText",
      description: "Update the content of the current slide's text",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The main text content of the slide",
          },
          color: {
            type: "string",
            description: "The color of the text in hex format",
          },
        },
        required: ["text", "color"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "updateImage",
      description: "Set a new image on the current slide",
      parameters: {
        type: "object",
        properties: {
          photoQuery: {
            type: "string",
            description:
              "A query to search for the image to display on the slide, from a database of images",
          },
        },
        required: ["photoQuery"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

const aiRequest = async (instructions, context, handleToolCall) => {
  try {
    const client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    // First API call to get function call
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful presentation assistant. Generate appropriate slide content based on the current slide. Here is the request to service: ${instructions}`,
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
      tools: GPT_TOOLS,
    });

    const toolCalls = completion.choices[0].message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      Console.log("The LLM did not make any tool calls.");
      return;
    }

    for (const toolCall of toolCalls) {
      handleToolCall(toolCall);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    alert("Error generating content. Please check the console for details.");
  }
};

export { aiRequest };
