import { ArrowRight, Ruler, ShieldCheck, Tag } from "lucide-react";
import { Link } from "wouter";
import { Header, Footer } from "./_shared/Storefront";
import { ResponsiveImage } from "@/components/ResponsiveImage";

export function AboutPage() {
  return (
    <div id="top" className="solmyrkvun-grid min-h-screen bg-[#f7f9fa]">
      <Header />
      
      <main className="mx-auto max-w-[1480px]">
        {/* Hero Section */}
        <section className="px-5 py-16 md:px-10 md:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] uppercase tracking-[.25em] text-[#6892b8] mb-6">Sagan okkar</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-[-.04em] text-[#24313b] leading-[.95] mb-8">
              Gæða gardínur í þinn glugga, án málamiðlana.
            </h1>
          </div>
        </section>

        {/* Story Section */}
        <section className="px-5 pb-20 md:px-10 md:pb-32">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="relative aspect-[4/5] bg-[#eaf1f5] overflow-hidden">
              <ResponsiveImage
                src="https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-45mm.png?v=1787921250"
                alt="Myrkvunargardína með fíngerðum fellingum"
                className="absolute inset-0 w-full h-full object-contain p-6"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[-.03em] text-[#24313b] mb-8 leading-tight">
                Við trúum því að falleg heimili eigi skilið fullkomnar gardínur.
              </h2>
              
              <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-[#43515a]">
                <p>
                  Sagan hófst þegar stofnandi Gardínulausna leitaði að gardínum fyrir eigið heimili. Valið virtist standa á milli staðlaðra stærða úr verslunum sem pössuðu ekki nógu vel og sérlausna frá innlendum söluaðilum á verði sem var erfitt að sætta sig við.
                </p>
                <p>
                  Í stað þess að sætta sig við þessa kosti fór stofnandinn að leita beint til leiðandi framleiðenda erlendis. Þannig hófst innflutningur á hágæða gardínum eftir máli — fyrst fyrir eigið heimili og síðan fyrir vini.
                </p>
                <p>
                  Þannig varð Gardínulausnir.is til. Markmið okkar er skýrt: Að afnema dýra milliliði og íburðarmikla sýningarsali, og færa íslenskum heimilum nútímalegar, millimetranákvæmar gardínur á sanngjörnu verði.
                </p>
              </div>

              <div className="mt-12">
                <Link href="/collection" className="inline-flex items-center gap-3 bg-[#24313b] text-white px-8 py-4 text-[10px] uppercase tracking-[.18em] hover:bg-[#43515a] transition-colors">
                  Skoða úrval <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Statements */}
        <section className="border-y border-[#24313b]/10 bg-[#eaf1f5]">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#24313b]/10">
            <div className="px-5 py-12 md:p-16 flex flex-col items-center text-center">
              <Ruler className="text-[#6892b8] mb-6" size={32} strokeWidth={1} />
              <h3 className="font-serif text-2xl text-[#24313b] mb-3">Sérsniðið eftir máli</h3>
              <p className="text-sm text-[#596872] max-w-[250px]">Millimetranákvæm framleiðsla sem fellur fullkomlega að þínum gluggum.</p>
            </div>
            
            <div className="px-5 py-12 md:p-16 flex flex-col items-center text-center">
              <ShieldCheck className="text-[#6892b8] mb-6" size={32} strokeWidth={1} />
              <h3 className="font-serif text-2xl text-[#24313b] mb-3">Hágæða vélbúnaður</h3>
              <p className="text-sm text-[#596872] max-w-[250px]">Traustir íhlutir og efniviður frá viðurkenndum alþjóðlegum framleiðendum.</p>
            </div>
            
            <div className="px-5 py-12 md:p-16 flex flex-col items-center text-center">
              <Tag className="text-[#6892b8] mb-6" size={32} strokeWidth={1} />
              <h3 className="font-serif text-2xl text-[#24313b] mb-3">Milliliðalaust verð</h3>
              <p className="text-sm text-[#596872] max-w-[250px]">Engir sýningarsalir eða óþarfa kostnaður, bara beint frá verksmiðju til þín.</p>
            </div>
          </div>
        </section>

        {/* Contact/CTA Section */}
        <section className="px-5 py-20 md:px-10 md:py-32 text-center">
          <h2 className="font-serif text-3xl md:text-5xl tracking-[-.03em] text-[#24313b] mb-6">Ertu með spurningar?</h2>
          <p className="text-[#43515a] mb-10 max-w-md mx-auto">
            Við erum hér til að aðstoða við val á efnum, mælingar og allt sem tengist gardínunum þínum.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:hallo@gardinulausnir.is" className="inline-flex items-center justify-center min-w-[200px] gap-2 border border-[#24313b]/20 px-8 py-4 text-[10px] uppercase tracking-[.18em] text-[#24313b] hover:bg-[#eaf1f5] transition-colors">
              hallo@gardinulausnir.is
            </a>
            <Link href="/maelingar" className="inline-flex items-center justify-center min-w-[200px] gap-2 bg-[#a2c2e2] px-8 py-4 text-[10px] uppercase tracking-[.18em] text-[#24313b] hover:bg-[#8eb3d6] transition-colors">
              Skoða mælingar
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default AboutPage;
