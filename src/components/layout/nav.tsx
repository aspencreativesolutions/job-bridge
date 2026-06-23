import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Briefcase, FileText, Settings, LayoutDashboard, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

export async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Job Bridge"
            width={72}
            height={72}
            className="h-[4.5rem] w-auto"
            priority
            unoptimized
          />
        </Link>

        {session?.user ? (
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link flex items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="ml-2 nav-link flex items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </nav>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
