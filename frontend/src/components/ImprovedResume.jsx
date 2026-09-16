import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ImprovedResume({ improvedText, originalFile }) {
  const [downloading, setDownloading] = useState(null);

  const isDocx = originalFile?.name?.toLowerCase().endsWith(".docx");

  const download = async (format) => {
    setDownloading(format);
    try {
      let response;

      // DOCX + original was DOCX → in-place edit (same design)
      if (format === "docx" && isDocx) {
        const formData = new FormData();
        formData.append("file", originalFile);
        formData.append("improved_text", improvedText);

        response = await fetch(`${API_URL}/api/download-improved-original`, {
          method: "POST",
          body: formData,
        });
      } else {
        // PDF or original was PDF → template-based download
        const endpoint = format === "pdf" ? "/api/download-pdf" : "/api/download";
        response = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ improved_text: improvedText }),
        });
      }

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `improved_resume.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-10 shadow-md text-center">
      {/* Success icon */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Your resume is ready!
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        {isDocx
          ? "Same design · Improved text"
          : "Clean template · Improved text"}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {/* DOCX download — in-place if original was DOCX */}
        <button
          onClick={() => download("docx")}
          disabled={downloading !== null}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 transition disabled:opacity-50"
        >
          {downloading === "docx" ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              {isDocx ? "Download DOCX (same design)" : "Download DOCX"}
            </>
          )}
        </button>

        {/* PDF download — always available */}
        <button
          onClick={() => download("pdf")}
          disabled={downloading !== null}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-rose-500/30 transition disabled:opacity-50"
        >
          {downloading === "pdf" ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-5">
        {isDocx
          ? "📄 Your original design preserved · Only the text changed"
          : "📄 Clean professional template · Text improved by AI"}
      </p>
    </div>
  );
}