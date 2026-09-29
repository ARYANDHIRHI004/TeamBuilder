export type Role = "ADMIN" | "SUPERADMIN" | "STUDENT" | "USER";

/**
 * Helper to unwrap user object if it comes wrapped in API response metadata
 */
export function extractUser(rawUser: any) {
  if (!rawUser) return null;
  if (
    rawUser.data &&
    typeof rawUser.data === "object" &&
    (rawUser.data.id || rawUser.data.email || rawUser.data.name || rawUser.data.roles || rawUser.data.role)
  ) {
    return rawUser.data;
  }
  return rawUser;
}

/**
 * Extracts and normalizes all system roles assigned to the user into uppercase strings.
 */
export function getUserRoles(rawUser: any): string[] {
  const user = extractUser(rawUser);
  if (!user) return [];

  const rolesSet = new Set<string>();

  // Direct string property: user.role
  if (typeof user.role === "string") {
    rolesSet.add(user.role.toUpperCase());
  } else if (Array.isArray(user.role)) {
    user.role.forEach((r: any) => {
      if (typeof r === "string") rolesSet.add(r.toUpperCase());
      else if (r?.role && typeof r.role === "string") rolesSet.add(r.role.toUpperCase());
    });
  }

  // Relation array from backend Prisma: user.roles
  if (Array.isArray(user.roles)) {
    user.roles.forEach((r: any) => {
      if (typeof r === "string") rolesSet.add(r.toUpperCase());
      else if (r?.role && typeof r.role === "string") rolesSet.add(r.role.toUpperCase());
    });
  }

  // Default fallback if logged in user has no explicit role set
  if (rolesSet.size === 0 && (user.id || user.email || user.name)) {
    rolesSet.add("STUDENT");
  }

  return Array.from(rolesSet);
}

/**
 * Check if the user possesses ADMIN or SUPERADMIN privileges.
 */
export function isAdminUser(user: any): boolean {
  const roles = getUserRoles(user);
  return roles.includes("ADMIN") || roles.includes("SUPERADMIN");
}

/**
 * Check if the user is a regular STUDENT or normal user.
 */
export function isStudentUser(user: any): boolean {
  const roles = getUserRoles(user);
  return roles.includes("STUDENT") || roles.includes("USER") || (!roles.includes("ADMIN") && !roles.includes("SUPERADMIN"));
}

/**
 * Validates if the user matches any of the specified target roles.
 */
export function hasAllowedRole(user: any, allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const userRoles = getUserRoles(user);
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  return userRoles.some((r) => normalizedAllowed.includes(r));
}
