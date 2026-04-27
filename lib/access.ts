import { UserRole } from "@/types";

type AccessRule = {
  pattern: RegExp;
  roles: UserRole[];
};

const USER_ROLES = ["ADMIN", "AGENTE", "PROPRIETARIO"] as const;
const FALLBACK_ROUTE = "/login";

const ACCESS_RULES: AccessRule[] = [
  { pattern: /^\/dashboard$/, roles: ["ADMIN"] },
  { pattern: /^\/usuarios$/, roles: ["ADMIN"] },
  { pattern: /^\/proprietarios$/, roles: ["ADMIN"] },
  { pattern: /^\/proprietarios\/novo$/, roles: ["ADMIN"] },
  { pattern: /^\/agentes$/, roles: ["ADMIN"] },
  { pattern: /^\/animais$/, roles: ["ADMIN", "PROPRIETARIO"] },
  { pattern: /^\/animais\/novo$/, roles: ["ADMIN"] },
  { pattern: /^\/ocorrencias\/nova$/, roles: ["ADMIN", "AGENTE"] },
  { pattern: /^\/busca-codigo$/, roles: ["ADMIN", "AGENTE"] },
  { pattern: /^\/notificacoes$/, roles: ["ADMIN", "PROPRIETARIO"] },
];

const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  ADMIN: "/dashboard",
  AGENTE: "/ocorrencias/nova",
  PROPRIETARIO: "/animais",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

export function isPublicPath(pathname: string): boolean {
  return pathname === "/login";
}

export function getDefaultRouteForRole(role: UserRole | string | null | undefined): string {
  if (!isUserRole(role)) return FALLBACK_ROUTE;
  return DEFAULT_ROUTE_BY_ROLE[role] ?? FALLBACK_ROUTE;
}

export function canAccessPath(role: UserRole | string | null | undefined, pathname: string): boolean {
  if (isPublicPath(pathname)) return true;
  if (!isUserRole(role)) return false;

  const rule = ACCESS_RULES.find((item) => item.pattern.test(pathname));
  if (!rule) return false;

  return rule.roles.includes(role);
}
