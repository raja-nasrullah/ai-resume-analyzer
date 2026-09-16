export default function TrustBar() {
  return (
    <section className="border-t border-gray-200/60 py-12">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-8">
          Trusted by professionals at
        </p>

        <div className="flex flex-wrap justify-center items-center gap-14 md:gap-20 opacity-70">
          {/* Apple */}
          <div className="flex items-center gap-2.5 text-gray-700 hover:opacity-100 transition-opacity duration-300">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.05 12.536c-.027-2.732 2.23-4.04 2.33-4.105-1.27-1.858-3.246-2.114-3.948-2.14-1.68-.17-3.282.985-4.13.985-.85 0-2.164-.96-3.56-.933-1.83.027-3.52 1.062-4.462 2.7-1.9 3.302-.484 8.18 1.365 10.855.905 1.312 1.982 2.782 3.4 2.73 1.365-.055 1.88-.885 3.53-.885 1.65 0 2.11.885 3.55.855 1.47-.025 2.4-1.33 3.3-2.65 1.04-1.522 1.47-3 1.49-3.078-.033-.015-2.86-1.1-2.89-4.34zM14.4 4.598c.75-.91 1.257-2.173 1.12-3.435-1.083.044-2.393.72-3.165 1.63-.7.81-1.31 2.1-1.145 3.34 1.21.093 2.44-.613 3.19-1.535z" />
            </svg>
            <span className="text-xl font-semibold tracking-tight">Apple</span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center gap-2.5 text-gray-700 hover:opacity-100 transition-opacity duration-300">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 3h8.5v8.5H3V3zm9.5 0H21v8.5h-8.5V3zM3 12.5h8.5V21H3v-8.5zm9.5 0H21V21h-8.5v-8.5z" />
            </svg>
            <span className="text-xl font-semibold tracking-tight">Microsoft</span>
          </div>

          {/* Corporate / Generic */}
          <div className="flex items-center gap-2.5 text-gray-700 hover:opacity-100 transition-opacity duration-300">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 21V9l9-6 9 6v12h-6v-7h-6v7H3z" />
            </svg>
            <span className="text-xl font-semibold tracking-tight">Corporate</span>
          </div>
        </div>
      </div>
    </section>
  );
}