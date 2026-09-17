import type { ReactNode } from "react";
import { Link } from "wouter";
import { WarrantyButton } from "@/components/WarrantyButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const footerLinkClass =
  "text-sm leading-6 text-[#43515a] underline-offset-4 transition-colors hover:text-[#6892b8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6892b8] focus-visible:ring-offset-2";
const dialogTriggerClass = `${footerLinkClass} text-left`;
const dialogTextClass = "text-sm leading-6 text-[#596872]";
const dialogLinkClass =
  "inline-flex items-center border-b border-[#557b9e] pb-0.5 text-sm text-[#557b9e] transition-colors hover:border-[#24313b] hover:text-[#24313b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6892b8] focus-visible:ring-offset-2";

function FooterDialog({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={dialogTriggerClass}>
          {label}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto border-[#ccd9df] bg-[#f7f9fa] p-5 text-[#24313b] sm:p-8">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-serif text-3xl tracking-[-.04em]">{label}</DialogTitle>
          <DialogDescription className="text-sm text-[#667984]">{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function CollectionGuidanceDialog({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <FooterDialog label={label} description={description}>
      <p className={dialogTextClass}>{children}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#honeycomb">
            Myrkvunargardínur
          </Link>
        </DialogClose>
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#curtains">
            Gluggatjöld
          </Link>
        </DialogClose>
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#roller">
            Rúllugardínur
          </Link>
        </DialogClose>
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#vertical-sheer-shades">
            Lóðréttar vefgardínur
          </Link>
        </DialogClose>
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#sheer-shades">
            Sheer Shades
          </Link>
        </DialogClose>
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#butterfly">
            Fiðrildagardínur
          </Link>
        </DialogClose>
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#windour-single">
            Einfaldar Rúllugardínur
          </Link>
        </DialogClose>
        <DialogClose asChild>
          <Link className={dialogLinkClass} href="/collection#windour-duo">
            Tvískiptar Rúllugardínur (Duo)
          </Link>
        </DialogClose>
      </div>
    </FooterDialog>
  );
}

function VisaMark() {
  return (
    <svg
      viewBox="0 0 56 32"
      role="img"
      aria-label="Visa"
      className="h-8 w-14 rounded border border-[#24313b]/10 bg-[#f7f9fa]"
    >
      <title>Visa</title>
      <rect width="56" height="32" rx="3" fill="#f7f9fa" />
      <text x="28" y="21" textAnchor="middle" fill="#24313b" fontFamily="Arial, sans-serif" fontSize="13" fontStyle="italic" fontWeight="700">
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg
      viewBox="0 0 72 32"
      role="img"
      aria-label="Mastercard"
      className="h-8 w-[72px] rounded border border-[#24313b]/10 bg-[#f7f9fa]"
    >
      <title>Mastercard</title>
      <rect width="72" height="32" rx="3" fill="#f7f9fa" />
      <circle cx="28" cy="16" r="8" fill="#d96556" fillOpacity="0.9" />
      <circle cx="39" cy="16" r="8" fill="#e7b84e" fillOpacity="0.9" />
      <text x="36" y="29" textAnchor="middle" fill="#596872" fontFamily="Arial, sans-serif" fontSize="4.5" fontWeight="700">
        mastercard
      </text>
    </svg>
  );
}

function ProductGuidance() {
  return (
    <div className="mt-4 grid gap-3">
      <Link className={footerLinkClass} href="/collection#curtains">
        Gluggatjöld
      </Link>
      <Link className={footerLinkClass} href="/collection#roller">
        Rúllugardínur
      </Link>
      <Link className={footerLinkClass} href="/collection#honeycomb">
        Myrkvunargardínur
      </Link>
      <Link className={footerLinkClass} href="/collection#vertical-sheer-shades">
        Lóðréttar vefgardínur
      </Link>
      <Link className={footerLinkClass} href="/collection#sheer-shades">
        Sheer Shades
      </Link>
      <Link className={footerLinkClass} href="/collection#butterfly">
        Fiðrildagardínur
      </Link>
      <CollectionGuidanceDialog
        label="Myrkvunargardínur"
        description="Myrkvun er eiginleiki efnis eða kerfis, ekki sérstakur vöruflokkur."
      >
        Í safninu eru myrkvunarefni og kerfi innan fleiri en eins vöruflokks. Veldu viðeigandi safn til að skoða vörur; upplýsingar um myrkvun koma fram í vörulýsingu og þegar efni er valið.
      </CollectionGuidanceDialog>
      <CollectionGuidanceDialog
        label="Ljósdempandi"
        description="Ljósdempun er eiginleiki efnis eða kerfis, ekki sérstakur vöruflokkur."
      >
        Ljósdempandi efni kallast einnig ljós síað eða ljósdreifandi í vörulistanum. Þau eru í rúllu- og myrkvunarkerfum eftir efnisvali, svo þú getur skoðað viðeigandi söfn hér.
      </CollectionGuidanceDialog>
    </div>
  );
}

function InstallationDialog() {
  return (
    <FooterDialog
      label="Leiðbeiningar um uppsetningu"
      description="Hagnýt samantekt úr leiðbeiningum um mælingar og uppsetningu."
    >
      <div className={dialogTextClass}>
        <h3 className="font-medium text-[#24313b]">Uppsetning</h3>
        <p className="mt-2">
          Festið smella-festingarnar (snap-fit brackets) á vegg eða í loft með skrúfum og töppum sem henta undirlaginu. Hafið festingarnar í beinni línu og smellið brautinni í þær þar til hún læsist. Athugið að allar festingar séu læstar og fylgið uppsetningarleiðbeiningum vörunnar.
        </p>
      </div>
      <div className={dialogTextClass}>
        <h3 className="font-medium text-[#24313b]">Áður en þú setur upp</h3>
        <p className="mt-2">
          Fyrir nákvæm mál skaltu skoða{" "}
          <Link className={dialogLinkClass} href="/maelingar">
            Mælingaleiðbeiningar
          </Link>
          .
        </p>
      </div>
    </FooterDialog>
  );
}

function FaqDialog() {
  return (
    <FooterDialog label="Algengar spurningar (FAQ)" description="Svör við algengum spurningum úr Hjálp & Upplýsingum.">
      <div className={dialogTextClass}>
        <h3 className="font-medium text-[#24313b]">Afhendingartími</h3>
        <p className="mt-2">10–18 virkir dagar (sérframleitt frá grunni).</p>
      </div>
      <div className={dialogTextClass}>
        <h3 className="font-medium text-[#24313b]">Þrif & umhirða</h3>
        <p className="mt-2">Strjúkið af með rökum klút eða rykhreinsið. Efnin eru rykhrindandi (anti-static).</p>
      </div>
      <div className={dialogTextClass}>
        <h3 className="font-medium text-[#24313b]">Hvað ef ég mæli vitlaust?</h3>
        <p className="mt-2">
          Sendu okkur mynd á þjónustuver til staðfestingar <strong className="text-[#24313b]">ÁÐUR</strong> en pantað er. Myndin kemur ekki í stað nákvæmrar mælingar, heldur aðeins til ráðgjafar um aðferð.
        </p>
      </div>
    </FooterDialog>
  );
}

function OrderDialog() {
  return (
    <FooterDialog label="Hvernig virkar pöntunin?" description="Upplýsingar fyrir sérpöntun eftir máli.">
      <p className={dialogTextClass}>
        Veldu vöruflokk og vöru, skoðaðu efni og stillingar og sláðu inn mál þar sem það á við. Reiknivélin uppfærir verðið þegar þú breytir málum, efni, fjölda eða verðlögðum aukahlutum.
      </p>
      <p className={dialogTextClass}>
        Fáðu staðfestingu á afhendingartíma og skilmálum fyrir þína sérpöntun áður en hún er samþykkt.
      </p>
      <a className={dialogLinkClass} href="mailto:hallo@gardinulausnir.is?subject=Spurning%20um%20p%C3%B6ntun">
        Spyrja um pöntun
      </a>
    </FooterDialog>
  );
}

function DeliveryDialog() {
  return (
    <FooterDialog label="Afhending & flutningur" description="Núverandi upplýsingar um sérframleiddar pantanir.">
      <p className={dialogTextClass}>
        Núverandi hjálparupplýsingar segja: 10–18 virkir dagar (sérframleitt frá grunni). Fáðu staðfestingu á afhendingartíma og skilmálum fyrir þína sérpöntun áður en hún er samþykkt.
      </p>
      <a className={dialogLinkClass} href="mailto:hallo@gardinulausnir.is?subject=Afhending%20og%20flutningur">
        Spyrja um afhendingu
      </a>
    </FooterDialog>
  );
}

function PrivacyDialog() {
  return (
    <FooterDialog label="Persónuverndarstefna" description="Heildstæð persónuverndarstefna er ekki birt enn.">
      <p className={dialogTextClass}>
        Heildstæð persónuverndarstefna verður að liggja fyrir áður en söfnun persónuupplýsinga vegna netpantana hefst. Greiðslur á vefnum eru ekki virkar enn.
      </p>
      <p className={dialogTextClass}>
        Hafðu samband við{" "}
        <a className={dialogLinkClass} href="mailto:hallo@gardinulausnir.is?subject=Pers%C3%B3nuuppl%C3%BDsingar">
          hallo@gardinulausnir.is
        </a>{" "}
        vegna spurninga um réttindi eða persónuupplýsingar.
      </p>
    </FooterDialog>
  );
}

export function Footer() {
  return (
    <footer id="footer" data-testid="footer" className="mt-16 border-t border-[#24313b]/10 bg-[#eaf1f5] px-5 py-12 text-[#24313b] md:px-10 md:py-16">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <section aria-labelledby="footer-products-heading">
            <h2 id="footer-products-heading" className="font-serif text-xl tracking-[-.02em]">
              Vöruúrval
            </h2>
            <ProductGuidance />
          </section>

          <section aria-labelledby="footer-help-heading">
            <h2 id="footer-help-heading" className="font-serif text-xl tracking-[-.02em]">
              Leiðbeiningar &amp; Hjálp
            </h2>
            <div className="mt-4 grid gap-3">
              <Link className={footerLinkClass} href="/maelingar">
                Mælingaleiðbeiningar
              </Link>
              <InstallationDialog />
              <FaqDialog />
              <OrderDialog />
            </div>
          </section>

          <section aria-labelledby="footer-information-heading">
            <h2 id="footer-information-heading" className="font-serif text-xl tracking-[-.02em]">
              Upplýsingar &amp; Skilmálar
            </h2>
            <div className="mt-4 grid gap-3">
              <Link className={footerLinkClass} href="/um-okkur">
                Um okkur
              </Link>
              <DeliveryDialog />
              <WarrantyButton label="Ábyrgðarskilmálar" className={`${dialogTriggerClass} inline-flex items-center gap-2`} />
              <PrivacyDialog />
            </div>
          </section>

          <section aria-labelledby="footer-contact-heading">
            <h2 id="footer-contact-heading" className="font-serif text-xl tracking-[-.02em]">
              Hafðu samband
            </h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[#43515a]">
              <a className={footerLinkClass} href="mailto:hallo@gardinulausnir.is">
                hallo@gardinulausnir.is
              </a>
              <p>Svarað alla virka daga (09:00 - 17:00)</p>
              <p>Svartar Nætur ehf.</p>
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-[#24313b]/10 pt-5 text-sm text-[#596872] sm:flex-row sm:items-end sm:justify-between">
          <p>© 2026 Gardínulausnir.is — Sérsmíðaðar gæðagardínur.</p>
          <div className="flex flex-col items-end gap-2">
            <p className="text-[11px] text-[#596872]">Greiðslur ekki virkar enn.</p>
            <div className="flex items-center gap-2" aria-label="Greiðslumerki, ekki virk greiðsla">
              <VisaMark />
              <MastercardMark />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;