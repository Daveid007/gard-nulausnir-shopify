import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const INK = "#24313b";
const WALL = "#e2edf1";
const GLASS = "#cfe0ea";
const FABRIC = "#f3efe6";
const ACCENT = "#6892b8";
const PAD = "#3a3f44";

type Kind = "inside" | "outside" | "nodrill";

const META: Record<Kind, { title: string; caption: string; alt: string }> = {
  inside: {
    title: "Innfelld",
    caption: "Staðsetning: gardínan situr inni í gluggaopinu.",
    alt: "Skýringarmynd: Honeycomb-gardína innfelld, efri braut og gardína eru innan við hliðarkarma gluggaopsins.",
  },
  outside: {
    title: "Utanáliggjandi",
    caption: "Staðsetning: gardínan er fest utan við opið, ofan við og fyrir framan það.",
    alt: "Skýringarmynd: Honeycomb-gardína utanáliggjandi, efri braut fest á vegg ofan við gluggaopið og gardínan hylur opið að framan.",
  },
  nodrill: {
    title: "Án borunar (aðeins innfelld)",
    caption: "Festing: þrýstistöng spennt á milli hliðarkarmanna með stömum gúmmípúðum á endunum.",
    alt: "Skýringarmynd: Honeycomb án borunar, þrýstistöng spennt út á milli hliðarkarma inni í gluggaopinu, með gúmmípúða á hvorum enda sem grípa í karminn.",
  },
};

function Pleats({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const lines = [];
  for (let yy = y + 8; yy < y + h; yy += 8) lines.push(<line key={yy} x1={x} y1={yy} x2={x + w} y2={yy} stroke="#d6cfbf" strokeWidth="1" />);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={FABRIC} stroke="#c9c0ad" />
      {lines}
    </g>
  );
}

function Opening() {
  return (
    <g>
      <rect x="0" y="0" width="240" height="180" fill={WALL} />
      <rect x="60" y="40" width="120" height="120" fill={GLASS} stroke={INK} strokeWidth="2" />
      <line x1="120" y1="40" x2="120" y2="160" stroke={INK} strokeOpacity=".25" />
      <rect x="54" y="160" width="132" height="6" fill="#fff8" stroke={INK} strokeWidth="1" />
    </g>
  );
}

export function MountDiagram({ kind, large = false }: { kind: Kind; large?: boolean }) {
  const m = META[kind];
  return (
    <svg viewBox="0 0 240 180" role="img" aria-label={m.alt} className={large ? "h-auto w-full" : "h-auto w-full"}>
      <title>{m.alt}</title>
      <Opening />
      {kind === "inside" && (
        <g>
          <rect x="62" y="42" width="116" height="8" fill={INK} />
          <Pleats x={62} y={50} w={116} h={70} />
          <rect x="62" y="120" width="116" height="5" fill={INK} />
          <path d="M60 32 v-6 M180 32 v-6 M60 29 H180" stroke={ACCENT} strokeWidth="1.5" fill="none" />
          <text x="120" y="22" textAnchor="middle" fontSize="10" fill={INK}>innan opsins</text>
        </g>
      )}
      {kind === "outside" && (
        <g>
          <rect x="44" y="24" width="152" height="9" fill={INK} />
          <Pleats x={44} y={33} w={152} h={92} />
          <rect x="44" y="125" width="152" height="5" fill={INK} />
          <rect x="60" y="40" width="120" height="85" fill="none" stroke={INK} strokeDasharray="3 3" strokeOpacity=".6" />
          <text x="120" y="16" textAnchor="middle" fontSize="10" fill={INK}>ofan við og fyrir framan opið</text>
        </g>
      )}
      {kind === "nodrill" && (
        <g>
          <rect x="70" y="46" width="100" height="6" rx="3" fill={INK} />
          <rect x="62" y="43" width="8" height="12" rx="2" fill={PAD} />
          <rect x="170" y="43" width="8" height="12" rx="2" fill={PAD} />
          <Pleats x={70} y={55} w={100} h={65} />
          <rect x="70" y="120" width="100" height="5" fill={INK} />
          <path d="M100 30 H70 m6 -4 l-6 4 6 4 M140 30 H170 m-6 -4 l6 4 -6 4" stroke={ACCENT} strokeWidth="1.5" fill="none" />
          <text x="120" y="33" textAnchor="middle" fontSize="9" fill={INK}>spennt út</text>
          <path d="M62 56 L36 76" stroke={INK} strokeWidth="1" />
          <text x="6" y="88" fontSize="9" fill={INK}>gúmmípúði</text>
          <path d="M178 56 L204 76" stroke={INK} strokeWidth="1" />
          <text x="182" y="88" fontSize="9" fill={INK}>gúmmípúði</text>
        </g>
      )}
    </svg>
  );
}

function Figure({ kind }: { kind: Kind }) {
  const m = META[kind];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" data-testid={`hc-mount-illustration-${kind}`} aria-label={`Stækka mynd: ${m.title}`} className="group flex w-full flex-col border border-[#ccd9df] bg-[#f7f9fa] p-2 text-left transition-colors hover:bg-[#e2edf1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#24313b]">
          <MountDiagram kind={kind} />
          <span className="mt-1.5 text-[11px] font-semibold text-[#24313b]">{m.title}</span>
          <span className="text-[11px] leading-snug text-[#52636f]">{m.caption}</span>
          <span className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#6892b8] group-hover:underline">Stækka</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#f7f9fa]">
        <DialogTitle>{m.title}</DialogTitle>
        <DialogDescription>{m.caption}</DialogDescription>
        <MountDiagram kind={kind} large />
      </DialogContent>
    </Dialog>
  );
}

export function HoneycombMountIllustrations() {
  return (
    <div className="space-y-2" data-testid="hc-mount-illustrations">
      <p className="text-[10px] uppercase tracking-[.14em] text-[#24313b]">Staðsetning</p>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
        <Figure kind="inside" />
        <Figure kind="outside" />
      </div>
      <p className="text-[10px] uppercase tracking-[.14em] text-[#24313b]">Festing án borunar — aðeins með innfelldri staðsetningu</p>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
        <Figure kind="nodrill" />
      </div>
    </div>
  );
}
