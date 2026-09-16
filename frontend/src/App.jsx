import { useState } from "react";
import axios from "axios";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import ScoreCard from "./components/ScoreCard";
import ResultsList from "./components/ResultsList";
import ImprovedResume from "./components/ImprovedResume";
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [result, setResult] = useState(null);
  const [improvedText, setImprovedText] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);

  const handleAnalyze = async (file) => {
    setLoading(true);
    setResult(null);
    setImprovedText(null);
    setOriginalFile(file);

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
    setOriginalFile(null);
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
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" strokeWidth={2} />
          <p className="text-gray-700 text-lg">Analyzing your resume...</p>
          <p className="text-gray-500 text-sm mt-2">This takes 5–15 seconds</p>
        </div>
      )}

      {/* Results view */}
      {result && (
        <div className="max-w-5xl mx-auto px-6 py-12 fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Results</h1>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              Analyze Another
            </button>
          </div>

          {/* TOP ROW: Score + Improve CTA */}
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <ScoreCard score={result.score} />

            {/* Improve CTA */}
            {!improvedText ? (
              <div className="rounded-3xl p-8 shadow-md flex flex-col items-center justify-center text-center text-white bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-white/5" />

                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-6 h-6" strokeWidth={2.5} />
                    <p className="text-xl font-bold">Want to score 100/100?</p>
                  </div>
                  <p className="text-sm opacity-90 mb-5 max-w-xs">
                    Let AI rewrite your resume addressing every weakness
                  </p>
                  <button
                    onClick={handleImprove}
                    disabled={improving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-purple-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50 text-sm shadow-lg"
                  >
                    <Sparkles
                      className={`w-4 h-4 ${improving ? "animate-spin" : ""}`}
                      strokeWidth={2.5}
                    />
                    {improving ? "Rewriting..." : "Improve My Resume with AI"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl p-8 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-10 h-10 mb-3" strokeWidth={2.5} />
                <p className="text-xl font-bold mb-2">Resume Improved!</p>
                <p className="text-sm opacity-90">
                  Scroll down to download it
                </p>
              </div>
            )}
          </div>

          {/* ANALYSIS CARDS HEADING */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Analysis Cards
          </h2>

          {/* MIDDLE ROW: Strengths + Weaknesses side by side */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <ResultsList
              title="Strengths"
              items={result.strengths}
              color="text-green-600"
              icon={CheckCircle2}
              badge={`+${result.strengths?.length || 0} insights`}
              badgeColor="bg-green-50 text-green-700"
            />
            <ResultsList
              title="Weaknesses"
              items={result.weaknesses}
              color="text-yellow-600"
              icon={AlertTriangle}
              badge="Needs improvement"
              badgeColor="bg-yellow-50 text-yellow-700"
            />
          </div>

          {/* BOTTOM ROW: Suggestions full-width */}
          <ResultsList
            title="Suggestions"
            items={result.suggestions}
            color="text-purple-600"
            icon={Lightbulb}
            badgeColor="bg-purple-50 text-purple-700"
          />

          {/* Improved resume */}
          {improvedText && (
            <div className="mt-8">
              <ImprovedResume
                improvedText={improvedText}
                originalFile={originalFile}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}