// (same imports)
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../services/useAuth";
import axios from "axios";

function ChatPage() {
  const { user } = useAuth();

  // ================== REFS ==================
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ================== STATE ==================
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [chatMode, setChatMode] = useState("user");
  const [isListening, setIsListening] = useState(false);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // ================== VOICE SETUP ==================
  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);

      const female = v.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.includes("Zira") ||
          voice.name.includes("Samantha")
      );

      setSelectedVoice(female || v[0]);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    if (!text) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    speechSynthesis.speak(utterance);
  };

  // ================== VOICE INPUT ==================
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setInputMessage(transcript);
      setIsListening(false);

      sendToAgent(transcript); //  direct AI call
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  // ================== USERS ==================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("accessToken");

    const res = await axios.get("http://127.0.0.1:8000/api/employees/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(res.data.results || []);
  };

  // ================== CONVERSATION ==================
  useEffect(() => {
    if (selectedUser) {
      getOrCreateConversation(selectedUser.id);
    }
  }, [selectedUser]);

  const getOrCreateConversation = async (otherUserId) => {
    const token = localStorage.getItem("accessToken");

    const res = await axios.post(
      "http://127.0.0.1:8000/api/chat-conversations/",
      { user_id: otherUserId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setConversationId(res.data.conversation_id);
  };

  // ================== WEBSOCKET ==================
  useEffect(() => {
    if (!conversationId) return;

    socketRef.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${conversationId}/`
    );

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "typing") {
        setTypingUser(data.sender);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [conversationId]);

  // ================== AUTO SCROLL ==================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================== USER CHAT ==================
  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        message: inputMessage,
        sender: user.id,
      })
    );

    setInputMessage("");
  };

  // ================== AI CHAT ==================
  const sendToAgent = async (voiceText = null) => {
    const message = voiceText || inputMessage;

    if (!message.trim()) return;

    // user message
    setMessages((prev) => [...prev, { role: "user", text: message }]);

    const res = await axios.post("http://127.0.0.1:8000/api/ai-agent/", {
      input: message,
    });

    const aiReply = res.data.output;

    // AI message
    setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);

    speak(aiReply);

    setInputMessage("");
  };

  const handleTyping = () => {
    if (!socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        type: "typing",
        sender: user.id,
      })
    );
  };

  // ================== UI ==================
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* SIDEBAR */}
      <div className="w-1/4 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-slate-700">
          Chats
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                selectedUser?.id === u.id
                  ? "bg-blue-600/20"
                  : "hover:bg-slate-800"
              }`}
            >
              <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-full font-bold">
                {u.name?.charAt(0)}
              </div>

              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-xs text-slate-400">{u.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex flex-col flex-1">
        {/* HEADER */}
        <div className="flex items-center gap-3 p-4 bg-slate-900 border-b border-slate-700">
          {selectedUser ? (
            <>
              <div className="w-10 h-10 bg-green-600 flex items-center justify-center rounded-full font-bold">
                {selectedUser.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{selectedUser.name}</div>
                <div className="text-xs text-green-400">Online</div>
              </div>
            </>
          ) : (
            <div className="text-slate-400">Select a user</div>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.sender === user.id || msg.role === "user";

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-700 text-slate-100 rounded-bl-none"
                  }`}
                >
                  {msg.message || msg.text}
                </div>
              </div>
            );
          })}

          {typingUser && typingUser !== user.id && (
            <div className="text-sm italic text-slate-400">Typing...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        {selectedUser && (
          <div className="p-4 bg-slate-900 border-t border-slate-700 flex flex-col gap-3">
            {/* TOP CONTROLS */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* MODE SWITCH */}
              <div className="flex gap-2">
                <button
                  onClick={() => setChatMode("user")}
                  className={`px-4 py-1 rounded-full text-sm ${
                    chatMode === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700"
                  }`}
                >
                  User
                </button>

                <button
                  onClick={() => setChatMode("ai")}
                  className={`px-4 py-1 rounded-full text-sm ${
                    chatMode === "ai"
                      ? "bg-green-600 text-white"
                      : "bg-slate-700"
                  }`}
                >
                  AI Assistant
                </button>
              </div>

              {/* VOICE SELECT */}
              <select
                onChange={(e) => {
                  const voice = voices.find((v) => v.name === e.target.value);
                  setSelectedVoice(voice);
                }}
                className="bg-slate-800 border border-slate-600 px-2 py-1 rounded text-sm"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>

            {/* INPUT ROW */}
            <div className="flex items-center gap-3">
              {/* MIC */}
              <button
                onClick={startListening}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  isListening ? "bg-red-500" : "bg-green-600"
                } text-white shadow-md`}
              >
                mic
              </button>

              {/* INPUT */}
              <input
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  handleTyping();
                }}
                className="flex-1 bg-slate-800 border border-slate-600 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
              />

              {/* SEND */}
              <button
                onClick={() =>
                  chatMode === "ai" ? sendToAgent() : sendMessage()
                }
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-full shadow-lg"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PROFILE PANEL */}
      <div className="w-1/4 bg-slate-900 border-l border-slate-700 p-6">
        <div className="font-bold mb-4 text-lg">Profile</div>

        {selectedUser ? (
          <div className="space-y-4 text-center">
            <div className="w-20 h-20 bg-blue-600 flex items-center justify-center rounded-full text-2xl font-bold mx-auto">
              {selectedUser.name?.charAt(0)}
            </div>

            <div>
              <div className="text-lg font-semibold">{selectedUser.name}</div>
              <div className="text-sm text-slate-400">{selectedUser.email}</div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-center">Select a user</div>
        )}
      </div>
    </div>
  );
}
export default ChatPage;
