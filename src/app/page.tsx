import Header from "@/app/components/home/Header";
import Hero from "@/app/components/home/Hero";
import Features from "@/app/components/home/Features";
import CTA from "@/app/components/home/CTA";
import Footer from "./components/home/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
