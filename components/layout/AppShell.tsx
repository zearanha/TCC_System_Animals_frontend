"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/cn";
import { canAccessPath, getDefaultRouteForRole, isPublicPath } from "@/lib/access";
import { useAuth } from "@/hooks";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuth();
  const publicPath = isPublicPath(pathname);
  const hasAccess = user ? canAccessPath(user.perfil, pathname) : false;

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      if (!publicPath) router.replace("/login");
      return;
    }

    if (!user) return;

    const fallback = getDefaultRouteForRole(user.perfil);

    if (publicPath) {
      router.replace(fallback);
      return;
    }

    if (!canAccessPath(user.perfil, pathname)) {
      router.replace(fallback);
    }
  }, [loading, isAuthenticated, user, publicPath, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-card">
          Carregando sessao...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (publicPath) return <>{children}</>;
    return null;
  }

  if (!user) return null;

  if (publicPath || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl gap-4 md:gap-6">
        <div className="hidden w-80 shrink-0 md:block">
          <Sidebar />
        </div>

        <div className="flex-1 rounded-2xl border border-[var(--border)] bg-white/75 p-4 shadow-card backdrop-blur-sm md:p-6">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold"
              onClick={() => setOpen((current) => !current)}
            >
              Menu
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Painel Municipal
            </span>
          </div>

          <div className="min-h-[70vh]">{children}</div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 p-4 transition-opacity md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="h-full w-full max-w-xs">
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
