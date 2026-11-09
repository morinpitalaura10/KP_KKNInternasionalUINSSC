import Header from "@/components/Header";
import HeroSections from "@/components/HeroSections";
import CardFotoKegiatan from "@/components/CardFotoKegiatan";
import CardHome from "@/components/CardHome";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Header Bar */}
      <Header />

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        {/* Banner Hero Slider */}
        <HeroSections />

        {/* Dark Green Activity Photo Cards Section */}
        <CardFotoKegiatan />

        {/* Sage Green Information Cards Section */}
        <CardHome />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
