"use client";
import Hero from "@/containers/main/HeroSection";
import ClientSection from "@/containers/main/ClientSection";
import DietSection from "@/containers/main/DietSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ClientSection />
      <DietSection />
    </>
  );
}
