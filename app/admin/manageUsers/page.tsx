"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type AdminUser = {
  _id: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  isBanned?: boolean;
};

export default function UsersFilter() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [search, setSearch] = useState("");

  const [verified, setVerified] = useState(false);

  const [premium, setPremium] = useState(false);
  const [banned, setBanned] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      // Search by name
      if (search) {
        params.append("search", search);
      }

      // Verified filter
      if (verified) {
        params.append("isVerified", "true");
      }

      // Premium filter
      if (premium) {
        params.append("isPremium", "true");
      }

      if (banned) {
        params.append("isBanned", "true");
      }

      const response = await fetch(
        `/api/admin/allusers?${params.toString()}`
      );

      const data = await response.json();

      setUsers(data);

    } catch (error) {
      console.log(error);
    
    }
  }, [search, verified, premium, banned]);

  // Auto fetch when filters change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
    <div className="mx-auto max-w-6xl space-y-6">

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-950">
          Back to admin
        </Link>

        <h2 className="text-2xl font-bold">
          User Filters
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
        />

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-6">

          <label className="flex items-center gap-2 font-medium">

            <input
              type="checkbox"
              checked={verified}
              onChange={(e) =>
                setVerified(e.target.checked)
              }
            />

            Verified
          </label>

          <label className="flex items-center gap-2 font-medium">

            <input
              type="checkbox"
              checked={premium}
              onChange={(e) =>
                setPremium(e.target.checked)
              }
            />

            Premium
          </label>

          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={banned}
              onChange={(e) =>
                setBanned(e.target.checked)
              }
            />

            Banned
          </label>

        </div>
      </div>

      {/* Users */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-2xl font-bold mb-5">
          Users
        </h2>

        <div className="space-y-4">

          {users.map((user) => (
           <Link key={user._id} href={`/admin/manageUsers/${user._id}`}>
             <div
              className="flex items-center justify-between rounded-lg bg-slate-50 p-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold">
                  {user.name}
                </p>

                <p className="text-sm text-slate-500">
                  {user.email}
                </p>
              </div>

              <div className="flex gap-2">

                {user.isVerified && (
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-sm text-white">
                    Verified
                  </span>
                )}

                {user.isPremium && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                    Premium
                  </span>
                )}

                {user.isBanned && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                    Banned
                  </span>
                )}

              </div>
            </div>
            </Link>
          ))}

        </div>
        
      </div>
    </div>
    </div>
  );
}
