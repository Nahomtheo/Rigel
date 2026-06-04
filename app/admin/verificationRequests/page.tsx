import Link from "next/link";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

type VerificationUser = {
  _id: { toString(): string };
  name?: string;
  email?: string;
};

export default async function VerificationRequestsPage() {
  await connectDB();

  const users = await User.find({ "verification.status": "pending" })
    .select("name email verification")
    .sort({ updatedAt: -1 })
    .lean<VerificationUser[]>();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-black">
            Back to admin
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-950">Verification Requests</h1>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <Link
              key={user._id.toString()}
              href={`/admin/manageUsers/${user._id.toString()}`}
              className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-400"
            >
              <p className="font-semibold text-gray-950">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </Link>
          ))}
          {users.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">No pending verification requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
