import { useState } from "react";

export default function UploadBox({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    const ok = f.name.endsWith(".pdf") || f.name.endsWith(".docx");
    if (!ok) {
      alert("Only PDF or DOCX files are allowed");
      return;
    }
    setFile(f);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput").click()}
        className="border-2 border-dashed border-indigo-400 rounded-2xl p-10 text-center bg-white/5 hover:bg-white/10 transition cursor-pointer"
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <p className="text-white text-lg font-semibold">
          {file ? `📄 ${file.name}` : "Drag & drop your resume here"}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {file ? "Click to change file" : "or click to browse (PDF / DOCX)"}
        </p>
      </div>

      <button
        onClick={() => file && onAnalyze(file)}
        disabled={!file || loading}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </div>
  );
}