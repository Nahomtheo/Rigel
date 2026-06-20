import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the page you're looking for.</p>

        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-4 py-2 rounded bg-[#C9A227] text-black font-medium">
            Go home
          </Link>

          <Link href="/search" className="px-4 py-2 rounded border border-gray-200">
            Search listings
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-400">If you think this is an error, please report it.</div>
      </div>
    </div>
  );
}
