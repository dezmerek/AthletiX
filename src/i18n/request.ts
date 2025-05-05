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
  };

  return {
    locale,
    messages,
  };
});
