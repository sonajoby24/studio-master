import OpenAI from "openai";

import { SYSTEM_PROMPT } from "./prompts";

import { retrieveRelevantData } from "./retrieval";

import {
  ChatMessage,
  formatConversationHistory,
} from "./memory";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function runAgent(
  userMessage: string,
  history: ChatMessage[]
) {

  try {

    const databaseData =
      await retrieveRelevantData(userMessage);

    const conversationHistory =
      formatConversationHistory(history);

    const completion =
      await client.chat.completions.create({

        model: "openai/gpt-3.5-turbo",

        messages: [

          {
            role: "system",
            content: SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: `
DATABASE:
${JSON.stringify(databaseData, null, 2)}

CHAT HISTORY:
${conversationHistory}

USER QUESTION:
${userMessage}

Answer ONLY using database data.
`,
          },

        ],

      });

    return (
      completion.choices[0]
        ?.message?.content ||
      "No response generated."
    );

  } catch (error) {

    console.error(error);

    return "AI agent failed";
  }
}