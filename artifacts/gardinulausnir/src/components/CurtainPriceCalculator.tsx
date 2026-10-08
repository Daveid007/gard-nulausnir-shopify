import { useEffect, useRef, useState } from "react";
import {
  calculateCurtainPrice,
  CURTAIN_FABRIC_USD,
  type CurtainControl,
  type CurtainStyle,
} from "@/lib/curtainPricing";

export type CurtainQuote = {
  widthCm: number;
  heightCm: number;
  quantity: number;
  style: CurtainStyle;
  control: CurtainControl;
  unitPrice: number;
  totalPrice: number;
};

export function isCurtainPricingSupported(productId: string) {
  return Object.hasOwn(CURTAIN_FABRIC_USD, productId);
}

export const formatIsk = (n: number) => `${n.toLocaleString("is-IS")} kr.`;
export const STYLE_LABEL: Record<CurtainStyle, string> = { standard: "Hefðbundin", "s-wave": "S-bylgja (S-wave)" };
export const CONTROL_LABEL: Record<CurtainControl, string> = { manual: "Handvirk", motorized: "Rafdrifin (mótor + fjarstýring)" };

export function curtainQuoteLines(q: CurtainQuote): string[] {
  return [
    "",
    "Áætlað verð (reiknivél):",
    `Breidd: ${q.widthCm} cm`,
    `Hæð: ${q.heightCm} cm`,
    `Útfærsla: ${STYLE_LABEL[q.style]}`,
    `Stjórnun: ${CONTROL_LABEL[q.control]}`,
    `Fjöldi: ${q.quantity}`,
    ...(q.quantity > 1 ? [`Verð á stykki: ${formatIsk(q.unitPrice)}`] : []),
    `Áætlað heildarverð: ${formatIsk(q.totalPrice)} (m. vsk og sendingu, án uppsetningar)`,
    "Ég skil að þetta er áætlun og að hæð og framleiðsla eru staðfest eftir fyrirspurn.",
  ];
}

const field = "mt-2 w-full border border-[#ccd9df] bg-[#f7f9fa] px-3 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6892b8]";
const label = "text-[10px] uppercase tracking-[.16em] text-[#667984]";

function Toggle<T extends string>({ value, options, onChange, name }: {
  value: T; options: [T, string][]; onChange: (v: T) => void; name: string;
}) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={name}>
      {options.map(([v, text]) => (
        <button key={v} type="button" data-testid={`curtain-calc-${name}-${v}`} aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`border px-3 py-3 text-left text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6892b8] ${value === v ? "border-[#24313b] bg-[#e8eef1]" : "border-[#ccd9df] hover:border-[#7e9bab]"}`}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function CurtainPriceCalculator({ productId, onQuoteChange }: {
  productId: string; onQuoteChange: (q: CurtainQuote | null) => void;
}) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [qty, setQty] = useState("1");
  const [style, setStyle] = useState<CurtainStyle>("standard");
  const [control, setControl] = useState<CurtainControl>("manual");

  let quote: CurtainQuote | null = null;
  let error: string | null = null;
  const touched = width.trim() !== "" || height.trim() !== "";
  if (touched) {
    const input = { productId, widthCm: Number(width.replace(",", ".")), heightCm: Number(height.replace(",", ".")), quantity: Number(qty), style, control };
    try {
      if (width.trim() === "" || height.trim() === "" || qty.trim() === "") throw new Error("Sláðu inn jákvæð mál og heilan fjölda.");
      const r = calculateCurtainPrice(input);
      quote = { ...input, unitPrice: r.unitPrice, totalPrice: r.totalPrice };
    } catch (e) {
      error = e instanceof Error ? e.message : "Ekki tókst að reikna verð.";
    }
  }
  const key = quote ? JSON.stringify(quote) : "null";
  const cbRef = useRef(onQuoteChange);
  cbRef.current = onQuoteChange;
  useEffect(() => { cbRef.current(key === "null" ? null : JSON.parse(key) as CurtainQuote); }, [key]);

  return (
    <div data-testid="curtain-calculator" className="border-b border-[#ccd9df] py-7">
      <h2 className="text-[10px] uppercase tracking-[.2em]">Reiknaðu áætlað verð</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className={label}>Breidd (cm)
          <input data-testid="curtain-calc-width" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} className={field} placeholder="t.d. 240" />
        </label>
        <label className={label}>Hæð (cm)
          <input data-testid="curtain-calc-height" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className={field} placeholder="t.d. 260" />
        </label>
      </div>
      <label className={`${label} mt-4 block`}>Fjöldi
        <input data-testid="curtain-calc-quantity" type="number" min={1} step={1} value={qty} onChange={(e) => setQty(e.target.value)} className={field} />
      </label>
      <p className={`${label} mt-4`}>Útfærsla</p>
      <Toggle name="style" value={style} onChange={setStyle} options={[["standard", STYLE_LABEL.standard], ["s-wave", STYLE_LABEL["s-wave"]]]} />
      <p className={`${label} mt-4`}>Stjórnun</p>
      <Toggle name="control" value={control} onChange={setControl} options={[["manual", CONTROL_LABEL.manual], ["motorized", CONTROL_LABEL.motorized]]} />

      <div className="mt-6 bg-[#e8eef1] p-5" aria-live="polite">
        {quote ? (
          <>
            <p className={label}>Áætlað heildarverð</p>
            <p data-testid="curtain-calc-total" className="mt-2 font-serif text-3xl tracking-tight">{formatIsk(quote.totalPrice)}</p>
            {quote.quantity > 1 && (
              <p data-testid="curtain-calc-unit" className="mt-1 text-sm text-[#5a6b74]">{formatIsk(quote.unitPrice)} á stykki · {quote.quantity} stk.</p>
            )}
          </>
        ) : error ? (
          <p data-testid="curtain-calc-error" role="alert" className="text-sm text-[#9a3b3b]">{error}</p>
        ) : (
          <p data-testid="curtain-calc-empty" className="text-sm text-[#5a6b74]">Sláðu inn breidd og hæð til að sjá áætlað verð.</p>
        )}
        <p data-testid="curtain-calc-includes" className="mt-4 text-xs leading-5 text-[#5a6b74]">
          Innifalið: efni, saumaskapur, braut og krókar{control === "motorized" ? ", mótor og fjarstýring" : ""}, sending og virðisaukaskattur. Uppsetning er ekki innifalin.
        </p>
        <p data-testid="curtain-calc-disclaimer" className="mt-2 text-xs leading-5 text-[#5a6b74]">
          Þetta er áætlun, ekki pöntun. Hæð og hvort framleiðsla sé möguleg eru staðfest eftir fyrirspurn áður en endanlegt verð liggur fyrir.
        </p>
      </div>
    </div>
  );
}
