import { useState } from "react";
import { WarrantyText } from "@/components/WarrantyButton";
import { HelpCircle, FileQuestion, PenTool, ShieldCheck, Baby, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function HelpDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Opna hjálp"
          className="relative flex min-h-[44px] items-center gap-2 text-[10px] uppercase tracking-[.16em] transition-colors hover:text-[#6892b8]"
        >
          <HelpCircle size={18} strokeWidth={1.25} />
          <span>Hjálp</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[400px] overflow-y-auto border-l border-[#24313b]/10 bg-[#f7f9fa] p-0 sm:max-w-[440px] motion-reduce:duration-0 motion-reduce:transition-none [&>button]:z-20 [&>button]:top-6 [&>button]:right-6">
        <SheetHeader className="sticky top-0 z-10 border-b border-[#24313b]/10 bg-[#f7f9fa]/95 p-6 pr-12 backdrop-blur-md">
          <SheetTitle className="font-serif text-2xl text-[#24313b]">Hjálp & Upplýsingar</SheetTitle>
          <SheetDescription className="text-xs text-[#596872]">
            Allt sem þú þarft að vita um mælingar, pöntun og uppsetningu.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-4">
          <Accordion type="single" collapsible defaultValue="measurements" className="w-full space-y-4 motion-reduce:animate-none">
            
            <AccordionItem value="measurements" className="border-b-0">
              <AccordionTrigger className="rounded-none border border-[#ccd9df] bg-white px-4 py-3 hover:bg-[#eaf1f5] hover:no-underline [&[data-state=open]]:bg-[#eaf1f5]">
                <div className="flex items-center gap-3 text-[#24313b]">
                  <PenTool size={18} strokeWidth={1.5} className="text-[#6892b8]" />
                  <span className="font-serif text-lg tracking-[-.02em]">Mælingar & Uppsetning</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border border-t-0 border-[#ccd9df] bg-white p-5 text-sm text-[#596872] motion-reduce:animate-none">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="font-medium text-[#24313b]">Innan á karm (Inside Mount)</h4>
                    <ol className="list-inside list-decimal space-y-1">
                      <li>Mælið breidd á 3 stöðum: efst, miðju og neðst. Skráið <strong className="text-[#24313b]">minnsta málið</strong> (MIN breidd).</li>
                      <li>Mælið hæð á 3 stöðum: vinstri, miðju og hægri. Skráið <strong className="text-[#24313b]">stærsta málið</strong> (MAX hæð).</li>
                      <li>Lágmarksdýpt fyrir festingar er <strong className="text-[#24313b]">6,5 cm / 65 mm</strong>.</li>
                    </ol>
                    <div className="mt-2 rounded-none border-l-2 border-[#a2c2e2] bg-[#f7f9fa] p-3 text-xs">
                      Settu inn nákvæm mál á opinu. Ekki draga sjálf/ur frá fyrir festingum – verksmiðjan sér um nauðsynlegan frádrátt.
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-[#24313b]">Utan á karm eða vegg (Outside Mount)</h4>
                    <ol className="list-inside list-decimal space-y-1">
                      <li>Mælið gluggaopið (breidd og hæð).</li>
                      <li>Bætið <strong className="text-[#24313b]">10–15 cm</strong> við bæði breidd og hæð (til að tryggja góða skörun og myrkvun).</li>
                      <li>Fylgið sérstökum leiðbeiningum vöru ef þær mæla með annarri stærð skörunar.</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-[#24313b]">Uppsetning</h4>
                    <p>
                      Festið smella-festingarnar (snap-fit brackets) á vegg eða í loft með skrúfum og töppum sem henta undirlaginu. Hafið festingarnar í beinni línu og smellið brautinni í þær þar til hún læsist. Athugið að allar festingar séu læstar og fylgið uppsetningarleiðbeiningum vörunnar.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq" className="border-b-0">
              <AccordionTrigger className="rounded-none border border-[#ccd9df] bg-white px-4 py-3 hover:bg-[#eaf1f5] hover:no-underline [&[data-state=open]]:bg-[#eaf1f5]">
                <div className="flex items-center gap-3 text-[#24313b]">
                  <FileQuestion size={18} strokeWidth={1.5} className="text-[#6892b8]" />
                  <span className="font-serif text-lg tracking-[-.02em]">Algengar spurningar</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border border-t-0 border-[#ccd9df] bg-white p-5 text-sm text-[#596872] motion-reduce:animate-none">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1" className="border-b border-[#ccd9df] py-1">
                    <AccordionTrigger className="text-sm font-medium text-[#24313b] hover:no-underline hover:text-[#6892b8] py-2">Afhendingartími</AccordionTrigger>
                    <AccordionContent className="text-sm text-[#596872] pb-3 motion-reduce:animate-none">
                      10–18 virkir dagar (sérframleitt frá grunni).
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2" className="border-b border-[#ccd9df] py-1">
                    <AccordionTrigger className="text-sm font-medium text-[#24313b] hover:no-underline hover:text-[#6892b8] py-2">Þrif & Umhirða</AccordionTrigger>
                    <AccordionContent className="text-sm text-[#596872] pb-3 motion-reduce:animate-none">
                      Strjúkið af með rökum klút eða rykhreinsið. Efnin eru rykhrindandi (anti-static).
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3" className="border-none py-1">
                    <AccordionTrigger className="text-sm font-medium text-[#24313b] hover:no-underline hover:text-[#6892b8] py-2">Hvað ef ég mæli vitlaust?</AccordionTrigger>
                    <AccordionContent className="text-sm text-[#596872] pb-3 motion-reduce:animate-none">
                      Sendu okkur mynd á þjónustuver til staðfestingar <strong className="text-[#24313b]">ÁÐUR</strong> en pantað er. Athugið að myndin kemur ekki í stað nákvæmrar mælingar, heldur aðeins til ráðgjafar um aðferð.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="warranty" className="border-b-0">
              <AccordionTrigger className="rounded-none border border-[#ccd9df] bg-white px-4 py-3 hover:bg-[#eaf1f5] hover:no-underline [&[data-state=open]]:bg-[#eaf1f5]">
                <div className="flex items-center gap-3 text-[#24313b]">
                  <ShieldCheck size={18} strokeWidth={1.5} className="text-[#6892b8]" />
                  <span className="font-serif text-lg tracking-[-.02em]">Ábyrgð</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border border-t-0 border-[#ccd9df] bg-white p-5 text-sm text-[#596872] motion-reduce:animate-none">
                <p>
                  <WarrantyText />
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="safety" className="border-b-0">
              <AccordionTrigger className="rounded-none border border-[#ccd9df] bg-white px-4 py-3 hover:bg-[#eaf1f5] hover:no-underline [&[data-state=open]]:bg-[#eaf1f5]">
                <div className="flex items-center gap-3 text-[#24313b]">
                  <Baby size={18} strokeWidth={1.5} className="text-[#6892b8]" />
                  <span className="font-serif text-lg tracking-[-.02em]">Barnavænt</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border border-t-0 border-[#ccd9df] bg-white p-5 text-sm text-[#596872] motion-reduce:animate-none">
                <p>
                  Allar okkar <strong className="text-[#24313b]">þráðlausu (Cordless)</strong> lausnir eru 100% barnvænar. 
                </p>
                <p className="mt-2">
                  Fyrir kerfi með keðju/snúru gilda <strong className="text-[#24313b]">EN 13120</strong> öryggisstaðlar varðandi rétta uppsetningu á öryggisfestingum fyrir börn til að fyrirbyggja slys.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-8 rounded-none border border-[#ccd9df] bg-[#eaf1f5] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-white text-[#6892b8]">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-serif text-lg tracking-[-.02em] text-[#24313b]">Hafðu samband</h4>
                <p className="text-xs text-[#596872]">Svarað innan 24 klst</p>
              </div>
            </div>
            <a 
              href="mailto:sala@gardinulausnir.is"
              className="mt-4 flex w-full items-center justify-center bg-[#24313b] px-4 py-3 text-[10px] font-medium uppercase tracking-[.18em] text-white transition-colors hover:bg-[#1a232b]"
            >
              sala@gardinulausnir.is
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
