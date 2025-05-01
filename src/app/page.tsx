"use client";
import Hero from "@/containers/main/HeroSection";
import ClientSection from "@/containers/main/ClientSection";
import SecuritySection from "@/containers/main/SecuritySection";
import ProfessionalSection from "@/containers/main/ProfessionalSection";
import CommunicationSection from "@/containers/main/CommunicationSection";
import BusinessSection from "@/containers/main/BusinessSection";
import PricingSection from "@/containers/main/PricingSection";

export default function Home() {
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
