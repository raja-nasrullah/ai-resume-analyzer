import { useState } from "react";
import axios from "axios";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import ScoreCard from "./components/ScoreCard";
import ResultsList from "./components/ResultsList";
import ImprovedResume from "./components/ImprovedResume";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [result, setResult] = useState(null);
  const [improvedText, setImprovedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);

  const handleAnalyze = async (file) => {
    setLoading(true);
    setResult(null);
    setImprovedText(null);

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

  const handleImprove = async () => {
    if (!result?.resume_text) {
      alert("Resume text not available. Please analyze again.");
      return;
    }
    setImproving(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/improve`, {
        resume_text: result.resume_text,
        feedback: {
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
        },
      });
      setImprovedText(data.improved_text);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Could not improve resume. Please try again.";
      alert(`❌ ${msg}`);
    } finally {
      setImproving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setImprovedText(null);
  };

  return (
    <div className="pastel-bg">
      {/* Landing view */}
      {!result && !loading && (
        <>
          <Hero onAnalyze={handleAnalyze} loading={loading} />
          <TrustBar />
        </>
      )}

      {/* Loading state */}
      {loading && (
        <div className="max-w-2xl mx-auto px-8 py-20 text-center fade-in-up">
          <div className="inline-block w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-gray-700 text-lg">🤖 Analyzing your resume...</p>
          <p className="text-gray-500 text-sm mt-2">
            This takes 5–15 seconds
          </p>
        </div>
      )}

      {/* Results view */}
      {result && (
        <div className="max-w-3xl mx-auto px-8 py-12 space-y-5 fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Results</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              ← Analyze Another
            </button>
          </div>

          <ScoreCard score={result.score} />

          {/* Improve button */}
          {!improvedText && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white text-center shadow-lg">
              <p className="text-lg font-semibold mb-1">
                🎯 Want to score 100/100?
              </p>
              <p className="text-sm opacity-90 mb-4">
                Let AI rewrite your resume addressing every weakness
              </p>
              <button
                onClick={handleImprove}
                disabled={improving}
                className="px-6 py-2.5 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                {improving ? "✨ Rewriting..." : "✨ Improve My Resume"}
              </button>
            </div>
          )}

          <ResultsList
            title="✅ Strengths"
            items={result.strengths}
            color="text-green-600"
          />
          <ResultsList
            title="⚠️ Weaknesses"
            items={result.weaknesses}
            color="text-yellow-600"
          />
          <ResultsList
            title="💡 Suggestions"
            items={result.suggestions}
            color="text-indigo-600"
          />

          {/* Improved resume appears here */}
          {improvedText && <ImprovedResume improvedText={improvedText} />}
        </div>
      )}
    </div>
  );
}