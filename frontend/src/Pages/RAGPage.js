import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Button } from "../Components/common";

function RAGPage() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);

  const uploadFile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);
      setUploading(true);
      setStatus("");

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
      setStatus("Document uploaded successfully.");
    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data);
      setStatus("Upload failed. Please check the file and try again.");
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    try {
      if (!question || question.trim() === "") {
        setStatus("Please enter a question.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      setAsking(true);
      setStatus("");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/rag/query/",
        {
          question: question.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("DATA:", res.data);
      setAnswer(res.data.answer);
    } catch (err) {
      console.log("ERROR:", err.response?.data);
      setStatus("Unable to get an answer right now.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header
          title="RAG Document Assistant"
          subtitle="Upload documents and ask questions using AI."
        />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {status && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {status}
            </div>
          )}

          <Card title="Upload Document">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />

              <Button onClick={uploadFile} disabled={!file} loading={uploading}>
                Upload
              </Button>
            </div>
          </Card>

          <Card title="Ask Question">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something from your document..."
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <Button onClick={askQuestion} loading={asking}>
                Ask
              </Button>
            </div>
          </Card>

          {answer && (
            <Card title="AI Answer">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {answer}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default RAGPage;
