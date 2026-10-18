import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <span className="text-2xl">🩺</span>
          <span className="text-lg font-bold text-primary-400">
            HealthSync <span className="text-white">AI</span>
          </span>
        </Link>
        <p className="text-gray-500 text-sm mb-1">
          Powered by Google Gemini · Built with Next.js & Flask
        </p>
        <p className="text-gray-600 text-xs">
          ⚕️ For informational purposes only. Always consult a qualified healthcare professional.
        </p>
        <div className="flex items-center justify-center gap-6 mt-5 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} HealthSync AI</span>
          <span>·</span>
          <span>Privacy First · Your data stays local</span>
        </div>
      </div>
    </footer>
  );
}
