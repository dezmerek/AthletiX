import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

function detectLanguage(acceptLanguageHeader: string | null): "pl" | "en" {
  if (!acceptLanguageHeader) return "en";

  // Check if Polish is one of the preferred languages
  const hasPolish = acceptLanguageHeader.toLowerCase().includes("pl");
  return hasPolish ? "pl" : "en";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  // Use cookie if exists, otherwise detect from browser
  const locale =
    cookieStore.get("NEXT_LOCALE")?.value || detectLanguage(acceptLanguage);

  const messages = {
    // Components
    Navbar: (await import(`../../messages/${locale}/components/navbar.json`))
      .default,
    Footer: (await import(`../../messages/${locale}/components/footer.json`))
      .default,
    sidebar: (await import(`../../messages/${locale}/sidebar.json`)).default,
    contextSwitcher: (
      await import(`../../messages/${locale}/components/context-switcher.json`)
    ).default,

    // Containers
    HeroSection: (await import(`../../messages/${locale}/containers/hero.json`))
      .default,
    BusinessSection: (
      await import(`../../messages/${locale}/containers/business.json`)
    ).default,
    ClientSection: (
      await import(`../../messages/${locale}/containers/client.json`)
    ).default,
    CommunicationSection: (
      await import(`../../messages/${locale}/containers/communication.json`)
    ).default,
    ProfessionalSection: (
      await import(`../../messages/${locale}/containers/professional.json`)
    ).default,
    SecuritySection: (
      await import(`../../messages/${locale}/containers/security.json`)
    ).default,
    PricingSection: (
      await import(`../../messages/${locale}/containers/pricing.json`)
    ).default,

    // Pages
    NotFoundSection: (await import(`../../messages/${locale}/not-found.json`))
      .default,
    terms: (await import(`../../messages/${locale}/terms.json`)).default,
    privacyPolicy: (
      await import(`../../messages/${locale}/privacy-policy.json`)
    ).default,
    ContactPage: (await import(`../../messages/${locale}/contact.json`))
      .default,
    documentation: (
      await import(`../../messages/${locale}/components/documentation.json`)
    ).default,
    faq: (await import(`../../messages/${locale}/faq.json`)).default,
    auth: (await import(`../../messages/${locale}/auth.json`)).default,
    settings: (await import(`../../messages/${locale}/settings.json`)).default,
    Profile: (await import(`../../messages/${locale}/profile.json`)).default,
    Progress: (await import(`../../messages/${locale}/progress.json`)).default,
    workouts: (await import(`../../messages/${locale}/workouts.json`)).default,
    nutrition: (await import(`../../messages/${locale}/nutrition.json`))
      .default,
    Calendar: (await import(`../../messages/${locale}/calendar.json`)).default,
    community: (await import(`../../messages/${locale}/community.json`))
      .default,
    clients: (await import(`../../messages/${locale}/clients.json`)).default,
    plans: (await import(`../../messages/${locale}/plans.json`)).default,
    analytics: (await import(`../../messages/${locale}/analytics.json`))
      .default,
    messaging: (await import(`../../messages/${locale}/messaging.json`))
      .default,
    roleUtils: (await import(`../../messages/${locale}/roleUtils.json`))
      .default,
    dashboard: (await import(`../../messages/${locale}/dashboard.json`))
      .default,
  };

  return {
    locale,
    messages,
  };
});
