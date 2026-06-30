import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Button } from "../Components/common";

function AIChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const question = input.trim();
    const newMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setSending(true);

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/ai-chat/",
        { question },
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

      let errorMessage = "Something went wrong";

      if (err.response) {
        errorMessage =
          err.response.data?.error ||
          err.response.data?.detail ||
          "Server error";
      } else if (err.request) {
        errorMessage = "Server not responding";
      } else {
        errorMessage = err.message;
      }

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: errorMessage },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header
          title="AI Chat Assistant"
          subtitle="Ask questions and get contextual HR assistance."
        />

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="h-[calc(100vh-12rem)] min-h-[520px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto bg-slate-50">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Start a conversation
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Ask about employees, policies, documents, or workflow
                      questions.
                    </p>
                  </div>
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
                    className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-lg shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-500 px-4 py-3 rounded-lg text-sm">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                  placeholder="Ask something..."
                />

                <Button onClick={sendMessage} loading={sending}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AIChatPage;
