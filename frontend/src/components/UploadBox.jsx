import { useState } from "react";

export default function UploadBox({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    const ok = f.name.endsWith(".pdf") || f.name.endsWith(".docx");
    if (!ok) return alert("Only PDF or DOCX files are allowed");
    setFile(f);
  };

  return (
    <div className="relative">
      {/* Floating mini score card behind */}
      <div className="absolute -left-20 top-20 hidden lg:block w-48 bg-white rounded-2xl shadow-xl p-4 rotate-[-8deg]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-500 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-800">84</span>
          </div>
          <span className="text-xs text-gray-500">/100</span>
        </div>
        <div className="text-xs font-medium text-gray-700">Top Strengths</div>
        <div className="text-xs text-gray-400">(Technical Skills)</div>
        <div className="text-xs font-medium text-gray-700 mt-2">
          Suggestions
        </div>
        <div className="text-xs text-gray-400">(Quality Impact)</div>
      </div>

      {/* Main upload card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Upload &amp; Analyze
        </h3>

        {/* Drop zone */}
        <div
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput").click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gradient-to-b from-indigo-50/50 to-pink-50/50 hover:from-indigo-100/50 hover:to-pink-100/50 transition cursor-pointer"
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Upload icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center float-anim">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v12m0-12l-4 4m4-4l4 4M4 20h16"
              />
            </svg>
          </div>

          <p className="text-gray-900 font-semibold mb-1">
            {file ? `📄 ${file.name}` : "Drag and drop your resume here"}
          </p>
          <p className="text-sm text-gray-500">
            or click to{" "}
            <span className="text-indigo-600 font-medium">Browse files</span>
          </p>
          <p className="text-xs text-gray-400 mt-3">PDF, DOCX (up to 10MB)</p>
        </div>

        {/* Button */}
        <button
          onClick={() => file && onAnalyze(file)}
          disabled={!file || loading}
          className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Upload & Get My Score"}
        </button>

        {/* Trust line */}
        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-4">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          100% Private &amp; Free to Try
        </p>
      </div>
    </div>
  );
}