import UploadBox from "./UploadBox";

export default function Hero({ onAnalyze, loading }) {
  return (
    <section className="max-w-7xl mx-auto px-8 pt-12 pb-20 grid lg:grid-cols-2 gap-16 items-center">
      {/* Logo top */}
      <div className="lg:col-span-2 flex justify-center lg:justify-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <span className="font-bold text-gray-900 text-lg">ResuScore AI</span>
        </div>
      </div>

      {/* Left — Headline */}
      <div className="fade-in-up">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Instantss AI Feedback
          <br />
          on Your Resume.
        </h1>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
          Upload your resume to get an AI score out of 100, find key
          strengths, uncover weaknesses, and get actionable suggestions.
        </p>

        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-800 text-sm font-medium">
            📊 Score out of 100
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            ✨ Find Strengths
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
            ⚠️ Reveal Weaknesses
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
            💡 Tailored Suggestions
          </span>
        </div>
      </div>

      {/* Right — Upload card */}
      <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
        <UploadBox onAnalyze={onAnalyze} loading={loading} />
      </div>
    </section>
  );
}