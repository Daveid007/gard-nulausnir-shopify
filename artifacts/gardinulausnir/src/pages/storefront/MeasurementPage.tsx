import { Footer, Header } from "./_shared/Storefront";
import { MeasurementGuideContent } from "@/components/MeasurementGuide";
import { Link } from "wouter";

export function MeasurementPage() {
  return (
    <div id="top" className="min-h-screen bg-[#f7f9fa] text-[#24313b]">
      <Header />
      <main className="mx-auto max-w-[1180px] px-5 py-12 md:px-10 md:py-20">
        <MeasurementGuideContent />
        <section id="uppsetning" aria-labelledby="uppsetning-heading" className="mt-16 border-t border-[#ccd9df] pt-12 md:mt-20 md:pt-16">
          <p className="text-[10px] uppercase tracking-[.2em] text-[#6892b8]">Leiðbeiningar</p>
          <h2 id="uppsetning-heading" className="mt-2 font-serif text-4xl tracking-[-.04em] md:text-5xl">Leiðbeiningar um uppsetningu</h2>
          <p className="mt-4 text-sm leading-6 text-[#43515a]">Einföld og örugg skref til að festa gardínurnar upp.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <section className="border border-[#ccd9df] bg-white/50 p-5 md:p-6">
              <h3 className="font-serif text-2xl">1. Áður en byrjað er</h3>
              <p className="mt-4 text-sm leading-7 text-[#43515a]">
                Gakktu úr skugga um að mælingar séu réttar og að þú sért með skrúfur og tappa sem henta undirlaginu (steypa, gips eða timbur). Skoðaðu{" "}
                <Link href="/maelingar" className="underline underline-offset-4">mælingaleiðbeiningar okkar</Link> fyrir frekari upplýsingar.
              </p>
            </section>
            <section className="border border-[#ccd9df] bg-white/50 p-5 md:p-6">
              <h3 className="font-serif text-2xl">2. Uppsetning</h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-[#43515a]">
                <li>Merktu fyrir festingunum með hallamáli svo þær liggi í alveg beinni línu.</li>
                <li>Skrúfaðu smellufestingarnar í vegginn eða upp í loftið.</li>
                <li>Smelltu kassetunni / topplistanum í festingarnar þar til hún smellur og læsist tryggilega.</li>
                <li>Gakktu úr skugga um að allar festingar séu læstar áður en gardínan er tekin í notkun.</li>
              </ol>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default MeasurementPage;
