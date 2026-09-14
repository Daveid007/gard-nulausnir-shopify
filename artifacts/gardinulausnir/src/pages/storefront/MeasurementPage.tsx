import { Footer, Header } from "./_shared/Storefront";
import { MeasurementGuideContent } from "@/components/MeasurementGuide";

export function MeasurementPage() {
  return (
    <div id="top" className="min-h-screen bg-[#f7f9fa] text-[#24313b]">
      <Header />
      <main className="mx-auto max-w-[1180px] px-5 py-12 md:px-10 md:py-20">
        <MeasurementGuideContent />
      </main>
      <Footer />
    </div>
  );
}

export default MeasurementPage;
