import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../App";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Button } from "../Components/common";

function ChatPage() {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSocketReady, setIsSocketReady] = useState(false);

  const selectedInitial = selectedUser?.name?.charAt(0)?.toUpperCase() || "?";

  const filteredUsers = useMemo(
    () => users.filter((item) => item.id !== user?.id),
    [users, user?.id]
  );

  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return;

      const nextVoices = window.speechSynthesis.getVoices();
      setVoices(nextVoices);

      const preferredVoice = nextVoices.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.includes("Zira") ||
          voice.name.includes("Samantha")
      );

      setSelectedVoice(preferredVoice || nextVoices[0] || null);
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setMessages([]);
      setTypingUser(null);
      getOrCreateConversation(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!conversationId) return undefined;

    setIsSocketReady(false);
    socketRef.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${conversationId}/`
    );

    socketRef.current.onopen = () => {
      setIsSocketReady(true);
      setStatusMessage("");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "typing") {
        setTypingUser(data.sender);
        window.setTimeout(() => setTypingUser(null), 1600);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    socketRef.current.onerror = () => {
      setStatusMessage("Chat connection failed. Please try again.");
      setIsSocketReady(false);
    };

    socketRef.current.onclose = () => {
      setIsSocketReady(false);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      setLoadingUsers(true);

      const res = await axios.get("http://127.0.0.1:8000/api/employees/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.results || []);
    } catch (err) {
      console.error(err);
      setStatusMessage("Unable to load employees for chat.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const getOrCreateConversation = async (otherUserId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/chat-conversations/",
        { user_id: otherUserId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setConversationId(res.data.conversation_id);
    } catch (err) {
      console.error(err);
      setStatusMessage("Unable to open this conversation.");
    }
  };

  const speak = (text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage("Speech recognition is not supported in this browser.");
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
      sendToAgent(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatusMessage("Voice input stopped before a message was captured.");
    };
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setStatusMessage("Chat is still connecting. Please try again.");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        message: inputMessage.trim(),
        sender: user.id,
      })
    );

    setInputMessage("");
    setStatusMessage("");
  };

  const sendToAgent = async (voiceText = null) => {
    const message = (voiceText || inputMessage).trim();

    if (!message) return;

    setSending(true);
    setStatusMessage("");
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInputMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/ai-agent/", {
        input: message,
      });

      const aiReply = res.data.output;
      setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
      speak(aiReply);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "AI assistant is not available right now." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "typing",
        sender: user.id,
      })
    );
  };

  const handleSend = () => {
    if (chatMode === "ai") {
      sendToAgent();
    } else {
      sendMessage();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header
          title="Team Chat"
          subtitle="Message teammates directly or switch to the AI assistant."
        />

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {statusMessage && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {statusMessage}
            </div>
          )}

          <div className="grid min-h-[calc(100vh-12rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[300px_1fr_280px]">
            <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
              <div className="border-b border-slate-100 px-4 py-4">
                <h2 className="font-semibold text-slate-950">Conversations</h2>
                <p className="text-xs text-slate-500">
                  {filteredUsers.length} available contacts
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto lg:max-h-none">
                {loadingUsers ? (
                  <div className="p-4 text-sm text-slate-500">
                    Loading people...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">
                    No employees are available for chat.
                  </div>
                ) : (
                  filteredUsers.map((item) => {
                    const active = selectedUser?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedUser(item)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                          active
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            active
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-950">
                            {item.name || "Unnamed employee"}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {item.email}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="flex min-h-[560px] flex-col bg-slate-50">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
                {selectedUser ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {selectedInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-950">
                        {selectedUser.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isSocketReady ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        ></span>
                        {chatMode === "ai"
                          ? "AI assistant mode"
                          : isSocketReady
                          ? "Connected"
                          : "Connecting"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-slate-950">
                      Select a conversation
                    </div>
                    <div className="text-xs text-slate-500">
                      Choose a person from the left panel.
                    </div>
                  </div>
                )}

                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    onClick={() => setChatMode("user")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      chatMode === "user"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => setChatMode("ai")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      chatMode === "ai"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    AI
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {!selectedUser ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div>
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-700">
                        CH
                      </div>
                      <h3 className="font-semibold text-slate-950">
                        Your messages will appear here
                      </h3>
                      <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Select a teammate to open a direct chat, then switch to
                        AI mode whenever you need assistant help.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isMe = msg.sender === user.id || msg.role === "user";
                      const isAi = msg.role === "ai";
                      const body = msg.message || msg.text;

                      return (
                        <div
                          key={`${index}-${body}`}
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[70%] ${
                              isMe
                                ? "bg-blue-600 text-white"
                                : isAi
                                ? "border border-violet-100 bg-violet-50 text-violet-950"
                                : "border border-slate-200 bg-white text-slate-800"
                            }`}
                          >
                            {body}
                          </div>
                        </div>
                      );
                    })}

                    {typingUser && typingUser !== user.id && (
                      <div className="text-sm italic text-slate-500">
                        Typing...
                      </div>
                    )}

                    {sending && (
                      <div className="flex justify-start">
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                          Assistant is thinking...
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={startListening}
                    className={`rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm ${
                      isListening ? "bg-red-600" : "bg-emerald-600"
                    }`}
                  >
                    {isListening ? "Listening..." : "Voice"}
                  </button>

                  <select
                    value={selectedVoice?.name || ""}
                    onChange={(event) => {
                      const voice = voices.find(
                        (item) => item.name === event.target.value
                      );
                      setSelectedVoice(voice || null);
                    }}
                    className="max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {voices.length === 0 ? (
                      <option value="">Default voice</option>
                    ) : (
                      voices.map((voice, index) => (
                        <option key={`${voice.name}-${index}`} value={voice.name}>
                          {voice.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    value={inputMessage}
                    onChange={(event) => {
                      setInputMessage(event.target.value);
                      handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={!selectedUser}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                    placeholder={
                      selectedUser
                        ? chatMode === "ai"
                          ? "Ask the AI assistant..."
                          : "Type a message..."
                        : "Select a conversation first"
                    }
                  />

                  <Button
                    onClick={handleSend}
                    loading={sending}
                    disabled={!selectedUser || !inputMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </section>

            <aside className="hidden border-l border-slate-200 bg-white p-5 lg:block">
              <h2 className="font-semibold text-slate-950">Profile</h2>

              {selectedUser ? (
                <div className="mt-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                    {selectedInitial}
                  </div>

                  <div className="mt-4">
                    <div className="text-lg font-semibold text-slate-950">
                      {selectedUser.name}
                    </div>
                    <div className="break-words text-sm text-slate-500">
                      {selectedUser.email}
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Conversation
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {conversationId
                        ? `Conversation #${conversationId}`
                        : "Opening conversation..."}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                  Select a user to view profile details.
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
