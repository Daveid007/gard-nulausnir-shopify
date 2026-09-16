import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const measurementAdvice =
  "Gott ráð: Notið alltaf málband úr málmi (ekki saumamálband) og gefið upp mál í sentimetrum (cm) eða millimetrum (mm).";

function InsideMountDiagram() {
  return (
    <svg
      viewBox="0 0 520 280"
      role="img"
      aria-labelledby="inside-mount-diagram-title inside-mount-diagram-description"
      className="h-auto w-full"
    >
      <title id="inside-mount-diagram-title">Þrjár mælingar innan í gluggaopi</title>
      <desc id="inside-mount-diagram-description">
        Þrjár láréttar breiddarlínur efst, í miðju og neðst og þrjár lóðréttar hæðarlínur vinstra megin, í miðju og hægra megin.
      </desc>
      <rect x="112" y="32" width="296" height="216" fill="#f7f9fa" stroke="#24313b" strokeWidth="3" />
      <rect x="132" y="52" width="256" height="176" fill="#dcecf3" stroke="#89abc2" strokeWidth="2" />
      <g stroke="#557b9e" strokeWidth="2" strokeDasharray="6 5">
        <line x1="132" y1="52" x2="388" y2="52" />
        <line x1="132" y1="140" x2="388" y2="140" />
        <line x1="132" y1="228" x2="388" y2="228" />
        <line x1="132" y1="52" x2="132" y2="228" />
        <line x1="260" y1="52" x2="260" y2="228" />
        <line x1="388" y1="52" x2="388" y2="228" />
      </g>
      <g stroke="#24313b" strokeWidth="1.5">
        <line x1="132" y1="40" x2="388" y2="40" />
        <line x1="132" y1="36" x2="132" y2="44" />
        <line x1="388" y1="36" x2="388" y2="44" />
        <line x1="100" y1="52" x2="100" y2="228" />
        <line x1="96" y1="52" x2="104" y2="52" />
        <line x1="96" y1="228" x2="104" y2="228" />
      </g>
      <g fill="#24313b" fontFamily="Outfit, sans-serif" fontSize="14">
        <text x="260" y="27" textAnchor="middle">Breidd</text>
        <text x="74" y="144" textAnchor="middle" transform="rotate(-90 74 144)">Hæð</text>
        <text x="398" y="57">efst</text>
        <text x="398" y="145">miðja</text>
        <text x="398" y="233">neðst</text>
        <text x="116" y="68" textAnchor="end">vinstri</text>
        <text x="116" y="145" textAnchor="end">miðja</text>
        <text x="116" y="225" textAnchor="end">hægri</text>
      </g>
    </svg>
  );
}

function OutsideMountDiagram() {
  return (
    <svg
      viewBox="0 0 520 280"
      role="img"
      aria-labelledby="outside-mount-diagram-title outside-mount-diagram-description"
      className="h-auto w-full"
    >
      <title id="outside-mount-diagram-title">Mæling utan á gluggakarminum eða vegg</title>
      <desc id="outside-mount-diagram-description">
        Gardína skarast á gluggaopið til vinstri, hægri, fyrir ofan og fyrir neðan.
      </desc>
      <rect x="136" y="74" width="248" height="140" fill="#dcecf3" stroke="#89abc2" strokeWidth="2" />
      <rect x="106" y="42" width="308" height="204" fill="none" stroke="#24313b" strokeWidth="3" />
      <g stroke="#557b9e" strokeWidth="2">
        <line x1="106" y1="42" x2="414" y2="42" />
        <line x1="106" y1="246" x2="414" y2="246" />
        <line x1="106" y1="42" x2="106" y2="246" />
        <line x1="414" y1="42" x2="414" y2="246" />
      </g>
      <g stroke="#24313b" strokeWidth="1.5" markerStart="url(#outside-arrow)" markerEnd="url(#outside-arrow)">
        <line x1="106" y1="24" x2="414" y2="24" />
        <line x1="86" y1="42" x2="86" y2="246" />
      </g>
      <g fill="#24313b" fontFamily="Outfit, sans-serif" fontSize="14">
        <text x="260" y="17" textAnchor="middle">+ 5–10 cm hvorri hlið</text>
        <text x="60" y="144" textAnchor="middle" transform="rotate(-90 60 144)">+ 10–15 cm ofan og neðan</text>
        <text x="260" y="153" textAnchor="middle">gluggaop</text>
      </g>
      <defs>
        <marker id="outside-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M 7 0 L 0 3.5 L 7 7" fill="none" stroke="#24313b" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

function MeasurementGuideBody({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-6" : "space-y-10"}>
      <div className={`grid items-start gap-5 ${compact ? "" : "lg:grid-cols-2"}`}>
      <section aria-labelledby="inside-mount-heading" className="space-y-5 border border-[#ccd9df] bg-white/50 p-5 md:p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-[#6892b8]">A</p>
          <h2 id="inside-mount-heading" className="mt-1 font-serif text-3xl leading-tight tracking-[-.04em]">
            Innan á karm
          </h2>
          <p className="mt-1 text-sm text-[#667984]">(Inside Mount / Í fellingu)</p>
        </div>
        <div className="grid gap-5">
          <div className="order-2 space-y-4 md:order-1">
            <div className="rounded-none border border-[#ccd9df] bg-[#f7f9fa] p-4">
              <h3 className="text-sm font-medium">Breidd</h3>
              <p className="mt-1 text-sm leading-6 text-[#596872]">
                Mælið breiddina á 3 stöðum: efst, fyrir miðju og neðst. Skráið <strong>minnsta málið</strong> (MIN).
              </p>
            </div>
            <div className="rounded-none border border-[#ccd9df] bg-[#f7f9fa] p-4">
              <h3 className="text-sm font-medium">Hæð</h3>
              <p className="mt-1 text-sm leading-6 text-[#596872]">
                Mælið hæðina á 3 stöðum: vinstra megin, fyrir miðju og hægra megin. Skráið <strong>stærsta málið</strong> (MAX).
              </p>
            </div>
            <p className="border-l-2 border-[#a2c2e2] pl-4 text-sm leading-6 text-[#596872]">
              <strong>Lágmarksdýpt karms: 6–7 cm.</strong> Mælið lausa dýpt frá frambrún karms og athugið hvort handföng eða aðrar hindranir séu fyrir. Nákvæm dýpt fer eftir gardínugerð og festingum; fáið hana staðfesta fyrir pöntun.
            </p>
            <aside role="note" data-testid="factory-tolerance-notice" className="border border-[#a2c2e2] bg-[#eaf1f5] p-4 text-sm leading-6">
              <p className="mb-2 font-medium">Vikmörk við innanáfestingu</p>
              <p>Gefið upp nákvæm mál á opi. Verksmiðjan dregur sjálfkrafa frá rétt vikmörk fyrir festingar og vélbúnað.</p>
              <p className="mt-2 text-[#596872]">Ekki draga vikmörk frá sjálf. Fyrir utanáfestingu fylgið leiðbeiningunum um skörun hér að neðan.</p>
            </aside>
          </div>
          <div className="order-1 border border-[#ccd9df] bg-[#eaf1f5] p-3 md:order-2">
            <InsideMountDiagram />
          </div>
        </div>
      </section>

      <section aria-labelledby="outside-mount-heading" className="space-y-5 border border-[#ccd9df] bg-white/50 p-5 md:p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-[#6892b8]">B</p>
          <h2 id="outside-mount-heading" className="mt-1 font-serif text-3xl leading-tight tracking-[-.04em]">
            Utan á karm / Vegg
          </h2>
          <p className="mt-1 text-sm text-[#667984]">(Outside Mount / Yfir op)</p>
        </div>
        <div className="grid gap-5">
          <div className="space-y-4">
            <div className="rounded-none border border-[#ccd9df] bg-[#f7f9fa] p-4">
              <h3 className="text-sm font-medium">Breidd gluggaops</h3>
              <p className="mt-1 text-sm leading-6 text-[#596872]">
                Mælið breidd opsins og bætið við <strong>5–10 cm hvoru megin</strong>, samtals <strong>10–20 cm</strong>, til að koma í veg fyrir ljósleka meðfram hliðum.
              </p>
            </div>
            <div className="rounded-none border border-[#ccd9df] bg-[#f7f9fa] p-4">
              <h3 className="text-sm font-medium">Hæð gluggaops</h3>
              <p className="mt-1 text-sm leading-6 text-[#596872]">
                Mælið hæð opsins og bætið við að minnsta kosti <strong>10–15 cm að ofan og neðan</strong> svo gardínan hylji opið vel.
              </p>
            </div>
          </div>
          <div className="border border-[#ccd9df] bg-[#eaf1f5] p-3">
            <OutsideMountDiagram />
          </div>
        </div>
      </section>
      </div>

      <section aria-labelledby="calculator-measurements-heading" className="space-y-4 border-t border-[#ccd9df] pt-8">
        <h2 id="calculator-measurements-heading" className="font-serif text-2xl tracking-[-.03em]">
          Mál í reiknivél
        </h2>
        <p className="text-sm leading-6 text-[#596872]">
          Reiknivélarnar taka við málum í <strong>cm</strong>. Ef þið mælið í mm, deilið með 10 áður en þið sláið inn (1000 mm = 100 cm). Þetta breytir ekki verði; aðeins einingin.
        </p>
      </section>

      <aside className="border border-[#a2c2e2] bg-[#eaf1f5] p-5" role="note">
        <p className="text-sm leading-6 text-[#24313b]">{measurementAdvice}</p>
      </aside>

      <div className="border-t border-[#ccd9df] pt-7">
        <a
          href="mailto:hallo@gardinulausnir.is"
          className="inline-flex items-center border-b border-[#557b9e] pb-1 text-sm font-medium text-[#557b9e] transition-colors hover:border-[#24313b] hover:text-[#24313b]"
        >
          Hafðu samband ef þú ert í vafa
        </a>
      </div>
    </div>
  );
}

function NumberedMeasurementSteps({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={`grid gap-3 sm:grid-cols-3 ${compact ? "mb-6" : "mb-10"}`} aria-label="Skref við mælingu">
      {[
        ["Veljið uppsetningu", "Ákveðið hvort gardínan fari innan í gluggaop eða utan á karm / vegg."],
        ["Mælið þrisvar", "Mælið breidd og hæð á þeim stöðum sem lýst er hér fyrir neðan."],
        ["Skráið rétt mál", "Takið MIN eða MAX eftir leiðbeiningunum og setjið síðan málið í reiknivélina."],
      ].map(([title, description], index) => (
        <li key={title} className="border border-[#ccd9df] bg-[#eaf1f5] p-4">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#a2c2e2] text-xs font-medium" aria-hidden="true">
            {index + 1}
          </span>
          <h2 className="mt-4 text-sm font-medium">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#596872]">{description}</p>
        </li>
      ))}
    </ol>
  );
}

export function MeasurementGuideContent({ compact = false }: { compact?: boolean }) {
  return (
    <div data-testid="measurement-guide-content">
      {!compact && (
        <header className="mb-10 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[.24em] text-[#6892b8]">Leiðbeiningar</p>
          <h1 className="mt-3 font-serif text-5xl leading-[.94] tracking-[-.06em] md:text-6xl">Hvernig á að mæla?</h1>
          <p className="mt-5 text-base leading-7 text-[#596872]">
            Nákvæm mæling er fyrsta skrefið að fallegri og vel passandi gardínu.
          </p>
        </header>
      )}
      <NumberedMeasurementSteps compact={compact} />
      <MeasurementGuideBody compact={compact} />
    </div>
  );
}

export function MeasurementGuideTrigger() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          data-testid="measurement-guide-trigger"
          aria-label="📐 Mælingaleiðbeiningar"
          className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[.12em] text-[#557b9e] transition-colors hover:text-[#24313b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6892b8] focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">📐</span>
          Mælingaleiðbeiningar
        </button>
      </DialogTrigger>
      <DialogContent
        data-testid="measurement-guide-dialog"
        className="max-w-3xl border-[#ccd9df] bg-[#f7f9fa] p-5 text-[#24313b] sm:p-8"
      >
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-serif text-3xl tracking-[-.04em]">Mælingaleiðbeiningar</DialogTitle>
          <DialogDescription className="text-sm text-[#667984]">
            Veldu innan í gluggaop eða utan á gluggakarm / vegg eftir uppsetningu.
          </DialogDescription>
        </DialogHeader>
        <MeasurementGuideContent compact />
      </DialogContent>
    </Dialog>
  );
}
