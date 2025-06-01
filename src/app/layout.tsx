import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import ThemeProvider from "@/theme/ThemeProvider";
import AuthProvider from "@/components/auth/Providers";

const montserrat = Montserrat({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const metadata = (await import(`../../messages/${locale}/metadata.json`))
    .default;

  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`bg-white dark:bg-[#191919] text-[#37352f] dark:text-[#ffffffcf] ${montserrat.className} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ConditionalLayout>{children}</ConditionalLayout>
            </NextIntlClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
