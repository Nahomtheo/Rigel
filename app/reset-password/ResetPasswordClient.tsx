"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordClient({ token }: { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        router.push("/login?message=Password reset successful");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border">

        <h2 className="text-xl font-bold mb-6">Reset Password</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New password"
            className="w-full border p-3 rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full border p-3 rounded-lg"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            disabled={loading || !token}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>
      </div>
    </div>
  );
}