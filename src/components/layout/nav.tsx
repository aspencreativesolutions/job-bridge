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
  const firstName = session?.user?.name?.split(" ")[0] ?? null;

  return (
    <header className="border-b border-white/10 bg-[#0a0e1a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center">
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

          {session?.user && (
            <div className="hidden min-w-0 border-l border-white/10 pl-4 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                Job Bridge
              </p>
              <p className="truncate text-lg font-bold leading-tight text-white">
                Welcome{firstName ? `, ${firstName}` : ""}
              </p>
              <p className="truncate text-xs leading-tight text-slate-400">
                Your job application command center
              </p>
            </div>
          )}
        </div>

        {session?.user ? (
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link flex items-center gap-2 rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
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
                className="ml-2 nav-link flex items-center gap-2 rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </nav>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
