import { useState } from "react";
import { motion } from "framer-motion";

const PRESETS = [
  { label: "Opið · Open", is: "Bæði upprúlluð", sheer: 0, blackout: 0 },
  { label: "Skuggatjald · Sheer", is: "Ljósdempun", sheer: 100, blackout: 0 },
  { label: "Myrkur · Blackout", is: "Fullkomið myrkur", sheer: 100, blackout: 100 },
];

export default function DualRollerDemo() {
  const [sheer, setSheer] = useState(60);
  const [blackout, setBlackout] = useState(0);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  function applyPreset(idx: number) {
    const p = PRESETS[idx];
    setSheer(p.sheer);
    setBlackout(p.blackout);
    setActivePreset(idx);
  }

  function handleSheer(v: number) {
    setSheer(v);
    setActivePreset(null);
  }

  function handleBlackout(v: number) {
    setBlackout(v);
    setActivePreset(null);
  }

  const lightLevel = Math.max(0, 1 - sheer / 100 * 0.5 - blackout / 100 * 0.5);
  const ambientLabel =
    blackout >= 90 ? "Fullkomið myrkur · Total blackout" :
    sheer >= 70 ? "Dempað ljós · Filtered light" :
    "Náttúrulegt ljós · Natural light";

  return (
    <div className="bg-secondary/30 rounded-2xl border border-border/40 overflow-hidden mb-8">
      <div className="px-5 pt-5 pb-1">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/60 font-semibold mb-0.5">Sýnikennsla · How it works</p>
        <h3 className="font-serif text-xl font-bold">Prófaðu sjálfur — hvernig Day &amp; Night virkar</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Dragðu sleðana til að sjá tvö lög í samspili</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 p-5 items-start">
        {/* Window visualization */}
        <div className="mx-auto sm:mx-0">
          <div
            className="relative overflow-hidden rounded-sm"
            style={{ width: 160, height: 220, border: "10px solid #3a2e22", borderRadius: 6, boxShadow: "0 4px 24px rgba(0,0,0,0.18), inset 0 0 0 2px rgba(255,255,255,0.08)" }}
          >
            {/* Sky / outside scene */}
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background: `linear-gradient(180deg, hsl(210 80% ${40 + lightLevel * 35}%) 0%, hsl(200 60% ${55 + lightLevel * 25}%) 60%, hsl(120 30% ${35 + lightLevel * 20}%) 100%)`,
              }}
            />
            {/* Sun */}
            <div
              className="absolute rounded-full transition-all duration-500"
              style={{
                width: 28, height: 28,
                top: 22, left: "50%", transform: "translateX(-50%)",
                background: `radial-gradient(circle, hsl(50 100% 80%) 0%, hsl(40 100% 65%) 60%, transparent 100%)`,
                opacity: lightLevel * 0.9 + 0.05,
                filter: `blur(${(1 - lightLevel) * 3}px)`,
              }}
            />
            {/* Ground/floor */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-500"
              style={{ height: 45, background: `hsl(30 20% ${22 + lightLevel * 18}%)` }}
            />

            {/* Sheer blind — front layer */}
            <motion.div
              className="absolute top-0 left-0 w-full"
              animate={{ height: `${sheer}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              style={{ zIndex: 2 }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: "rgba(240,232,220,0.55)",
                  backdropFilter: "blur(1.5px)",
                }}
              />
              {/* Honeycomb texture lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{ top: `${(i + 1) * 12.5}%`, height: 1, background: "rgba(180,160,140,0.35)" }}
                />
              ))}
              {/* Rail */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-stone-300/80 rounded-sm" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </motion.div>

            {/* Blackout blind — back layer */}
            <motion.div
              className="absolute top-0 left-0 w-full"
              animate={{ height: `${blackout}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              style={{ zIndex: 1 }}
            >
              <div className="w-full h-full" style={{ background: "#1e1a16" }} />
              {/* Rail */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-stone-700/90 rounded-sm" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
            </motion.div>

            {/* Frame mullions */}
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }} />
          </div>

          {/* Ambient label */}
          <p className="text-[10px] text-center text-muted-foreground mt-2 leading-tight" style={{ width: 160 }}>
            {ambientLabel}
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-5 w-full">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(i)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                  activePreset === i
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 hover:border-primary/50 bg-background text-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sheer slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-xs font-semibold">Skuggatjald</span>
                <span className="ml-1 text-[11px] text-muted-foreground">Sheer / front layer</span>
              </div>
              <span className="text-xs tabular-nums font-mono text-muted-foreground">{sheer}%</span>
            </div>
            <div className="relative h-5 flex items-center">
              <div className="absolute left-0 right-0 h-2 rounded-full bg-border/50" />
              <div
                className="absolute left-0 h-2 rounded-full transition-all duration-75"
                style={{ width: `${sheer}%`, background: "rgba(210,195,178,0.9)" }}
              />
              <input
                type="range" min={0} max={100} value={sheer}
                onChange={(e) => handleSheer(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
                aria-label="Sheer blind position"
              />
            </div>
          </div>

          {/* Blackout slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-xs font-semibold">Myrkvunarhjúpur</span>
                <span className="ml-1 text-[11px] text-muted-foreground">Blackout / back layer</span>
              </div>
              <span className="text-xs tabular-nums font-mono text-muted-foreground">{blackout}%</span>
            </div>
            <div className="relative h-5 flex items-center">
              <div className="absolute left-0 right-0 h-2 rounded-full bg-border/50" />
              <div
                className="absolute left-0 h-2 rounded-full transition-all duration-75"
                style={{ width: `${blackout}%`, background: "#2c2420" }}
              />
              <input
                type="range" min={0} max={100} value={blackout}
                onChange={(e) => handleBlackout(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
                aria-label="Blackout blind position"
              />
            </div>
          </div>

          {/* Explainer callout */}
          <div className="bg-background/60 rounded-lg border border-border/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Hvernig virkar þetta?</span>{" "}
            Skuggatjaldið (fremra lag) dregur úr ljósi en leyfir útsýni. Myrkvunarhjúpurinn (aftara lag) lokar ljósi alveg — fullkomið fyrir svefnherbergi.
          </div>
        </div>
      </div>
    </div>
  );
}
