export default function TrustBar() {
  return (
    <section className="border-t border-gray-200/60 py-10">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-xs uppercase tracking-widest text-gray-500 mb-6">
          Trusted by professionals at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
          <span className="text-2xl font-bold text-gray-700">🍎 Apple</span>
          <span className="text-2xl font-bold text-gray-700">🪟 Microsoft</span>
          <span className="text-2xl font-bold text-gray-700">🏢 Corporate</span>
        </div>
      </div>
    </section>
  );
}