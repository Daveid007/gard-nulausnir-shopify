import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDownUp, ArrowLeftRight, Check, ChevronLeft, ChevronRight, Moon, Ruler, Shield } from "lucide-react";
import { Link } from "wouter";
import { BusinessInquiryButton } from "@/components/BusinessInquiryButton";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { ThedourStepHelp } from "@/components/ThedourStepHelp";
import {
  THEDOUR_FRAME_COLOURS,
  THEDOUR_HONEYCOMB_COLOURS,
  THEDOUR_ROLDOUR_FABRIC_COLOURS,
  type ThedourColourOption,
} from "@/lib/thedourProductOptions";
import {
  getWindourMinimumChargeableSqm,
  type WindourMaterial,
  type WindourOpeningDirection,
  type WindourOpeningType,
} from "@/lib/windourPricing";

type Family = "windour" | "roldour";
type System = "single" | "duo";
type Fitting = "recessed" | "overlap";

export type ThedourWizardSelection = {
  family: Family;
  direction: WindourOpeningDirection;
  system: System;
  material: WindourMaterial;
  openingType: WindourOpeningType;
  fitting: Fitting;
  widthReadingsMm: [number, number, number];
  heightReadingsMm: [number, number, number];
  widthMm: number;
  heightMm: number;
  frameColor: string;
  materialColor: string;
  mappedProductId: string;
};

type Props = {
  initialFamily: Family;
  initialDirection: WindourOpeningDirection;
  initialSystem: System;
  initialMaterial?: WindourMaterial;
  initialFrameColor: string;
  initialMaterialColor: string;
  initialProductId?: string;
  onSelection: (selection: ThedourWizardSelection | null) => void;
  summaryAction?: (selection: ThedourWizardSelection) => ReactNode;
};

const STEP_LABELS = ["Gerð", "Stefna", "Kerfi", "Efni", "Opnun", "Festing", "Mál", "Litir", "Yfirlit"];

function chooseProduct(selection: Omit<ThedourWizardSelection, "mappedProductId">) {
  const tier = Math.max(selection.widthMm, selection.heightMm) <= 999 ? "999" : "2000";
  if (selection.family === "windour") return `windour-${selection.system}-${tier}`;
  if (selection.direction === "horizontal") {
    return selection.system === "duo" ? "roldour-duo-horizontal" : "roldour-slimline-horizontal";
  }
  if (selection.system === "single") return "roldour-single-vertical";
  return tier === "999" ? "roldour-duo-vertical-small" : "roldour-duo-vertical-large";
}

function Choice({
  selected,
  title,
  detail,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  detail: string;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-20 w-full items-center gap-3 border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8] ${
        selected ? "border-[#6892b8] bg-[#eaf3f8]" : "border-[#ccd9df] hover:border-[#8ca9b8]"
      }`}
    >
      {icon && <span className="grid h-9 w-9 shrink-0 place-items-center bg-[#f4f7f8]">{icon}</span>}
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-medium">{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-[#667984]">{detail}</span>
      </span>
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-[#6892b8] bg-[#6892b8] text-white" : "border-[#b8c6cd]"}`}>
        {selected && <Check size={12} />}
      </span>
    </button>
  );
}

function Swatches({ options, value, onChange, label }: {
  options: readonly ThedourColourOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-[10px] uppercase tracking-[.18em]">{label} · <span className="normal-case tracking-normal text-[#667984]">{value}</span></legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button key={option.name} type="button" aria-pressed={value === option.name} onClick={() => onChange(option.name)}
            className={`flex min-h-14 items-center gap-2 border p-2 text-left text-[10px] ${value === option.name ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
            <ResponsiveImage src={option.image} alt="" sizes="36px" className="h-9 w-9 shrink-0 object-cover" />
            {option.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ThedourScreenWizard(props: Props) {
  const [step, setStep] = useState(0);
  const [family, setFamily] = useState<Family>(props.initialFamily);
  const [direction, setDirection] = useState(props.initialDirection);
  const [system, setSystem] = useState<System>(props.initialSystem);
  const [material, setMaterial] = useState<WindourMaterial>(props.initialMaterial ?? "honeycomb");
  const [openingType, setOpeningType] = useState<WindourOpeningType>("single");
  const [fitting, setFitting] = useState<Fitting>("recessed");
  const [widths, setWidths] = useState(["", "", ""]);
  const [heights, setHeights] = useState(["", "", ""]);
  const [frameColor, setFrameColor] = useState(props.initialFrameColor);
  const [materialColor, setMaterialColor] = useState(props.initialMaterialColor);
  const [measurementError, setMeasurementError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    // A changed family/direction/system invalidates choices that are not shared.
    if (system === "duo") setMaterial("honeycomb");
    if (family === "roldour" && material === "taiwan-pet-net") setMaterial("polyester-net");
    const compatibleColours = family === "roldour" ? THEDOUR_ROLDOUR_FABRIC_COLOURS : THEDOUR_HONEYCOMB_COLOURS;
    if (!compatibleColours.some((option) => option.name === materialColor)) {
      setMaterialColor(compatibleColours[0].name);
    }
  }, [family, material, materialColor, system]);

  const numericWidths = useMemo(() => widths.map(Number), [widths]);
  const numericHeights = useMemo(() => heights.map(Number), [heights]);
  const measurementsValid = [...widths, ...heights].every((value) => value.trim() !== "") &&
    [...numericWidths, ...numericHeights].every((value) => Number.isFinite(value) && value > 0);
  const widthMm = measurementsValid ? Math.min(...numericWidths) : 0;
  const heightMm = measurementsValid ? Math.min(...numericHeights) : 0;
  const maxMm = family === "windour" ? 2000 : null;
  const inSupportedRange = measurementsValid &&
    (maxMm === null || (widthMm <= maxMm && heightMm <= maxMm));

  const selection = useMemo<ThedourWizardSelection | null>(() => {
    if (!inSupportedRange) return null;
    const base = {
      family,
      direction,
      system,
      material,
      openingType,
      fitting,
      widthReadingsMm: numericWidths as [number, number, number],
      heightReadingsMm: numericHeights as [number, number, number],
      widthMm,
      heightMm,
      frameColor,
      materialColor,
    };
    const initialRoldourStillCompatible = family === "roldour" && props.initialFamily === "roldour" &&
      props.initialProductId?.startsWith("roldour-") &&
      (props.initialProductId.includes("horizontal") ? direction === "horizontal" : direction === "vertical") &&
      (props.initialProductId.includes("duo") ? system === "duo" : system === "single");
    return {
      ...base,
      mappedProductId: initialRoldourStillCompatible ? props.initialProductId! : chooseProduct(base),
    };
  }, [direction, family, fitting, frameColor, heightMm, inSupportedRange, material, materialColor, numericHeights, numericWidths, openingType, props.initialFamily, props.initialProductId, system, widthMm]);

  useEffect(() => {
    props.onSelection(selection);
  }, [props.onSelection, selection]);

  const setReading = (axis: "width" | "height", index: number, value: string) => {
    const setter = axis === "width" ? setWidths : setHeights;
    setter((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
    setMeasurementError("");
  };

  const next = () => {
    if (step === 6 && !inSupportedRange) {
      setMeasurementError(measurementsValid && maxMm !== null ? `Minnsta breidd og hæð mega ekki fara yfir ${maxMm} mm fyrir þessa vörufjölskyldu.` : "Skráðu öll sex málin sem jákvæðar tölur.");
      return;
    }
    setStep((current) => Math.min(STEP_LABELS.length - 1, current + 1));
  };

  const materialLabel = system === "duo"
    ? "Myrkvun og flugnanet"
    : material === "honeycomb" ? "Myrkvunargardína" : "Flugnanet";
  const hasMaterialColour = family === "roldour" || system === "duo" || material === "honeycomb";
  const summaryText = selection ? [
    selection.family === "windour" ? "WINdoûr" : "ROLdoûr Slimline",
    selection.direction === "vertical" ? "lóðrétt (niður/upp)" : "lárétt (til hliðar)",
    selection.system === "duo" ? "DUO · myrkvun + net" : `Single · ${materialLabel}`,
    selection.openingType === "double" ? "tvöföld opnun · lágmark 1,2 m²" : "einföld opnun · lágmark 1 m²",
    selection.fitting === "recessed" ? "innfelld festing" : "utanáliggjandi / yfir op",
    `hrá mæligildi breidd ${selection.widthReadingsMm.join("/")} mm`,
    `hrá mæligildi hæð ${selection.heightReadingsMm.join("/")} mm`,
    `minnsta mál ${selection.widthMm}×${selection.heightMm} mm`,
    `rammi ${selection.frameColor}`,
    hasMaterialColour ? `efni ${selection.materialColor}` : null,
    `vörukort ${selection.mappedProductId}`,
  ].filter(Boolean).join(" · ") : "";

  return (
    <section className="border-b border-[#ccd9df] py-6" aria-label="Leiðsögn um val og mælingu" onKeyDown={(event) => {
      if (event.key === "Enter" && event.target instanceof HTMLButtonElement === false && step < 8) next();
    }}>
      <div className="mb-5 grid gap-3 rounded border border-[#9ebbd0] bg-[#eaf3f8] p-4 text-sm text-[#24313b] sm:grid-cols-2" aria-label="Skýring á opnunarstefnu">
        <div className="flex items-center gap-3">
          <ArrowDownUp size={24} aria-hidden="true" className="shrink-0" />
          <p><strong className="block">Lóðrétt (vertical)</strong><span>Upp og niður</span></p>
        </div>
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={24} aria-hidden="true" className="shrink-0" />
          <p><strong className="block">Lárétt (horizontal)</strong><span>Til hliðanna</span></p>
        </div>
      </div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[.18em]">Mældu og veldu</span>
        <span className="text-xs text-[#667984]">{step + 1} / {STEP_LABELS.length}</span>
      </div>
      <div className="mb-7 h-1 overflow-hidden bg-[#dde6ea]" aria-hidden="true"><div className="h-full bg-[#6892b8] transition-all" style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }} /></div>

      <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl outline-none">
        {[
          "Hvaða gerð hentar?",
          "Hvernig á kerfið að opnast?",
          "Einföld lausn eða DUO?",
          "Myrkvun eða flugnanet?",
          "Hvernig á opnunin að vera?",
          "Hvernig verður kerfið fest?",
          "Mældu opið á sex stöðum",
          "Veldu liti",
          "Yfirlit og næstu skref",
        ][step]}
      </h2>
      <p className="mb-5 mt-2 text-xs leading-5 text-[#667984]" aria-live="polite">
        {step === 2 && "DUO er myrkvun og net í einu kerfi. Það er ekki tvöföld opnun."}
        {step === 5 && "Við skráum festinguna en breytum ekki málum eða framleiðslumáli sjálfkrafa."}
        {step === 6 && "Mældu í millimetrum: breidd efst/miðja/neðst og hæð vinstri/miðja/hægri."}
      </p>

      <ThedourStepHelp step={step} family={family} fitting={fitting} />
      <div className="space-y-2">
        {step === 0 && <>
          <Choice selected={family === "windour"} title="WINdoûr" detail="Fellt honeycomb-kerfi í ramma fyrir myrkvun eða flugnanet." onClick={() => setFamily("windour")} />
          <Choice selected={family === "roldour"} title="ROLdoûr Slimline" detail="Inndraganlegt dúk- eða netkerfi sem rúllast í mjóa kassettu." onClick={() => setFamily("roldour")} />
        </>}
        {step === 1 && <>
          <Choice icon={<ArrowDownUp size={17} />} selected={direction === "vertical"} title="Lóðrétt — upp og niður" detail="Vertical · Hreyfist upp og niður." onClick={() => setDirection("vertical")} />
          <Choice icon={<ArrowLeftRight size={17} />} selected={direction === "horizontal"} title="Lárétt — til hliðanna" detail="Horizontal · Opnast og lokast til hliðanna." onClick={() => setDirection("horizontal")} />
        </>}
        {step === 2 && <>
          <Choice selected={system === "single"} title="Einföld lausn (Single)" detail="Aðeins myrkvunargardína eða aðeins flugnanet. Þú velur hvort í næsta skrefi." onClick={() => setSystem("single")} />
          <Choice selected={system === "duo"} title="Gardína og flugnanet (DUO)" detail="Myrkvunargardína og flugnanet saman í einu kerfi." onClick={() => setSystem("duo")} />
        </>}
        {step === 3 && (system === "duo" ? (
          <div className="border border-[#9ebbd0] bg-[#eaf3f8] p-4 text-sm leading-6"><strong>DUO valið:</strong> myrkvun og flugnanet fylgja saman.</div>
        ) : <>
          <Choice icon={<Moon size={17} />} selected={material === "honeycomb"} title="Myrkvunargardína" detail="Lokar birtu og veitir einangrun." onClick={() => setMaterial("honeycomb")} />
          <Choice icon={<Shield size={17} />} selected={material !== "honeycomb"} title="Flugnanet" detail="Hleypir lofti inn en heldur skordýrum úti." onClick={() => setMaterial("polyester-net")} />
        </>)}
        {step === 4 && <>
          <Choice selected={openingType === "single"} title="Einföld opnun" detail="Ein samfelld opnun kerfisins · lágmarksverð miðast við 1 m²." onClick={() => setOpeningType("single")} />
          <Choice selected={openingType === "double"} title="Tvöföld opnun" detail="Aðskilið frá DUO · lágmarksverð miðast við 1,2 m²." onClick={() => setOpeningType("double")} />
        </>}
        {step === 5 && <>
          <Choice selected={fitting === "recessed"} title="Innfelld festing" detail="Kerfið situr inni í gluggaopinu." onClick={() => setFitting("recessed")} />
          <Choice selected={fitting === "overlap"} title="Utanáliggjandi / yfir op" detail="Kerfið skarast yfir opið. Lokamál eru staðfest í fyrirspurn." onClick={() => setFitting("overlap")} />
        </>}
        {step === 6 && (
          <div>
            {([
              ["Breidd (mm)", ["Efst", "Miðja", "Neðst"], widths, "width"],
              ["Hæð (mm)", ["Vinstri", "Miðja", "Hægri"], heights, "height"],
            ] as const).map(([label, labels, values, axis]) => (
              <fieldset key={axis} className="mb-5">
                <legend className="mb-2 text-xs font-medium">{label}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {labels.map((inputLabel, index) => <label key={inputLabel} className="text-[10px] text-[#667984]">{inputLabel}
                    <span className="relative mt-1 block"><Ruler size={14} className="absolute left-3 top-3.5" />
                      <input data-testid={`${axis}-${index}`} aria-label={`${label} ${inputLabel}`} type="number" inputMode="numeric" min="1" step="1" value={values[index]}
                        onChange={(event) => setReading(axis, index, event.target.value)}
                        className="w-full border border-[#ccd9df] bg-transparent py-3 pl-9 pr-8 text-sm outline-none focus:border-[#24313b]" />
                      <span className="absolute right-2 top-3 text-[10px]">mm</span>
                    </span>
                  </label>)}
                </div>
              </fieldset>
            ))}
            {measurementsValid && <p className="bg-[#eef3f5] p-3 text-xs">Minnsta mælda mál: <strong>{widthMm} × {heightMm} mm</strong>. Öll hrá mæligildi fylgja fyrirspurn.</p>}
            {measurementError && <p role="alert" className="mt-3 text-xs text-red-700">{measurementError}</p>}
          </div>
        )}
        {step === 7 && <>
          <Swatches label="Litur á álramma" options={THEDOUR_FRAME_COLOURS} value={frameColor} onChange={setFrameColor} />
          {hasMaterialColour && <div className="pt-4"><Swatches label={system === "duo" ? "Litur / efni kerfis" : materialLabel}
            options={family === "roldour" ? THEDOUR_ROLDOUR_FABRIC_COLOURS : THEDOUR_HONEYCOMB_COLOURS}
            value={materialColor}
            onChange={setMaterialColor} /></div>}
        </>}
        {step === 8 && selection && (
          <div className="space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border border-[#ccd9df] p-4 text-xs">
              <dt className="text-[#667984]">Kerfi</dt><dd>{family === "windour" ? "WINdoûr" : "ROLdoûr Slimline"} · {system === "duo" ? "DUO" : "Single"}</dd>
              <dt className="text-[#667984]">Opnun</dt><dd>{direction === "vertical" ? "Lóðrétt" : "Lárétt"} · {openingType === "double" ? "tvöföld" : "einföld"}</dd>
              {family === "windour" && <><dt className="text-[#667984]">Lágmarksverð</dt><dd>{getWindourMinimumChargeableSqm(openingType).toLocaleString("is-IS")} m² · ræðst af opnun, ekki DUO</dd></>}
              <dt className="text-[#667984]">Efni</dt><dd>{materialLabel}</dd>
              <dt className="text-[#667984]">Festing</dt><dd>{fitting === "recessed" ? "Innfelld" : "Utanáliggjandi / yfir op"}</dd>
              <dt className="text-[#667984]">Mál</dt><dd>{widthMm} × {heightMm} mm (minnsta af þremur)</dd>
              <dt className="text-[#667984]">Litir</dt><dd>{frameColor}{hasMaterialColour ? ` · ${materialColor}` : ""}</dd>
            </dl>
            {fitting === "overlap" && <p className="border border-[#d8c79f] bg-[#fffaf0] p-3 text-xs leading-5">Utanáliggjandi festing er send til staðfestingar. Engin frádráttur eða skörun hefur verið ágiskuð og mælimál eru ekki notuð sem framleiðslumál.</p>}
            {family !== props.initialFamily && <Link href={`/products/${selection.mappedProductId}`} className="block border border-[#8ca9b8] px-4 py-3 text-center text-xs">Skoða samsvarandi vörusíðu</Link>}
            {props.summaryAction?.(selection)}
            <BusinessInquiryButton label="Senda allt valið í fyrirspurn" productContext={summaryText}
              className="block w-full border border-[#8ca9b8] px-4 py-3 text-center text-[10px] uppercase tracking-[.16em]" />
          </div>
        )}
      </div>

      <div className="mt-7 flex gap-3">
        <button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#ccd9df] px-4 text-[10px] uppercase tracking-[.16em] disabled:opacity-35">
          <ChevronLeft size={15} /> Til baka
        </button>
        {step < 8 && <button type="button" onClick={next}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-[#a2c2e2] px-4 text-[10px] uppercase tracking-[.16em]">
          Áfram <ChevronRight size={15} />
        </button>}
      </div>
    </section>
  );
}