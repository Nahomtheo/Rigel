"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  LayoutGrid, 
  PlusSquare, 
  MessageSquareText, 
  User 
} from "lucide-react";
import clsx from "clsx";
import { useSession } from "next-auth/react";

export default function BottomNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search }, // Assuming a search page or modal
    { name: "My listing", href: "/userlisting", icon: LayoutGrid }, // Assuming a categories page
    { name: "List", href: "/createlisting", icon: PlusSquare, authRequired: true },
    { name: "Inbox", href: "/inbox", icon: MessageSquareText, authRequired: true },
    { name: "Profile", href: "/dashboard", icon: User, authRequired: true },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          // Only render authRequired items if session exists
          if (item.authRequired && !session) {
            return null;
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="sr-only sm:not-sr-only">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
