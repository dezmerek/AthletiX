import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale = "pl" }) => {
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
    locale: locale as string,
    messages,
  };
});
