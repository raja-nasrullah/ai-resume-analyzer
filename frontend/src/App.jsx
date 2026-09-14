import { useState } from "react";
import axios from "axios";
import UploadBox from "./components/UploadBox";
import ScoreCard from "./components/ScoreCard";
import ResultsList from "./components/ResultsList";

// Use env variable for production, fallback to localhost for dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (file) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Something went wrong. Please try again.";
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          AI Resume Analyzer
        </h1>
        <p className="text-gray-400 text-lg">
          Upload your resume and get instant AI feedback
        </p>
      </header>

      <UploadBox onAnalyze={handleAnalyze} loading={loading} />

      {loading && (
        <p className="text-center text-indigo-400 mt-8 animate-pulse">
          🤖 Analyzing your resume...
        </p>
      )}

      {result && (
        <div className="max-w-2xl mx-auto mt-10 space-y-5">
          <ScoreCard score={result.score} />
          <ResultsList
            title="✅ Strengths"
            items={result.strengths}
            color="text-green-400"
          />
          <ResultsList
            title="⚠️ Weaknesses"
            items={result.weaknesses}
            color="text-yellow-400"
          />
          <ResultsList
            title="💡 Suggestions"
            items={result.suggestions}
            color="text-indigo-400"
          />
        </div>
      )}

      <footer className="text-center text-gray-600 text-sm mt-16">
        Built with React + FastAPI
      </footer>
    </div>
  );
}