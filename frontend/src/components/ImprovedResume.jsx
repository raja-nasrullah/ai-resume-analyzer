import { useState } from "react";
import { CheckCircle2, Download } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ImprovedResume({ improvedText, originalFile }) {
  const [downloading, setDownloading] = useState(false);

  const isDocx = originalFile?.name?.toLowerCase().endsWith(".docx");

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let response;

      // If original was DOCX → in-place edit (same design)
      if (isDocx) {
        const formData = new FormData();
        formData.append("file", originalFile);
        formData.append("improved_text", improvedText);

        response = await fetch(`${API_URL}/api/download-improved-original`, {
          method: "POST",
          body: formData,
        });
      } else {
        // Fallback: template-based DOCX
        response = await fetch(`${API_URL}/api/download`, {
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
      a.download = "improved_resume.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-10 shadow-md text-center">
      {/* Success icon */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Your resume is ready!
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        {isDocx
          ? "Same design · Improved text"
          : "Clean template · Improved text"}
      </p>

      {/* Single download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition disabled:opacity-50"
      >
        {downloading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" strokeWidth={2.5} />
            Download Resume
          </>
        )}
      </button>
    </div>
  );
}