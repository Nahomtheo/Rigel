import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-black">
          Back to admin
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-950">Reports</h1>
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-600">No report queue has been connected yet.</p>
        </div>
      </div>
    </div>
  );
}
