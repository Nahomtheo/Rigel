import Link from "next/link";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import {
  BadgeCheck,
  BarChart3,
  ClipboardList,
  CreditCard,
  FileWarning,
  Image as ImageIcon,
  Megaphone,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";

export default async  function AdminDashboard() {
    await connectDB();

    const [userCount, listingCount] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
    ]);

    const stats=[
        {title:"Users",value:userCount},
        {title:"Listings",value:listingCount}
    ]
 

  const quickActions = [
    { label: "Manage Users", href: "/admin/manageUsers", icon: Users },
    { label: "Manage Listings", href: "/admin/manageListings", icon: ClipboardList },
    { label: "Manage Ads", href: "/admin/ads", icon: ImageIcon },
    { label: "Reports", href: "/admin/reports", icon: FileWarning },
    { label: "Verification Requests", href: "/admin/verificationRequests", icon: BadgeCheck },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="border-b border-slate-200 bg-white/95 p-5 shadow-sm lg:sticky lg:top-0 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="mt-1 text-sm text-slate-500">
              Marketplace Management
            </p>
          </div>

          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-12 w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            )})}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-5 sm:p-8">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Dashboard</h2>
              <p className="text-slate-500 mt-1">
                Welcome back, Admin
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="/admin" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-medium shadow-sm transition hover:border-slate-400">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </a>

              <Link href="/admin/announcements" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-slate-800">
                <Megaphone className="h-4 w-4" aria-hidden="true" />
                Create Announcement
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            {stats?.map((stat) => (
              <div
                key={stat.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-slate-500 text-sm font-medium">
                  {stat.title}
                </p>
                <h3 className="text-4xl font-bold mt-3">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Management */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold">User Management</h3>
                <Link href="/admin/manageUsers" className="text-sm font-medium text-slate-500 hover:text-slate-950">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                <Link href="/admin/manageUsers?banned=true" className="block w-full rounded-lg bg-slate-50 p-4 text-left font-medium transition hover:bg-slate-100">
                  Ban / Suspend Users
                </Link>

                <Link href="/admin/verificationRequests" className="block w-full rounded-lg bg-slate-50 p-4 text-left font-medium transition hover:bg-slate-100">
                  Verify Sellers
                </Link>

                <Link href="/admin/reports" className="block w-full rounded-lg bg-slate-50 p-4 text-left font-medium transition hover:bg-slate-100">
                  View User Reports
                </Link>
              </div>
            </div>

            {/* Listing Management */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold">Listing Management</h3>
                <Link href="/admin/manageListings" className="text-sm font-medium text-slate-500 hover:text-slate-950">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                <Link href="/admin/manageListings" className="block w-full rounded-lg bg-slate-50 p-4 text-left font-medium transition hover:bg-slate-100">
                  Remove Listings
                </Link>

                <Link href="/admin/manageListings?status=pending" className="block w-full rounded-lg bg-slate-50 p-4 text-left font-medium transition hover:bg-slate-100">
                  Pending Approvals
                </Link>

                <Link href="/admin/reports" className="block w-full rounded-lg bg-slate-50 p-4 text-left font-medium transition hover:bg-slate-100">
                  Flagged Content
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold">Recent Activity</h3>
              <Link href="/admin/reports" className="text-sm font-medium text-slate-500 hover:text-slate-950">
                See More
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">New listing reported</p>
                  <p className="text-sm text-slate-500">
                    Scam report submitted by a user.
                  </p>
                </div>
                <Link href="/admin/reports" className="rounded-lg bg-slate-950 px-4 py-2 text-center text-sm text-white hover:bg-slate-800">
                  Review
                </Link>
              </div>

              <div className="flex flex-col gap-4 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Seller verification request</p>
                  <p className="text-sm text-slate-500">
                    A seller requested account verification.
                  </p>
                </div>
                <Link href="/admin/verificationRequests" className="rounded-lg bg-slate-950 px-4 py-2 text-center text-sm text-white hover:bg-slate-800">
                  Open
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
