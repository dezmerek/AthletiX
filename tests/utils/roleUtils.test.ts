import {
  type UserRoleData,
  getRoleDisplayName,
  getAvailableRoles,
  hasRole,
  canActAsProfessional,
  canActAsUser,
  canActAsAdmin,
  getContextBadgeStyle,
} from "@/utils/roleUtils";

const t = (key: string) =>
  ({
    selectRole: "Wybierz rolę",
    user: "Użytkownik",
    userPro: "Użytkownik Pro",
    professional: "Profesjonalista",
    professionalPro: "Profesjonalista Pro",
    administrator: "Administrator",
  }[key] ?? key);

describe("roleUtils", () => {
  test("getAvailableRoles returns empty for no role", () => {
    const user: UserRoleData = { role: null };
    expect(getAvailableRoles(user)).toEqual([]);
  });

  test("getAvailableRoles normalizes string to array", () => {
    const user: UserRoleData = { role: "user" };
    expect(getAvailableRoles(user)).toEqual(["user"]);
  });

  test("hasRole checks membership", () => {
    const user: UserRoleData = { role: ["user", "professional"] };
    expect(hasRole(user, "user")).toBe(true);
    expect(hasRole(user, "admin")).toBe(false);
  });

  test("actAs helpers", () => {
    const user: UserRoleData = { role: ["user", "professional"] };
    expect(canActAsUser(user)).toBe(true);
    expect(canActAsProfessional(user)).toBe(true);
    expect(canActAsAdmin(user)).toBe(false);
  });

  test("getRoleDisplayName with no role", () => {
    const user: UserRoleData = { role: null };
    expect(getRoleDisplayName(user, t)).toBe("Wybierz rolę");
  });

  test("getRoleDisplayName respects activeContext and premium flags", () => {
    expect(
      getRoleDisplayName(
        { role: ["user"], activeContext: "user", isPremiumPersonal: false },
        t
      )
    ).toBe("Użytkownik");

    expect(
      getRoleDisplayName(
        { role: ["user"], activeContext: "user", isPremiumPersonal: true },
        t
      )
    ).toBe("Użytkownik Pro");

    expect(
      getRoleDisplayName(
        {
          role: ["professional"],
          activeContext: "professional",
          isPremiumProfessional: false,
        },
        t
      )
    ).toBe("Profesjonalista");

    expect(
      getRoleDisplayName(
        {
          role: ["professional"],
          activeContext: "professional",
          isPremiumProfessional: true,
        },
        t
      )
    ).toBe("Profesjonalista Pro");

    expect(
      getRoleDisplayName({ role: ["admin"], activeContext: "admin" }, t)
    ).toBe("Administrator");
  });

  test("getRoleDisplayName chooses based on roles when no activeContext", () => {
    expect(getRoleDisplayName({ role: ["admin"] }, t)).toBe("Administrator");
    expect(getRoleDisplayName({ role: ["business_owner"] }, t)).toBe(
      "Właściciel firmy"
    );
    expect(
      getRoleDisplayName(
        { role: ["professional"], isPremiumProfessional: true },
        t
      )
    ).toBe("Profesjonalista Pro");
    expect(
      getRoleDisplayName({ role: ["user"], isPremiumPersonal: true }, t)
    ).toBe("Użytkownik Pro");
  });

  test("getContextBadgeStyle returns correct style", () => {
    expect(getContextBadgeStyle({ role: ["admin"] })).toEqual({
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      badgeText: "Admin",
    });

    expect(
      getContextBadgeStyle({ role: ["user"], activeContext: "user" })
    ).toEqual({
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      badgeText: "User",
    });

    expect(
      getContextBadgeStyle({
        role: ["professional"],
        activeContext: "professional",
      })
    ).toEqual({
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      badgeText: "Pro",
    });

    expect(
      getContextBadgeStyle({ role: ["user"], activeContext: "business" })
    ).toEqual({
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      badgeText: "Business",
    });

    expect(getContextBadgeStyle({ role: ["user"] })).toEqual({
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      textColor: "text-gray-600 dark:text-gray-400",
      badgeText: "?",
    });
  });
});
