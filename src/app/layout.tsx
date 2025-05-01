import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import { NextIntlClientProvider } from "next-intl";
import { cookies, headers } from "next/headers";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AthletiX - Asystent Treningowy",
  description:
    "AthletiX - zaawansowana aplikacja do planowania i śledzenia treningów. Twórz spersonalizowane plany treningowe, monitoruj postępy i osiągaj swoje cele fitness z profesjonalnym asystentem treningowym.",
};

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
  const messages = await import(`../../messages/${locale}.json`).then(
    (module) => module.default
  );

  return (
    <html lang={locale}>
      <body
        suppressHydrationWarning
        className={`${montserrat.className} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
