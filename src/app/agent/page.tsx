'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);

    setMessage('');

    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: messages,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
      };

      setMessages([
        ...updatedMessages,
        aiMessage,
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <div className="border-b border-zinc-800 p-6">

        <h1 className="text-3xl font-bold">
          ShopStream AI Procurement Assistant
        </h1>

        <p className="text-zinc-400 mt-2">
          Conversational AI powered by Firebase + Gemini
        </p>

      </div>

      <div className="flex-1 overflow-y-auto p-6">

        <div className="max-w-4xl mx-auto space-y-4">

          {messages.length === 0 && (
            <div className="text-zinc-500 text-center mt-20">

              <h2 className="text-2xl mb-4">
                Ask procurement questions naturally
              </h2>

              <div className="space-y-2">

                <p>
                  Which vendor gives cheapest laptops?
                </p>

                <p>
                  Compare top suppliers for monitors
                </p>

                <p>
                  Show pending orders
                </p>

                <p>
                  Which quote is best under 5 lakh?
                </p>

              </div>

            </div>
          )}

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >

              <div
                className={`max-w-[80%] rounded-2xl p-4 whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-zinc-800'
                }`}
              >
                {msg.content}
              </div>

            </div>

          ))}

          {loading && (

            <div className="flex justify-start">

              <div className="bg-zinc-800 rounded-2xl p-4">

                Thinking...

              </div>

            </div>

          )}

          <div ref={bottomRef} />

        </div>

      </div>

      <div className="border-t border-zinc-800 p-4">

        <div className="max-w-4xl mx-auto flex gap-4">

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask ShopStream AI..."
            className="flex-1 bg-zinc-900 rounded-2xl p-4 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 px-8 rounded-2xl"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}