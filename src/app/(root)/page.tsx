import CTASection from "./_components/CTASection";
import FeaturesSection from "./_components/FeaturesSection";
import Footer from "./_components/Footer";
import HeroSection from "./_components/HeroSection";
import PricingSection from "./_components/PricingSection";
import Topbar from "./_components/Topbar";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-white text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-black dark:text-gray-100">
      <Topbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
