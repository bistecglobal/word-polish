import axios from "axios";

export class OpenAiApi {
  private apikey: string;
  constructor(apiKey) {
    this.apikey = "pk-kUqYQxuNRXJCBnuCQHBmxZTnryRrohmQrjnRTkVmTZAzZTuX" || apiKey;
  }
  // Asynchronous function to generate text from the OpenAI API
  async generateText(prompt, model = "gpt-3.5-turbo", max_tokens = 100) {
    // Send a request to the OpenAI API to generate text
    try {
      const data = {
        model,
        max_tokens,
        messages: [
          {
            role: "system",
            content: "You are an helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      };
      const response = await axios.post("https://api.pawan.krd/v1/completions", data, {
        headers: { Authorization: "Bearer " + this.apikey, "Content-Type": "application/json" },
      });
      return response.data.choices[0].message.content;
    } catch (e) {
      return JSON.stringify(e);
    }
  }
}
