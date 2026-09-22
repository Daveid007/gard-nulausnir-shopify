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
import {
  getWindourSizeBand,
  isStandardWindourDuoChoice,
  WINDOUR_PLEATED_NET,
  WINDOUR_SIZE_BANDS,
  type WindourMeasurementMode,
} from "@/lib/windourOrderOptions";

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
  measurementMode: WindourMeasurementMode;
  widthReadingsMm?: [number, number, number];
  heightReadingsMm?: [number, number, number];
  widthMm: number;
  heightMm: number;
  widthBand: string;
  heightBand: string;
  frameColor: string;
  materialColor: string;
  duoPanelChoices?: [string, string];
  additionalNotes: string;
  requiresCustomQuote: boolean;
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
  // Product families have separate entry points; selections cannot cross families.
  const family = props.initialFamily;
  const [direction, setDirection] = useState(props.initialDirection);
  const [system, setSystem] = useState<System>(props.initialSystem);
  const [material, setMaterial] = useState<WindourMaterial>(props.initialMaterial ?? "honeycomb");
  const [openingType, setOpeningType] = useState<WindourOpeningType>("single");
  const [fitting, setFitting] = useState<Fitting>("recessed");
  const [widths, setWidths] = useState(["", "", ""]);
  const [heights, setHeights] = useState(["", "", ""]);
  const [measurementMode, setMeasurementMode] = useState<WindourMeasurementMode>("opening");
  const [outerWidth, setOuterWidth] = useState("");
  const [outerHeight, setOuterHeight] = useState("");
  const [frameColor, setFrameColor] = useState(props.initialFrameColor);
  const [materialColor, setMaterialColor] = useState(props.initialMaterialColor);
  const [duoPanelChoices, setDuoPanelChoices] = useState<string[]>([props.initialMaterialColor, WINDOUR_PLEATED_NET]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [measurementError, setMeasurementError] = useState("");
  const [duoChoiceError, setDuoChoiceError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: step === 0 });
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
  const openingMeasurementsValid = [...widths, ...heights].every((value) => value.trim() !== "") &&
    [...numericWidths, ...numericHeights].every((value) => Number.isFinite(value) && value > 0);
  const outerWidthMm = Number(outerWidth);
  const outerHeightMm = Number(outerHeight);
  const outerMeasurementsValid = outerWidth.trim() !== "" && outerHeight.trim() !== "" &&
    Number.isFinite(outerWidthMm) && Number.isFinite(outerHeightMm) && outerWidthMm > 0 && outerHeightMm > 0;
  const measurementsValid = measurementMode === "outer-frame" ? outerMeasurementsValid : openingMeasurementsValid;
  const widthMm = measurementsValid
    ? measurementMode === "outer-frame" ? outerWidthMm : Math.min(...numericWidths)
    : 0;
  const heightMm = measurementsValid
    ? measurementMode === "outer-frame" ? outerHeightMm : Math.min(...numericHeights)
    : 0;
  const maxMm = family === "windour" ? 2000 : null;
  const duoChoicesValid = family !== "windour" || system !== "duo" || duoPanelChoices.length === 2;
  const inSupportedRange = measurementsValid && duoChoicesValid &&
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
      measurementMode,
      widthReadingsMm: measurementMode === "opening" ? numericWidths as [number, number, number] : undefined,
      heightReadingsMm: measurementMode === "opening" ? numericHeights as [number, number, number] : undefined,
      widthMm,
      heightMm,
      widthBand: getWindourSizeBand(widthMm)?.id ?? "",
      heightBand: getWindourSizeBand(heightMm)?.id ?? "",
      frameColor,
      materialColor,
      duoPanelChoices: family === "windour" && system === "duo" ? duoPanelChoices as [string, string] : undefined,
      additionalNotes: additionalNotes.trim(),
      requiresCustomQuote: family === "windour" && system === "duo" && !isStandardWindourDuoChoice(duoPanelChoices),
    };
    const initialRoldourStillCompatible = family === "roldour" && props.initialFamily === "roldour" &&
      props.initialProductId?.startsWith("roldour-") &&
      (props.initialProductId.includes("horizontal") ? direction === "horizontal" : direction === "vertical") &&
      (props.initialProductId.includes("duo") ? system === "duo" : system === "single");
    return {
      ...base,
      mappedProductId: initialRoldourStillCompatible ? props.initialProductId! : chooseProduct(base),
    };
  }, [additionalNotes, direction, duoPanelChoices, family, fitting, frameColor, heightMm, inSupportedRange, material, materialColor, measurementMode, numericHeights, numericWidths, openingType, props.initialFamily, props.initialProductId, system, widthMm]);

  useEffect(() => {
    props.onSelection(selection);
  }, [props.onSelection, selection]);

  const setReading = (axis: "width" | "height", index: number, value: string) => {
    const setter = axis === "width" ? setWidths : setHeights;
    setter((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
    setMeasurementError("");
  };

  const toggleDuoPanelChoice = (choice: string) => {
    setDuoChoiceError("");
    if (duoPanelChoices.includes(choice)) {
      setDuoPanelChoices(duoPanelChoices.filter((item) => item !== choice));
    } else if (duoPanelChoices.length < 2) {
      setDuoPanelChoices([...duoPanelChoices, choice]);
      if (choice !== WINDOUR_PLEATED_NET) setMaterialColor(choice);
    }
  };

  const next = () => {
    if (step === 6 && !inSupportedRange) {
      setMeasurementError(measurementsValid && maxMm !== null
        ? `Breidd og hæð mega ekki fara yfir ${maxMm} mm fyrir þessa vörufjölskyldu.`
        : measurementMode === "outer-frame"
          ? "Skráðu nákvæm ytri mál rammans sem jákvæðar tölur."
          : "Skráðu öll sex mál opsins sem jákvæðar tölur.");
      return;
    }
    if (step === 7 && family === "windour" && system === "duo" && duoPanelChoices.length !== 2) {
      setDuoChoiceError("Veldu nákvæmlega tvo DUO-efnisfleti áður en þú heldur áfram.");
      return;
    }
    setStep((current) => Math.min(STEP_LABELS.length - 1, current + 1));
  };

  const duoIsStandard = isStandardWindourDuoChoice(duoPanelChoices);
  const duoPanelLabel = duoIsStandard
    ? `${duoPanelChoices.find((choice) => choice !== WINDOUR_PLEATED_NET) ?? "Honeycomb"} + ${WINDOUR_PLEATED_NET}`
    : duoPanelChoices.length ? duoPanelChoices.join(" + ") : "Engir efnisfletir valdir";
  const materialLabel = system === "duo"
    ? family === "windour" ? duoPanelLabel : "Myrkvun og flugnanet"
    : material === "honeycomb" ? "Myrkvunargardína" : "Flugnanet";
  const hasMaterialColour = family === "roldour" || system === "duo" || material === "honeycomb";
  const summaryText = selection ? [
    selection.family === "windour" ? "WINdoûr" : "ROLdoûr Slimline",
    selection.direction === "vertical" ? "lóðrétt (niður/upp)" : "lárétt (til hliðar)",
    selection.system === "duo"
      ? `DUO · ${selection.duoPanelChoices?.join(" + ") ?? "myrkvun + net"}`
      : `Single · ${materialLabel}`,
    selection.openingType === "double" ? "tvöföld opnun · lágmark 1,2 m²" : "einföld opnun · lágmark 1 m²",
    selection.fitting === "recessed" ? "innfelld festing" : "utanáliggjandi / yfir op",
    selection.widthReadingsMm ? `hrá mæligildi breidd ${selection.widthReadingsMm.join("/")} mm` : null,
    selection.heightReadingsMm ? `hrá mæligildi hæð ${selection.heightReadingsMm.join("/")} mm` : null,
    selection.measurementMode === "outer-frame"
      ? `nákvæm YTRI RAMMAMÁL ${selection.widthMm}×${selection.heightMm} mm`
      : `minnsta mál ops ${selection.widthMm}×${selection.heightMm} mm`,
    `stærðarflokkar ${selection.widthBand} / ${selection.heightBand}`,
    `rammi ${selection.frameColor}`,
    hasMaterialColour && !(family === "windour" && system === "duo") ? `efni ${selection.materialColor}` : null,
    selection.duoPanelChoices ? `DUO fletir ${selection.duoPanelChoices.join(" + ")}` : null,
    selection.additionalNotes ? `athugasemdir: ${selection.additionalNotes}` : null,
    selection.requiresCustomQuote ? "sérval DUO · eingöngu fyrirspurn" : null,
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
        <span className="text-[10px] uppercase tracking-[.18em]">{family === "windour" ? "WINdoûr" : "ROLdoûr"} · Mældu og veldu</span>
        <span className="text-xs text-[#667984]">{step + 1} / {STEP_LABELS.length}</span>
      </div>
      <div className="mb-7 h-1 overflow-hidden bg-[#dde6ea]" aria-hidden="true"><div className="h-full bg-[#6892b8] transition-all" style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }} /></div>

      <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl outline-none">
        {[
          family === "windour" ? "WINdoûr — Rammagardínur" : "ROLdoûr — Rúllukerfi í ramma",
          "Hvernig á kerfið að opnast?",
          "Einföld lausn eða DUO?",
          "Myrkvun eða flugnanet?",
          "Hvernig á opnunin að vera?",
          "Hvernig verður kerfið fest?",
          measurementMode === "outer-frame" ? "Skráðu ytri mál fullbúins ramma" : "Mældu opið á sex stöðum",
          "Veldu liti",
          "Yfirlit og næstu skref",
        ][step]}
      </h2>
      <p className="mb-5 mt-2 text-xs leading-5 text-[#667984]" aria-live="polite">
        {step === 2 && "DUO er tveggja flata kerfi. Það er ekki tvöföld opnun. Aðeins honeycomb + net styðst við núverandi verðlíkan."}
        {step === 5 && "Við skráum festinguna en breytum ekki málum eða framleiðslumáli sjálfkrafa."}
        {step === 6 && (measurementMode === "outer-frame"
          ? "Skráðu nákvæma heildarbreidd og heildarhæð utanverðs ramma í millimetrum. Þetta eru ekki mál opsins."
          : "Mældu opið í millimetrum: breidd efst/miðja/neðst og hæð vinstri/miðja/hægri.")}
      </p>

       <ThedourStepHelp step={step} family={family} fitting={fitting} measurementMode={measurementMode} />
      <div className="space-y-2">
        {step === 0 && <p className="text-sm leading-6 text-[#344b59]">Þú ert að stilla {family === "windour" ? "WINdoûr-rammagardínu" : "ROLdoûr-rúllukerfi"}. Veldu Áfram til að velja opnunarstefnu, efni, mál og liti fyrir þetta kerfi.</p>}
        {step === 1 && <>
          <Choice icon={<span className="flex h-8 w-6 flex-col justify-between border-2 border-[#667984] p-1"><span className="h-1 bg-[#8ca9b8]" /><ArrowDownUp size={12} /><span className="h-1 bg-[#8ca9b8]" /></span>} selected={direction === "vertical"} title="Lóðrétt — upp og niður" detail="Vertical opening · Fletirnir hreyfast upp og niður í rammanum." onClick={() => setDirection("vertical")} />
          <Choice icon={<span className="flex h-6 w-8 items-center justify-between border-2 border-[#667984] p-1"><span className="h-full w-1 bg-[#8ca9b8]" /><ArrowLeftRight size={12} /><span className="h-full w-1 bg-[#8ca9b8]" /></span>} selected={direction === "horizontal"} title="Lárétt — til hliðanna" detail="Horizontal opening · Fletirnir hreyfast til hliðanna í rammanum." onClick={() => setDirection("horizontal")} />
        </>}
        {step === 2 && <>
          <Choice selected={system === "single"} title="Einföld lausn (Single)" detail="Aðeins myrkvunargardína eða aðeins flugnanet. Þú velur hvort í næsta skrefi." onClick={() => setSystem("single")} />
          <Choice selected={system === "duo"} title="Tveir efnisfletir (DUO)" detail="Veldu tvo ólíka fleti síðar. Honeycomb + net er staðlaða verðlagða samsetningin; annað sérval fer í fyrirspurn." onClick={() => setSystem("duo")} />
        </>}
        {step === 3 && (system === "duo" ? (
          <div className="border border-[#9ebbd0] bg-[#eaf3f8] p-4 text-sm leading-6"><strong>DUO valið:</strong> þú velur tvo ólíka efnisfleti í litaskrefinu. Honeycomb + fellt flugnanet samsvarar núverandi verðlíkani. Tvö honeycomb-efni eru skráð sem sérval í fyrirspurn.</div>
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
            {family === "windour" && <fieldset className="mb-5">
              <legend className="mb-2 text-xs font-medium">Hvaða mál ertu að skrá?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <Choice selected={measurementMode === "opening"} title="Mál ops — sex mælingar" detail="Breidd og hæð opsins á þremur stöðum. Minnstu gildin eru notuð sem viðmiðun." onClick={() => { setMeasurementMode("opening"); setMeasurementError(""); }} />
                <Choice selected={measurementMode === "outer-frame"} title="YTRI RAMMAMÁL — tvö nákvæm mál" detail="Heildarmál utanverðs fullbúins ramma. Enginn frádráttur eða viðbót er reiknuð." onClick={() => { setMeasurementMode("outer-frame"); setMeasurementError(""); }} />
              </div>
            </fieldset>}
            {measurementMode === "opening" ? (<>
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
            {measurementsValid && <p className="bg-[#eef3f5] p-3 text-xs">Minnsta mælda mál ops: <strong>{widthMm} × {heightMm} mm</strong>. Öll sex hrá mæligildi fylgja fyrirspurn.</p>}
            </>) : (
              <div className="space-y-4">
                <div className="border border-[#d8c79f] bg-[#fffaf0] p-3 text-xs leading-5">
                  <strong>Ytri rammi — ekki opnunarmál.</strong> Sláðu inn nákvæma heildarhæð og heildarbreidd frá ytri brún til ytri brúnar. Formið breytir þessum málum ekki.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    ["Heildarbreidd ytri ramma", outerWidth, setOuterWidth, "outer-width"],
                    ["Heildarhæð ytri ramma", outerHeight, setOuterHeight, "outer-height"],
                  ] as const).map(([label, value, setter, testId]) => (
                    <label key={testId} className="text-xs font-medium">{label} (mm)
                      <span className="relative mt-1 block"><Ruler size={14} className="absolute left-3 top-3.5" />
                        <input data-testid={testId} aria-label={`${label} í millimetrum`} type="number" inputMode="numeric" min="1" max="2000" step="1" value={value}
                          onChange={(event) => { setter(event.target.value); setMeasurementError(""); }}
                          className="w-full border border-[#ccd9df] bg-transparent py-3 pl-9 pr-8 text-sm outline-none focus:border-[#24313b]" />
                        <span className="absolute right-2 top-3 text-[10px]">mm</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {measurementsValid && family === "windour" && <div className="mt-5 space-y-4">
              {([["Hæðarflokkur", heightMm], ["Breiddarflokkur", widthMm]] as const).map(([label, mm]) => (
                <fieldset key={label}>
                  <legend className="mb-2 text-xs font-medium">{label} · sjálfvalið út frá {mm} mm</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {WINDOUR_SIZE_BANDS.map((band) => <span key={band.id}
                      className={`border p-2 text-center text-[10px] ${getWindourSizeBand(mm)?.id === band.id ? "border-[#24313b] bg-[#e2edf1] font-medium" : "border-[#dde6ea] text-[#667984]"}`}>
                      {band.label}{band.id === "up-to-1099" && props.initialProductId?.endsWith("-999") ? " · 999 vara: hámark 999 mm" : ""}
                    </span>)}
                  </div>
                </fieldset>
              ))}
              {props.initialProductId?.endsWith("-999") && Math.max(widthMm, heightMm) > 999 && <p role="alert" className="border border-[#d8c79f] bg-[#fffaf0] p-3 text-xs leading-5">Þessi mál fara yfir 999 mm og eru því ekki samþykkt á 999 vörukortinu. Leiðsögnin hefur valið samsvarandi 2000 vörukort; opnaðu það til að halda áfram með verðáætlun.</p>}
              <p className="text-xs leading-5 text-[#667984]">Stærðarflokkur er sjálfkrafa leiddur af nákvæma málinu. „Allt að 1099 mm“ er valflokkur birgis á 2000 vörukortinu; 999 vörukortið tekur aðeins mál allt að 999 mm. Mál 1000–1099 mm færast því á 2000 vörukort og eru ekki samþykkt á 999 vörukortinu.</p>
            </div>}
            {measurementError && <p role="alert" className="mt-3 text-xs text-red-700">{measurementError}</p>}
          </div>
        )}
        {step === 7 && <>
          <Swatches label="Litur á álramma" options={THEDOUR_FRAME_COLOURS} value={frameColor} onChange={setFrameColor} />
          {hasMaterialColour && (system !== "duo" || family === "roldour") && <div className="pt-4"><Swatches label={materialLabel}
            options={family === "roldour" ? THEDOUR_ROLDOUR_FABRIC_COLOURS : THEDOUR_HONEYCOMB_COLOURS}
            value={materialColor}
            onChange={setMaterialColor} /></div>}
          {family === "windour" && system === "duo" && <fieldset className="pt-4">
            <legend className="mb-2 text-[10px] uppercase tracking-[.18em]">DUO efnisfletir · veldu nákvæmlega 2</legend>
            <p className="mb-3 text-xs leading-5 text-[#667984]">Veldu tvo ólíka fleti úr fjórum honeycomb-litum og felldu flugnaneti. Hver kostur er valinn í mesta lagi einu sinni; formið styður ekki magn af sama efni. Honeycomb + net samsvarar núverandi verðlíkani. Önnur samsetning fer eingöngu í fyrirspurn þar til verð er staðfest.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[...THEDOUR_HONEYCOMB_COLOURS, { name: WINDOUR_PLEATED_NET, image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_5_1737736998183-1741190634.jpg" }].map((option) => {
                const selected = duoPanelChoices.includes(option.name);
                return <button key={option.name} type="button" aria-pressed={selected} onClick={() => toggleDuoPanelChoice(option.name)}
                  className={`flex min-h-14 items-center gap-2 border p-2 text-left text-[10px] ${selected ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                  <ResponsiveImage src={option.image} alt="" sizes="36px" className="h-9 w-9 shrink-0 object-cover" />
                  <span>{option.name}{selected ? ` · val ${duoPanelChoices.indexOf(option.name) + 1}` : ""}</span>
                </button>;
              })}
            </div>
            <p className={`mt-2 text-xs ${duoPanelChoices.length === 2 ? "text-[#526772]" : "text-red-700"}`}>{duoPanelChoices.length} af 2 valið{duoPanelChoices.length >= 2 ? " — afveldu eitt til að breyta." : "."}</p>
            {duoChoiceError && <p role="alert" className="mt-2 text-xs text-red-700">{duoChoiceError}</p>}
          </fieldset>}
          <label className="block pt-4 text-[10px] uppercase tracking-[.18em]">Additional Instructions Notes / Viðbótarupplýsingar
            <textarea value={additionalNotes} maxLength={2000} rows={4} onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="T.d. staðsetning, lokunarhlið, hindranir eða annað sem þarf að staðfesta."
              className="mt-2 w-full resize-y border border-[#ccd9df] bg-transparent p-3 text-sm normal-case tracking-normal outline-none focus:border-[#24313b]" />
          </label>
        </>}
        {step === 8 && selection && (
          <div className="space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border border-[#ccd9df] p-4 text-xs">
              <dt className="text-[#667984]">Kerfi</dt><dd>{family === "windour" ? "WINdoûr" : "ROLdoûr Slimline"} · {system === "duo" ? "DUO" : "Single"}</dd>
              <dt className="text-[#667984]">Opnun</dt><dd>{direction === "vertical" ? "Lóðrétt" : "Lárétt"} · {openingType === "double" ? "tvöföld" : "einföld"}</dd>
              {family === "windour" && <><dt className="text-[#667984]">Lágmarksverð</dt><dd>{getWindourMinimumChargeableSqm(openingType).toLocaleString("is-IS")} m² · ræðst af opnun, ekki DUO</dd></>}
              <dt className="text-[#667984]">Efni</dt><dd>{materialLabel}</dd>
              <dt className="text-[#667984]">Festing</dt><dd>{fitting === "recessed" ? "Innfelld" : "Utanáliggjandi / yfir op"}</dd>
              <dt className="text-[#667984]">Mæliaðferð</dt><dd>{measurementMode === "outer-frame" ? "Ytri mál fullbúins ramma" : "Sex mál opsins"}</dd>
              <dt className="text-[#667984]">Mál</dt><dd>{widthMm} × {heightMm} mm {measurementMode === "opening" ? "(minnsta af þremur)" : "(utanverður rammi, óbreytt)"}</dd>
              <dt className="text-[#667984]">Stærðarflokkar</dt><dd>Breidd {getWindourSizeBand(widthMm)?.label} · hæð {getWindourSizeBand(heightMm)?.label}</dd>
              <dt className="text-[#667984]">Litir</dt><dd>{frameColor}{hasMaterialColour && !(family === "windour" && system === "duo") ? ` · ${materialColor}` : ""}</dd>
              {selection.duoPanelChoices && <><dt className="text-[#667984]">DUO fletir</dt><dd>{selection.duoPanelChoices.join(" + ")}</dd></>}
              {selection.additionalNotes && <><dt className="text-[#667984]">Athugasemdir</dt><dd className="whitespace-pre-wrap">{selection.additionalNotes}</dd></>}
            </dl>
            {selection.requiresCustomQuote && <p className="border border-[#d8c79f] bg-[#fffaf0] p-3 text-xs leading-5">Þessi DUO samsetning er skráð í fyrirspurn en hefur ekki staðfest verðlíkan. Hún verður ekki sett í áætlunarkörfu.</p>}
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