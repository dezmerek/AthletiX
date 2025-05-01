import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AthletiX - Asystent Treningowy",
  description:
    "AthletiX - zaawansowana aplikacja do planowania i śledzenia treningów. Twórz spersonalizowane plany treningowe, monitoruj postępy i osiągaj swoje cele fitness z profesjonalnym asystentem treningowym.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
