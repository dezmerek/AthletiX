import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AthletiX - Asystent Treningowy",
  description:
    "AthletiX - zaawansowana aplikacja do planowania i śledzenia treningów. Twórz spersonalizowane plany treningowe, monitoruj postępy i osiągaj swoje cele fitness z profesjonalnym asystentem treningowym.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'pl';
  const messages = await import(`../../messages/${locale}.json`).then(module => module.default);

  return (
    <html lang={locale}>
      <body className={`${montserrat.className} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
