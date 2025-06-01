"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Hide navbar and footer on dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      {children}
      {!isDashboardRoute && <Footer />}
    </>
  );
}
