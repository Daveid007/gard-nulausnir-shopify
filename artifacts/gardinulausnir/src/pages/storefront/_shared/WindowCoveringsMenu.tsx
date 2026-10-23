import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { collectionHref } from "./collectionCategories";

type MenuLink = { label: string; href: string; note: string };
type MenuColumn = { title: string; links: MenuLink[] };

export const windowCoveringColumns: MenuColumn[] = [
  {
    title: "Mjúk efni",
    links: [
      { label: "Taugluggatjöld", href: collectionHref("curtains"), note: "Efni og litasýnishorn" },
      { label: "Lóðréttar vefgardínur", href: collectionHref("vertical-sheer"), note: "Létt, lóðrétt birta" },
      { label: "Strimlar", href: collectionHref("sheer-shades"), note: "Dagsbirta og næði" },
    ],
  },
  {
    title: "Myrkvun og rúllur",
    links: [
      { label: "Honeycomb", href: collectionHref("honeycomb"), note: "Einangrun og myrkvun" },
      { label: "Rúllugardínur", href: collectionHref("roller"), note: "Með eða án hliðarlista" },
    ],
  },
  {
    title: "Rammakerfi",
    links: [
      { label: "WINdoûr — Rammagardínur", href: collectionHref("windour"), note: "Single og duo" },
      { label: "ROLdoûr — Rúllukerfi í ramma", href: collectionHref("roldour"), note: "Fyrir glugga og hurðir" },
    ],
  },
];

const allHref = collectionHref("all");

export function WindowCoveringsDesktop({ panelTop = 72 }: { panelTop?: number } = {}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const focusFirst = () => requestAnimationFrame(() => wrapRef.current?.querySelector<HTMLAnchorElement>(`#${CSS.escape(panelId)} a`)?.focus());

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(e) => { if (open && !e.currentTarget.contains(e.relatedTarget as Node | null) && e.relatedTarget) setOpen(false); }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); focusFirst(); } }}
        className={`flex items-center gap-1.5 uppercase tracking-[.16em] transition-colors hover:text-[#6892b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6892b8] ${open ? "text-[#24313b]" : ""}`}
      >
        Gluggatjöld
        <ChevronDown size={12} strokeWidth={1.5} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        style={{ top: panelTop }}
        className="fixed left-1/2 z-40 w-[min(960px,calc(100vw-40px))] -translate-x-1/2 border border-[#24313b]/10 bg-[#f7f9fa] shadow-[0_24px_60px_-30px_rgba(36,49,59,.35)]"
      >
        <div className="grid grid-cols-[1fr_1fr_1fr_220px] normal-case tracking-normal">
          {windowCoveringColumns.map((col) => (
            <div key={col.title} className="border-r border-[#24313b]/8 px-7 py-7">
              <p className="mb-4 text-[9px] uppercase tracking-[.2em] text-[#71808a]">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8]">
                      <span className="block font-serif text-[16px] leading-tight text-[#24313b] transition-colors group-hover:text-[#6892b8]">{l.label}</span>
                      <span className="mt-0.5 block text-[11px] text-[#71808a]">{l.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col justify-between bg-[#edf3f8] px-7 py-7">
            <p className="font-serif text-[18px] leading-snug text-[#24313b]">Allt sérsmíðað eftir máli gluggans.</p>
            <Link href={allHref} onClick={() => setOpen(false)} className="mt-6 inline-flex items-center justify-between gap-2 border-b border-[#24313b]/30 pb-2 text-[10px] uppercase tracking-[.18em] text-[#24313b] hover:text-[#6892b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6892b8]">
              Allar vörur <ArrowRight size={14} strokeWidth={1.25} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WindowCoveringsMobile({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="border-b border-[#24313b]/10 pb-2">
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between py-2 text-[11px] uppercase tracking-[.18em]">
        Gluggatjöld <ChevronDown size={14} strokeWidth={1.5} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={panelId} hidden={!open} className="pb-2 pl-3">
        {windowCoveringColumns.map((col) => (
          <div key={col.title} className="mt-3">
            <p className="text-[9px] uppercase tracking-[.2em] text-[#71808a]">{col.title}</p>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} onClick={onNavigate} className="block break-words py-1.5 text-[13px] text-[#24313b]">{l.label}</Link>
            ))}
          </div>
        ))}
        <Link href={allHref} onClick={onNavigate} className="mt-3 inline-flex items-center gap-2 py-1.5 text-[10px] uppercase tracking-[.18em] text-[#24313b]">Allar vörur <ArrowRight size={13} /></Link>
      </div>
    </div>
  );
}
