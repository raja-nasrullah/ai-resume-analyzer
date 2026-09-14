export default function ResultsList({ title, items, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
      <h2 className={`text-lg font-semibold mb-4 ${color}`}>{title}</h2>
      <ul className="space-y-2">
        {items?.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-gray-700 text-sm"
          >
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full ${color.replace(
                "text-",
                "bg-"
              )} flex-shrink-0`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}