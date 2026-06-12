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
    let databaseData =
      await retrieveRelevantData(userMessage);

    const conversationHistory =
      formatConversationHistory(history);

    const databaseString =
      JSON.stringify(
        databaseData,
        null,
        2
      );

    console.log(
      "DATABASE SENT TO AI:",
      databaseString
    );

    const completion =
      await client.chat.completions.create({

        model: "openai/gpt-3.5-turbo",

        max_tokens: 300,

        messages: [

          {
            role: "system",
            content: SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: `
DATABASE:
${databaseString}

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

  } catch (error: any) {

    console.error(error);

    if (error?.status === 402) {

      return `
AI service quota exceeded.

The Firebase data is available and working correctly.

The AI provider (OpenRouter) rejected the request due to token/credit limits.

Please try again later or reduce the amount of data being queried.
`;

    }

    return "AI agent failed.";
  }
}