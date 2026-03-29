import { UserRole } from "@/types";

type AccessRule = {
  pattern: RegExp;
  roles: UserRole[];
};

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

export function isPublicPath(pathname: string): boolean {
  return pathname === "/login";
}

export function getDefaultRouteForRole(role: UserRole): string {
  return DEFAULT_ROUTE_BY_ROLE[role];
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (isPublicPath(pathname)) return true;

  const rule = ACCESS_RULES.find((item) => item.pattern.test(pathname));
  if (!rule) return false;

  return rule.roles.includes(role);
}
