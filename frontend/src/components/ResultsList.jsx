export default function ResultsList({ title, items, color }) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h2 className={`text-xl font-semibold mb-3 ${color}`}>{title}</h2>
      <ul className="list-disc pl-6 text-gray-300 space-y-1">
        {items?.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}