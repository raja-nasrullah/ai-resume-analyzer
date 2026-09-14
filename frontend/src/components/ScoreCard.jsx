export default function ScoreCard({ score }) {
  const color =
    score >= 80
      ? "text-green-400"
      : score >= 60
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
      <p className="text-gray-400 text-sm mb-2">Overall Score</p>
      <p className={`text-6xl font-bold ${color}`}>{score}</p>
      <p className="text-gray-400 text-sm mt-1">out of 100</p>
    </div>
  );
}