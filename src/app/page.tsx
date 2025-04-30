"use client";
import Hero from "@/containers/main/HeroSection";
import ClientSection from "@/containers/main/ClientSection";
import DietSection from "@/containers/main/DietSection";
import ProfessionalSection from "@/containers/main/ProfessionalSection";
import CommunicationSection from "@/containers/main/CommunicationSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ClientSection />
      <DietSection />
      <ProfessionalSection />
      <CommunicationSection />
    </>
  );
}
