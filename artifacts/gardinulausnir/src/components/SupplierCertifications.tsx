import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import greenguard from "@/assets/certifications/greenguard.png";
import greenLeaf from "@/assets/certifications/green-leaf.png";
import oekoTex from "@/assets/certifications/oeko-tex-100.png";
import iso14001 from "@/assets/certifications/iso-14001.png";

const badges = [
  { src: greenguard, alt: "GREENGUARD merki" },
  { src: greenLeaf, alt: "Green Leaf merki (Intertek)" },
  { src: oekoTex, alt: "OEKO-TEX Standard 100 merki" },
  { src: iso14001, alt: "ISO 14001 merki" },
];

type Entry = [name: string, scope: string];

const groups: { title: string; note?: string; items: Entry[] }[] = [
  { title: "Stjórnunarkerfi", items: [["ISO9001", "Stjórnunarkerfi birgis"], ["ISO14001", "Stjórnunarkerfi birgis"], ["ISO45001", "Stjórnunarkerfi birgis"]] },
  {
    title: "Vöruvottanir",
    items: [
      ["GREENGUARD", "Sunscreen-efni"], ["Green Leaf", "Sunscreen-efni"], ["OEKO-TEX 100", "Sunscreen-efni"],
      ["NFPA", "SUNESSE Sunscreen-efni"], ["EN 71", "SUNESSE Sunscreen-efni"], ["CEC", "Innréttingarefni"], ["FCC", "Jafnstraumsmótor"],
    ],
  },
  {
    title: "Prófunarskýrslur",
    note: "Prófunarskýrslur eru niðurstöður prófana, ekki vottanir.",
    items: [
      ["ANSI/WCMA A100", "Rúllugardína"], ["BS EN 13773", "SUNESSE-efni"], ["ISO 4892", "SUNESSE-efni"], ["ASTM E2180", "Sunscreen-efni í rúllugardínur"],
      ["NF P92", "Sunscreen-efni"], ["REACH", "SUNESSE-efni"], ["RoHS", "SUNESSE-efni"], ["PFAS", "SUNESSE-efni"], ["ISO 105", "SUNESSE-efni"], ["AATCC 112", "SUNESSE-efni"],
      ["CP65", "Gardínumótor, AM-lína"], ["FCC", "Mótor; nánara gildissvið óstaðfest"],
    ],
  },
];

export function SupplierCertifications() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex min-h-11 min-w-0 max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 border border-transparent px-2 py-1 text-xs font-medium text-[#24313b] transition hover:border-[#94b3cf] hover:bg-[#e2edf6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6892b8] focus-visible:ring-offset-2">
          <span className="flex items-center gap-1" aria-hidden="true">
            {badges.map((b) => <img key={b.src} src={b.src} alt="" width={28} height={28} className="h-7 w-auto bg-white" />)}
          </span>
          <span>Vottanir og prófanir birgja</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-[#ccd9df] bg-[#f7f9fa] p-6 text-[#24313b]">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle className="font-serif text-3xl">Vottanir og prófanir birgja</DialogTitle>
          <DialogDescription className="text-[#596872]">Yfirlit yfir merki og gögn frá birgja. Gildissvið fer eftir efni, vörulínu og íhlut; þau gilda ekki sjálfkrafa um allar vörur verslunarinnar.</DialogDescription>
        </DialogHeader>
        <p className="border-l-2 border-[#94b3cf] bg-[#edf3f8] px-3 py-2 text-sm text-[#43515a]">Gildistími og tenging við einstakar vörur hafa ekki verið staðfest hér.</p>
        <div className="flex flex-wrap items-center gap-3">
          {badges.map((b) => <img key={b.src} src={b.src} alt={b.alt} width={36} height={36} className="h-9 w-auto bg-white" />)}
        </div>
        {groups.map((g) => (
          <section key={g.title}>
            <h3 className="text-[10px] uppercase tracking-[.16em] text-[#435f79]">{g.title}</h3>
            {g.note && <p className="mt-1 text-xs text-[#596872]">{g.note}</p>}
            <dl className="mt-2 grid gap-x-6 sm:grid-cols-2">
              {g.items.map(([name, scope], i) => (
                <div key={name + i} className="flex flex-wrap justify-between gap-x-3 border-b border-[#d8e1e5] py-1.5 text-sm">
                  <dt className="font-medium">{name}</dt>
                  <dd className="text-[#596872]">{scope}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <p className="text-xs text-[#596872]">Ábyrgð verslunarinnar (5 ára ábyrgð á vélbúnaði og brautum) er óháð þessum gögnum birgja.</p>
        <DialogClose asChild>
          <button type="button" className="mt-2 min-h-11 border border-[#94b3cf] bg-[#e2edf6] px-4 py-2 text-sm hover:bg-[#cddfec]">Loka</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
