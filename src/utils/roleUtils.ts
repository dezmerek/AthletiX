/**
 * Utility functions for role management and display
 */

import { useTranslations } from "next-intl";

export interface UserRoleData {
  role?: string | string[] | null;
  activeContext?: "user" | "professional" | null;
  isPremiumPersonal?: boolean;
  isPremiumProfessional?: boolean;
}

/**
 * Hook to get role display name with translations
 */
export function useRoleDisplayName(user: UserRoleData): string {
  const t = useTranslations("roleUtils");

  // If no role is selected, show role selection prompt
  if (!user.role || (Array.isArray(user.role) && user.role.length === 0)) {
    return t("selectRole");
  }

  // Normalize roles to array
  const roles = Array.isArray(user.role) ? user.role : [user.role];

  // Handle admin role first
  if (roles.includes("admin")) {
    return t("administrator");
  }

  // Handle based on active context
  switch (user.activeContext) {
    case "user":
      return user.isPremiumPersonal ? t("userPro") : t("user");

    case "professional":
      // Check if it's admin acting as professional
      if (roles.includes("admin")) {
        return t("administrator");
      }
      return user.isPremiumProfessional
        ? t("professionalPro")
        : t("professional");

    default:
      // No active context set
      if (roles.includes("professional")) {
        return user.isPremiumProfessional
          ? t("professionalPro")
          : t("professional");
      }
      if (roles.includes("user")) {
        return user.isPremiumPersonal ? t("userPro") : t("user");
      }
      return t("selectRole");
  }
}

/**
 * Get display name for user's current role/context with translations
 * @deprecated Use useRoleDisplayName hook instead
 */
export function getRoleDisplayNameWithTranslations(
  user: UserRoleData,
  t: (key: string) => string
): string {
  // If no role is selected, show role selection prompt
  if (!user.role || (Array.isArray(user.role) && user.role.length === 0)) {
    return t("selectRole");
  }

  // Normalize roles to array
  const roles = Array.isArray(user.role) ? user.role : [user.role];

  // Handle admin role first
  if (roles.includes("admin")) {
    return t("administrator");
  }

  // Handle based on active context
  switch (user.activeContext) {
    case "user":
      return user.isPremiumPersonal ? t("userPro") : t("user");

    case "professional":
      // Check if it's admin acting as professional
      if (roles.includes("admin")) {
        return t("administrator");
      }
      return user.isPremiumProfessional
        ? t("professionalPro")
        : t("professional");

    default:
      // No active context set
      if (roles.includes("professional")) {
        return user.isPremiumProfessional
          ? t("professionalPro")
          : t("professional");
      }
      if (roles.includes("user")) {
        return user.isPremiumPersonal ? t("userPro") : t("user");
      }
      return t("selectRole");
  }
}

/**
 * Get display name for user's current role/context (legacy - Polish only)
 * @deprecated Use getRoleDisplayNameWithTranslations instead
 */
export function getRoleDisplayName(user: UserRoleData): string {
  // If no role is selected, show role selection prompt
  if (!user.role || (Array.isArray(user.role) && user.role.length === 0)) {
    return "Wybierz rolę";
  }

  // Normalize roles to array
  const roles = Array.isArray(user.role) ? user.role : [user.role];

  // Handle admin role first
  if (roles.includes("admin")) {
    return "Administrator";
  }

  // Handle based on active context
  switch (user.activeContext) {
    case "user":
      return user.isPremiumPersonal ? "Użytkownik PRO" : "Użytkownik";

    case "professional":
      return user.isPremiumProfessional
        ? "Profesjonalista PRO"
        : "Profesjonalista";

    default:
      // No active context set
      if (roles.includes("professional")) {
        return user.isPremiumProfessional
          ? "Profesjonalista PRO"
          : "Profesjonalista";
      }
      if (roles.includes("user")) {
        return user.isPremiumPersonal ? "Użytkownik PRO" : "Użytkownik";
      }
      return "Wybierz rolę";
  }
}

/**
 * Get all available roles for a user
 */
export function getAvailableRoles(user: UserRoleData): string[] {
  if (!user.role) return [];
  return Array.isArray(user.role) ? user.role : [user.role];
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserRoleData, role: string): boolean {
  const roles = getAvailableRoles(user);
  return roles.includes(role);
}

/**
 * Check if user can act as professional
 */
export function canActAsProfessional(user: UserRoleData): boolean {
  return hasRole(user, "professional") || hasRole(user, "admin");
}

/**
 * Check if user can act as regular user
 */
export function canActAsUser(user: UserRoleData): boolean {
  return hasRole(user, "user") || hasRole(user, "admin");
}

/**
 * Get context badge style based on role
 */
export function getContextBadgeStyle(user: UserRoleData): {
  bgColor: string;
  textColor: string;
  badgeText: string;
} {
  const roles = getAvailableRoles(user);

  if (roles.includes("admin")) {
    return {
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      badgeText: "Admin",
    };
  }

  switch (user.activeContext) {
    case "professional":
      return {
        bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
        textColor: "text-emerald-600 dark:text-emerald-400",
        badgeText: "Pro",
      };

    case "user":
      return {
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
        badgeText: "User",
      };

    default:
      return {
        bgColor: "bg-gray-100 dark:bg-gray-900/20",
        textColor: "text-gray-600 dark:text-gray-400",
        badgeText: "?",
      };
  }
}
