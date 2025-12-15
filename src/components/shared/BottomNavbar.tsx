"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/chat", label: "Messages", icon: MessageSquare },
  { href: "/profile/me", label: "Profile", icon: User },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <ul className="flex h-16 items-center justify-around">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "flex h-12 w-12 flex-col items-center justify-center rounded-xl transition-colors",
                 pathname.startsWith(link.href) && link.href !== '/' || pathname === link.href
                  ? "text-primary"
                  : "text-foreground/60 hover:text-primary"
              )}
              aria-label={link.label}
            >
              <link.icon className="h-7 w-7" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
