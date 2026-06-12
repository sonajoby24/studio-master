"use client";

import ChatUI from "@/components/ChatUI";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-5xl font-bold mb-4">
          ShopStream Enterprise AI
        </h1>

        <p className="text-zinc-400 mb-8">
          Conversational Procurement Assistant
        </p>

        <ChatUI />

      </div>

    </div>
  );
}