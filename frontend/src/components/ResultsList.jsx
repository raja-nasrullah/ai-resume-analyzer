export default function ResultsList({ title, items, color, icon: Icon, badge, badgeColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${badgeColor || "bg-gray-50"}`}>
              <Icon className={`w-4 h-4 ${color}`} strokeWidth={2.5} />
            </div>
          )}
          <h2 className={`text-base font-semibold ${color}`}>{title}</h2>
        </div>
        {badge && (
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {items?.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
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