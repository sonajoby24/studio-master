"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import ProcurementDashboard from "./ProcurementDashboard";

interface Message {
  role: "user" | "assistant";
  content?: string;
  type?: "text" | "report";
  reportData?: any;
}

export default function ChatUI() {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);

    setInput("");

    setLoading(true);

    try {
      const quoteMatch =
        input.match(/0Q0[a-zA-Z0-9]+/);

      const quoteNumberMatch =
        input.match(/\b\d{6,}\b/);

      const wantsReport =
        input
          .toLowerCase()
          .includes("generate report");

      if (
        wantsReport &&
        (quoteMatch || quoteNumberMatch)
      ) {
        const quoteId =
        quoteMatch ? quoteMatch [0] : "";

const quoteNumberMatch =
  input.match(/\b\d{6,}\b/);

const quoteNumber =
  quoteNumberMatch
    ? quoteNumberMatch[0]
    : "";

        const reportResponse =
          await fetch(
            "/api/report",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                quoteId,
                quoteNumber,
              }),
            }
          );

        const reportData =
          await reportResponse.json();

        if (
          reportData.success
        ) {
          setMessages([
            ...updatedMessages,
            {
              role: "assistant",
              type: "report",
              reportData:
                reportData.report,
              content: `
# Report Generated

Quote ID: ${quoteId}

✅ Total Products: ${reportData.report.totalProducts}

✅ Total Amount: $${reportData.report.totalAmount}

Dashboard Updated Successfully.
              `,
            },
          ]);

          return;
        }

        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content:
              reportData.message ||
              "Quote not found.",
          },
        ]);

        return;
      }

      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message: input,
              history: messages,
            }),
          }
        );

      const data =
        await response.json();

      const safeContent =
        typeof data.response ===
        "object"
          ? JSON.stringify(
              data.response,
              null,
              2
            )
          : String(
              data.response
            );

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            safeContent,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map(
          (
            msg,
            index
          ) => (
            <div
              key={index}
              className={`${
                msg.role ===
                "user"
                  ? "bg-blue-600 ml-auto max-w-5xl p-4 rounded-xl"
                  : "bg-zinc-900 p-4 rounded-xl"
              }`}
            >
              <ReactMarkdown>
                {msg.content || ""}
              </ReactMarkdown>

              {msg.type ===
                "report" &&
                msg.reportData && (
                  <div className="mt-6">
                    <ProcurementDashboard
                      reportData={
                        msg.reportData
                      }
                    />
                  </div>
                )}
            </div>
          )
        )}

        {loading && (
          <div className="bg-zinc-800 p-4 rounded-xl w-fit">
            Thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-800 p-4 flex gap-2">

        <input
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key ===
              "Enter"
            ) {
              sendMessage();
            }
          }}
          placeholder="Ask procurement questions..."
          className="flex-1 bg-zinc-900 p-3 rounded-xl outline-none"
        />

        <button
          onClick={
            sendMessage
          }
          disabled={
            loading
          }
          className="bg-blue-600 px-5 rounded-xl"
        >
          {loading
            ? "Thinking..."
            : "Send"}
        </button>

      </div>

    </div>
  );
}