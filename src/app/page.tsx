"use client";
import Hero from "@/containers/main/HeroSection";
import ClientSection from "@/containers/main/ClientSection";
import SecuritySection from "@/containers/main/SecuritySection";
import ProfessionalSection from "@/containers/main/ProfessionalSection";
import CommunicationSection from "@/containers/main/CommunicationSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ClientSection />
      <SecuritySection />
      <ProfessionalSection />
      <CommunicationSection />
    </>
  );
}
