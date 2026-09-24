import { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { StorefrontLayout } from "@/components/legacy-calculators/StorefrontLayout";
import {
  OPEN_ROLL_EXAMPLE_COLORS,
  OPEN_ROLL_EXAMPLE_HOLDERS,
  OPEN_ROLL_EXAMPLE_RAILS,
  quoteOpenRollExample,
  type OpenRollExampleColorId,
  type OpenRollExampleHolderId,
  type OpenRollExampleRailId,
} from "@/lib/openRollExamplePricing";

const isk = (value: number) => `${Math.round(value).toLocaleString("is-IS")} kr.`;

export default function OpenRollExampleCalculator({ product }: { product: any }) {
  const [widthCm, setWidthCm] = useState("120");
  const [heightCm, setHeightCm] = useState("160");
  const [quantity, setQuantity] = useState(1);
  const [colorId, setColorId] = useState<OpenRollExampleColorId>("c-white");
  const [railId, setRailId] = useState<OpenRollExampleRailId>("br-sewn");
  const [holderId, setHolderId] = useState<OpenRollExampleHolderId>("h-std-white");
  const [sideTracks, setSideTracks] = useState(false);

  const quote = useMemo(() => quoteOpenRollExample({
    widthCm: Number(widthCm),
    heightCm: Number(heightCm),
    quantity,
    colorId,
    railId,
    holderId,
  }), [colorId, heightCm, holderId, quantity, railId, widthCm]);

  const color = OPEN_ROLL_EXAMPLE_COLORS.find((option) => option.id === colorId)!;
  const rail = OPEN_ROLL_EXAMPLE_RAILS.find((option) => option.id === railId)!;
  const holder = OPEN_ROLL_EXAMPLE_HOLDERS.find((option) => option.id === holderId)!;
  const mailBody = quote.ok
    ? [
        "Óska eftir staðfestu tilboði í opið rúllukerfi.",
        `Mál (dæmi): ${widthCm} × ${heightCm} cm`,
        `Litur (dæmi): ${color.label}`,
        `Neðristika (dæmi): ${rail.label}`,
        `Festingar (dæmi): ${holder.label}`,
        `Magn: ${quantity}`,
        `Hliðarlistar: ${sideTracks ? "Óskað eftir — óverðlagðir og ekki innifaldir í dæmatölu" : "Ekki óskað eftir"}`,
        `Dæmiverð — ekki staðfest söluverð: ${isk(quote.totalIsk)}`,
        "Vinsamlegast staðfestið raunverulegt verð og valkosti.",
      ].join("\n")
    : "Óska eftir staðfestu tilboði í opið rúllukerfi. Mál eða magn í dæmareikni þarfnast leiðréttingar.";
  const mailto = `mailto:sala@gardinulausnir.is?subject=${encodeURIComponent("Tilboðsbeiðni — opið rúllukerfi")}&body=${encodeURIComponent(mailBody)}`;

  const optionSelect = (
    testId: string,
    label: string,
    value: string,
    setValue: (value: any) => void,
    options: readonly { id: string; label: string; modifierIsk: number }[],
  ) => (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">{label} · lýsandi dæmaval</span>
      <select data-testid={testId} value={value} onChange={(event) => setValue(event.target.value)} className="w-full border border-[#ccd9df] bg-[#f7f9fa] px-3 py-3 text-sm">
        {options.map((option) => <option key={option.id} value={option.id}>{option.label} · {option.modifierIsk ? `+${isk(option.modifierIsk)}` : "+0 kr."}</option>)}
      </select>
    </label>
  );

  return (
    <StorefrontLayout
      product={product}
      priceISK={quote.ok ? quote.totalIsk : 0}
      priceText={quote.ok ? isk(quote.totalIsk) : "—"}
      priceLabel="Dæmiverð — ekki staðfest söluverð"
      activeFabric={{ name: `${color.label} · lýsandi litadæmi`, tone: color.hex }}
      quantity={quantity}
      setQuantity={setQuantity}
      canAddToCart={false}
      onAddToCart={() => undefined}
      action={quote.ok ? <a data-testid="open-roll-request" href={mailto} className="flex h-[51px] flex-1 items-center justify-center gap-3 bg-[#a2c2e2] px-3 text-center text-[10px] font-medium uppercase tracking-[.16em] transition hover:bg-[#89b0d5]">Senda tilboðsbeiðni <Mail size={15} /></a> : <span className="flex h-[51px] flex-1 items-center justify-center bg-[#d8e1e5] px-3 text-center text-[10px] uppercase tracking-[.14em] text-[#667984]">Leiðréttu mál eða magn</span>}
      controls={
        <>
          <section className="border-b border-[#ccd9df] py-5">
            <div data-testid="open-roll-example-notice" className="border border-[#b78835] bg-[#fff7df] p-4">
              <strong className="block text-sm">Dæmiverð — ekki staðfest söluverð</strong>
              <p className="mt-2 text-xs leading-5 text-[#526772]">Reiknirinn notar eingöngu lýsandi dæmagögn. Mál, litir, valkostir og sexkantslitir eru til skýringar; þau staðfesta hvorki framboð né birgjaupplýsingar. Engin forsenda um VSK er gerð.</p>
            </div>
          </section>
          <section className="border-b border-[#ccd9df] py-6">
            <p className="mb-3 text-[10px] uppercase tracking-[.18em]">Mál · lýsandi dæmi</p>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · 30–300 cm</span><input data-testid="open-roll-width" aria-label="Breidd í sentímetrum" type="number" min="30" max="300" step="0.1" value={widthCm} onChange={(event) => setWidthCm(event.target.value)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3" /></label>
              <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · 40–350 cm</span><input data-testid="open-roll-height" aria-label="Hæð í sentímetrum" type="number" min="40" max="350" step="0.1" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3" /></label>
            </div>
            {!quote.ok && <ul data-testid="open-roll-errors" role="alert" className="mt-3 list-disc pl-5 text-xs leading-5 text-[#9b3b32]">{quote.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
          </section>
          <section className="space-y-4 border-b border-[#ccd9df] py-6">
            {optionSelect("open-roll-color", "Litur", colorId, setColorId, OPEN_ROLL_EXAMPLE_COLORS)}
            <div className="flex gap-2" aria-label="Litasýnishorn eru lýsandi dæmi">{OPEN_ROLL_EXAMPLE_COLORS.map((option) => <button data-testid={`open-roll-swatch-${option.id}`} key={option.id} type="button" onClick={() => setColorId(option.id)} aria-label={`Velja ${option.label}, lýsandi dæmi`} aria-pressed={colorId === option.id} className={`h-9 w-9 rounded-full border ${colorId === option.id ? "ring-2 ring-[#6892b8] ring-offset-2" : ""}`} style={{ backgroundColor: option.hex }} />)}</div>
            {optionSelect("open-roll-rail", "Neðristika", railId, setRailId, OPEN_ROLL_EXAMPLE_RAILS)}
            {optionSelect("open-roll-holder", "Festingar", holderId, setHolderId, OPEN_ROLL_EXAMPLE_HOLDERS)}
            <label className="flex items-start gap-3 border border-[#ccd9df] p-3 text-xs leading-5"><input data-testid="open-roll-side-tracks" type="checkbox" checked={sideTracks} onChange={(event) => setSideTracks(event.target.checked)} className="mt-1" /><span><strong>Óska eftir hliðarlistum</strong><br />Valfrjálst, óverðlagt og útilokað frá dæmatölu þar til verð fæst staðfest.</span></label>
          </section>
          {quote.ok && <section data-testid="open-roll-breakdown" className="border-b border-[#ccd9df] py-6 text-xs">
            <p className="mb-3 text-[10px] uppercase tracking-[.18em]">Sundurliðun dæmiverðs</p>
            <dl className="space-y-2">
              <div className="flex justify-between"><dt>Grunneining</dt><dd>{isk(quote.baseIsk)}</dd></div>
              <div className="flex justify-between"><dt>Flatarmál · 4.500 kr./m²</dt><dd>{isk(quote.areaIsk)}</dd></div>
              <div className="flex justify-between"><dt>Valdir viðbótarliðir</dt><dd>{isk(quote.modifiersIsk)}</dd></div>
              <div className="flex justify-between border-t border-[#ccd9df] pt-2"><dt>Rúnnað einingarverð</dt><dd data-testid="open-roll-unit-price">{isk(quote.unitIsk)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Samtals · {quantity} stk.</dt><dd data-testid="open-roll-total">{isk(quote.totalIsk)}</dd></div>
            </dl>
          </section>}
        </>
      }
    />
  );
}