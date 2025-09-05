"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Hero from "@/containers/main/HeroSection";
import ClientSection from "@/containers/main/ClientSection";
import SecuritySection from "@/containers/main/SecuritySection";
import ProfessionalSection from "@/containers/main/ProfessionalSection";
import CommunicationSection from "@/containers/main/CommunicationSection";
import BusinessSection from "@/containers/main/BusinessSection";
import PricingSection from "@/containers/main/PricingSection";

export default function Home() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const plan = searchParams.get("plan");
    const canceled = searchParams.get("canceled");

    if (success === "true" && plan) {
      alert(
        `Dziękujemy! Subskrypcja planu ${plan} została pomyślnie aktywowana.`
      );
    } else if (canceled === "true") {
      alert(
        "Płatność została anulowana. Możesz spróbować ponownie w dowolnym momencie."
      );
    }
  }, [searchParams]);

  return (
    <>
      <Hero />
      <ClientSection />
      <SecuritySection />
      <ProfessionalSection />
      <CommunicationSection />
      <BusinessSection />
      <PricingSection />
    </>
  );
}
