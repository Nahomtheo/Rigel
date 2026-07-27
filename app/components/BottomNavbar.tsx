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
    { name: "Search", href: "/search", icon: Search },
    { name: "My listing", href: "/userlisting", icon: LayoutGrid, authRequired: true },
    { name: "List", href: "/createlisting", icon: PlusSquare, authRequired: true },
    { name: "Inbox", href: "/chat", icon: MessageSquareText, authRequired: true },
    { name: "Profile", href: "/dashboard", icon: User, authRequired: true },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-[#18130e] border-t border-amber-900/30 shadow-2xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
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
                "flex flex-col items-center justify-center gap-1 text-xs font-medium py-1 px-2 rounded-lg transition-all",
                isActive
                  ? "text-amber-400 font-semibold"
                  : "text-stone-400 hover:text-amber-200 hover:bg-[#211a14]"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "text-amber-400" : "text-stone-400")} />
              <span className="sr-only sm:not-sr-only text-[10px] sm:text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}