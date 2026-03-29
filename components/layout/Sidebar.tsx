"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks";
import { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  badge: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", badge: "DB", roles: ["ADMIN"] },
  { href: "/usuarios", label: "Modulo de Usuarios", badge: "US", roles: ["ADMIN"] },
  { href: "/proprietarios", label: "Modulo de Proprietarios", badge: "PR", roles: ["ADMIN"] },
  { href: "/agentes", label: "Modulo de Agentes", badge: "AG", roles: ["ADMIN"] },
  {
    href: "/animais",
    label: "Modulo de Animais",
    badge: "AN",
    roles: ["ADMIN", "PROPRIETARIO"],
  },
  {
    href: "/ocorrencias/nova",
    label: "Registro de Ocorrencia",
    badge: "OC",
    roles: ["ADMIN", "AGENTE"],
  },
  {
    href: "/busca-codigo",
    label: "Busca por Codigo",
    badge: "ID",
    roles: ["ADMIN", "AGENTE"],
  },
  {
    href: "/notificacoes",
    label: "Notificacoes",
    badge: "NT",
    roles: ["ADMIN", "PROPRIETARIO"],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const visibleItems = navItems.filter((item) => item.roles.includes(user.perfil));

  async function handleSignOut() {
    await signOut();
    onNavigate?.();
  }

  return (
    <aside className="flex h-full w-full flex-col rounded-2xl border border-brand-200 bg-brand-900 p-4 text-brand-50 shadow-card">
      <div className="mb-6">
        <p className="font-[var(--font-heading)] text-lg font-semibold">Monitoramento Animal</p>
        <p className="text-xs text-brand-200">Painel municipal</p>
      </div>

      <nav className="flex flex-col gap-1.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200",
                active ? "bg-brand-100 text-brand-900" : "text-brand-100 hover:bg-brand-800"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold",
                  active ? "bg-brand-900 text-brand-50" : "bg-brand-700 text-brand-100"
                )}
              >
                {item.badge}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-5">
        <div className="rounded-xl border border-brand-700 bg-brand-800/80 p-3">
          <p className="text-sm font-semibold text-brand-50">{user.nome}</p>
          <p className="text-xs text-brand-200">{user.email}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-brand-300">{user.perfil}</p>
        </div>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="w-full rounded-xl border border-brand-600 bg-brand-700 px-3 py-2 text-sm font-semibold text-brand-50 transition-colors hover:bg-brand-600"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
