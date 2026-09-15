import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ImprovedResume({ improvedText }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Could not copy to clipboard.");
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API_URL}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ improved_text: improvedText }),
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "improved_resume.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download resume. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-emerald-600">
          🚀 Improved Resume (100/100)
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium text-white transition disabled:opacity-50"
          >
            {downloading ? "Preparing..." : "⬇ Download DOCX"}
          </button>
        </div>
      </div>

      {/* Resume content */}
      <div className="bg-gray-50 rounded-xl p-5 max-h-[600px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
          {improvedText}
        </pre>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        ✨ Rewritten by AI to address all weaknesses and suggestions
      </p>
    </div>
  );
}