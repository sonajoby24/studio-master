export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function formatConversationHistory(
  history: ChatMessage[]
) {
  return history
    .map(
      (msg) => `${msg.role.toUpperCase()}: ${msg.content}`
    )
    .join("\n");
}