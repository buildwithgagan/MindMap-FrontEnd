import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity", className)}>
      <Wind className="h-6 w-6" />
      <span className="text-xl font-bold">ZenZone</span>
    </Link>
  );
}
