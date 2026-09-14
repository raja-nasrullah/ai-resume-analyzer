export default function ScoreCard({ score }) {
  const color =
    score >= 80
      ? "text-green-500"
      : score >= 60
      ? "text-yellow-500"
      : "text-red-500";

  const ringColor =
    score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-10 text-center shadow-xl">
      <p className="text-gray-500 text-sm uppercase tracking-wider mb-6">
        Overall Score
      </p>

      <div className="relative w-40 h-40 mx-auto">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke="#f3f4f6"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke={ringColor}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={`text-5xl font-bold ${color}`}>{score}</p>
        </div>
      </div>

      <p className="text-gray-400 text-sm mt-4">out of 100</p>
    </div>
  );
}