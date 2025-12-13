"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, MessageSquare, User, Pencil, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";

const navLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/chat", label: "Messages", icon: MessageSquare },
  { href: "/profile/me", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card/80 p-6 backdrop-blur-sm md:flex">
      <Link href="/home" className="mb-10">
        <Logo />
      </Link>

      <nav className="flex flex-1 flex-col justify-between">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-4 rounded-lg p-3 text-lg font-semibold transition-colors",
                  pathname.startsWith(link.href) && link.href !== '/' || pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <link.icon className="h-6 w-6" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4">
           <CreatePostDialog>
              <Button size="lg" className="w-full rounded-full">
                  <Pencil className="mr-2 h-5 w-5" />
                  New Post
              </Button>
            </CreatePostDialog>
            <Link href="/auth">
                <Button size="lg" variant="secondary" className="w-full rounded-full">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                </Button>
            </Link>
        </div>
      </nav>
    </aside>
  );
}
