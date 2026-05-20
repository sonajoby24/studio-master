
"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  async function sendMessage() {

    if (!message.trim()) return;

    setLoading(true);

    try {

      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
            history: messages,
          }),
        }
      );

      const data = await response.json();

      setMessages((prev) => [
        ...prev,

        {
          role: "user",
          content: message,
        },

        {
          role: "assistant",
          content: data.response,
        },
      ]);

      setMessage("");

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  return (

    <div className="min-h-screen bg-black text-white p-8">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-4">
          ShopStream Enterprise AI
        </h1>

        <p className="text-zinc-400 mb-8">
          Conversational Procurement Assistant 
        </p>

        {/* CHAT */}

        <div className="space-y-6 mb-8">

          {messages.length === 0 && (

            <div className="text-zinc-500 space-y-3 mb-10">

              <p>
                Which vendor gives cheapest laptops?
              </p>

              <p>
                Compare top monitor suppliers
              </p>

              <p>
                Show pending procurement orders
              </p>

              <p>
                Which quote is best under 5 lakh?
              </p>

            </div>

          )}

          {messages.map((msg, index) => (

            <div
              key={index}
              className={
                msg.role === "user"
                  ? "bg-blue-700 p-5 rounded-2xl ml-20"
                  : "bg-slate-800 p-5 rounded-2xl mr-20 whitespace-pre-wrap"
              }
            >

              <h2 className="font-bold text-xl mb-2">

                {msg.role === "user"
                  ? "You"
                  : "ShopStream AI"}

              </h2>

              <p>{msg.content}</p>

            </div>

          ))}

          {loading && (

            <div className="bg-slate-800 p-5 rounded-2xl mr-20">

              Thinking...

            </div>

          )}

        </div>

        {/* INPUT */}

        <div className="bg-slate-900 p-4 rounded-2xl flex gap-4">

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Ask procurement questions..."
            className="flex-1 h-24 rounded-xl p-4 text-black"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 px-6 py-3 rounded-xl h-fit"
          >

            {loading
              ? "Thinking..."
              : "Send"}

          </button>

        </div>

      </div>

    </div>

  );
}
