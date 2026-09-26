import { Check } from "lucide-react";

type SwatchEntry = { value: string; en?: string };

/** Visual finish per stored colour value. Stored values are never changed. */
const FINISH: Record<string, { is: string; background: string; border: string; check: string }> = {
  "Svartur": { is: "Matt svartur", background: "linear-gradient(145deg,#2c2f33,#15171a)", border: "#15171a", check: "#f7f9fa" },
  "Hvítur": { is: "Hvítur", background: "linear-gradient(145deg,#fbfcfc,#eef1f2)", border: "#b9c6cc", check: "#24313b" },
  "Silfur / Grár": { is: "Silfur / grár (málmur)", background: "linear-gradient(135deg,#eef1f3 0%,#b3bbc1 38%,#dfe4e7 55%,#8f989f 100%)", border: "#8f989f", check: "#1d262d" },
  "Sandur / Beige": { is: "Sandur / beige", background: "linear-gradient(145deg,#dccbad,#c5b08c)", border: "#b09a74", check: "#2b241a" },
  "Krémhvítur": { is: "Krémhvítur", background: "linear-gradient(145deg,#f8f2e3,#ece2cb)", border: "#cfc2a3", check: "#3a3222" },
};

export function RailColorSwatches({
  label,
  options,
  value,
  onChange,
  testId,
}: {
  label: string;
  options: SwatchEntry[];
  value: string;
  onChange: (value: string) => void;
  testId: string;
}) {
  const selected = FINISH[value]?.is ?? value;
  return (
    <div role="group" aria-label={label} data-testid={testId}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[.16em]">{label}</span>
        <span className="truncate text-[10px] text-[#667984]" aria-live="polite">{selected}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const f = FINISH[item.value];
          const active = value === item.value;
          const name = f?.is ?? item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              aria-pressed={active}
              aria-label={`${label}: ${name}`}
              title={item.en ? `${name} / ${item.en}` : name}
              data-testid={`${testId}-${item.value}`}
              className={`relative grid h-11 w-11 place-items-center rounded-full outline-none ring-offset-2 ring-offset-[#f7f9fa] transition focus-visible:ring-2 focus-visible:ring-[#6892b8] md:h-8 md:w-8 ${active ? "ring-2 ring-[#24313b]" : "hover:ring-1 hover:ring-[#90a5ae]"}`}
            >
              <span aria-hidden="true" className="absolute inset-0 rounded-full border" style={{ background: f?.background ?? "#dfe6e9", borderColor: f?.border ?? "#ccd9df" }} />
              {active && <Check aria-hidden="true" size={14} strokeWidth={3} className="relative" style={{ color: f?.check ?? "#24313b" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
