import OpenAI from "openai";

export class OpenAiApi {
  private openAI: OpenAI;
  constructor(apiKey) {
    // Create the Configuration and OpenAIApi instances
    this.openAI = new OpenAI({
      apiKey, // defaults to process.env["OPENAI_API_KEY"]
    });
  }
  // Asynchronous function to generate text from the OpenAI API
  async generateText(prompt, model = "gpt-3.5-turbo", max_tokens = 500, temperature = 0.85) {
    // Send a request to the OpenAI API to generate text
    try {
      const response = await this.openAI.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens,
        n: 1,
        temperature,
      });
      return response.choices[0].message.content;
    } catch (e) {
      return JSON.stringify(e);
    }
  }
}
