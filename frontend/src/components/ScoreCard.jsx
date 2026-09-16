export default function ScoreCard({ score }) {
  const getLabel = (s) => {
    if (s >= 90) return { text: "Excellent", color: "text-emerald-500", bg: "bg-emerald-50", ring: "#22c55e" };
    if (s >= 75) return { text: "Good", color: "text-yellow-500", bg: "bg-yellow-50", ring: "#eab308" };
    if (s >= 60) return { text: "Fair", color: "text-orange-500", bg: "bg-orange-50", ring: "#f97316" };
    return { text: "Needs Work", color: "text-red-500", bg: "bg-red-50", ring: "#ef4444" };
  };

  const { text, color, bg, ring } = getLabel(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center h-full">
      <div className="relative w-36 h-36">
        <svg className="transform -rotate-90 w-36 h-36">
          <circle cx="72" cy="72" r="52" stroke="#f3f4f6" strokeWidth="10" fill="none" />
          <circle
            cx="72"
            cy="72"
            r="52"
            stroke={ring}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={`text-4xl font-bold ${color}`}>{score}</p>
        </div>
      </div>

      {/* Badge */}
      <span className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
        ● {text}
      </span>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Solid foundation with room to improve
      </p>
    </div>
  );
}