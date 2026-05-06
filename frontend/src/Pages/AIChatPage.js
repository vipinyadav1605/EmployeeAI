import React, { useState } from "react";
import axios from "axios";

function AIChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  //   const token = localStorage.getItem("accessToken");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/ai-chat/",
        { question: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      console.log("ERROR:", err);

      // Extract proper error message
      let errorMessage = "Something went wrong";

      if (err.response) {
        // Backend responded with error
        errorMessage =
          err.response.data?.error ||
          err.response.data?.detail ||
          "Server error";
      } else if (err.request) {
        // No response from server
        errorMessage = "Server not responding";
      } else {
        // Other error
        errorMessage = err.message;
      }

      // Show error in chat UI
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: ` ${errorMessage}` },
      ]);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 text-lg font-semibold tracking-wide">
        AI Chat Assistant
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            Start a conversation with AI...
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-700 text-slate-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            placeholder="Ask something..."
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 transition px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChatPage;
