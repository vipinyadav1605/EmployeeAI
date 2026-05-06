import React, { useState } from "react";
import axios from "axios";

function RAGPage() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const uploadFile = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/rag/upload_document/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("UPLOAD RESPONSE:", res.data);
      alert("Uploaded!");
    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data);
      alert("Upload failed");
    }
  };
  const askQuestion = async () => {
    try {
      if (!question || question.trim() === "") {
        alert("Please enter a question");
        return;
      }

      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/rag/query/",
        {
          question: question.trim(), //  ensure string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", //  ADD THIS
          },
        }
      );

      console.log("DATA:", res.data);
      setAnswer(res.data.answer);
    } catch (err) {
      console.log("ERROR:", err.response?.data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 space-y-6">
      {/* 🔹 Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-wide">
          RAG Document Assistant
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload documents and ask questions using AI
        </p>
      </div>

      {/* 🔹 Upload Section */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold">Upload Document</h2>

        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />

          <button
            onClick={uploadFile}
            className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-xl text-sm font-medium shadow-md"
          >
            Upload
          </button>
        </div>
      </div>

      {/* 🔹 Question Section */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold">Ask Question</h2>

        <div className="flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something from your document..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={askQuestion}
            className="bg-green-600 hover:bg-green-700 transition px-5 py-3 rounded-xl text-sm font-medium shadow-md"
          >
            Ask
          </button>
        </div>
      </div>

      {/* 🔹 Answer Section */}
      {answer && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-3">AI Answer</h2>

          <div className="bg-slate-800 p-4 rounded-xl text-sm leading-relaxed text-slate-200">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}

export default RAGPage;
