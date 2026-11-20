export type AppUserRole = "customer" | "technician" | "admin";

export function getRoleDashboardPath(role?: string | null): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "technician":
      return "/dashboard/technician";
    default:
      return "/dashboard/customer";
  }
}

export function sanitizeCallbackUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmed = rawUrl.trim();

  // Must be a relative internal path (block protocol-relative //evil.com or /\evil.com)
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return null;
  }

  // Prevent auth redirect loops
  if (trimmed === "/sign-in" || trimmed === "/sign-up") {
    return null;
  }

  return trimmed;
}