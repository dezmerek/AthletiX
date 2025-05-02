import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import { NextIntlClientProvider } from "next-intl";
import { cookies, headers } from "next/headers";
import { ThemeProvider } from "next-themes";

const montserrat = Montserrat({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale =
    cookieStore.get("NEXT_LOCALE")?.value || detectLanguage(acceptLanguage);

  const metadata = (await import(`../../messages/${locale}/metadata.json`))
    .default;

  return {
    title: metadata.title,
    description: metadata.description,
  };
}

function detectLanguage(acceptLanguageHeader: string | null): "pl" | "en" {
  if (!acceptLanguageHeader) return "en";

  // Check if Polish is one of the preferred languages
  const hasPolish = acceptLanguageHeader.toLowerCase().includes("pl");
  return hasPolish ? "pl" : "en";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <html lang={locale}>
      <body
        suppressHydrationWarning
        className={`${montserrat.className} antialiased`}
      >
        <ThemeProvider attribute="class">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Navbar />
            {children}
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
