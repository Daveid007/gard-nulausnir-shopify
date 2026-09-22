import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { StorefrontLayout } from "./StorefrontLayout";
import { useCart } from "@/lib/cart";
import { rollerWorkbookSwatchFilename } from "@/lib/rollerWorkbookSwatches";
import { swatchUrl } from "@/pages/storefront/_shared/swatches";
import sideTrackImage from "@/assets/accessory-thumbs/roller-side-track.png";
import {
  quoteRollerWorkbookBlind,
  getRollerWorkbookSizeLimits,
  rollerWorkbookFabrics,
  ROLLER_WORKBOOK_CASSETTES,
  type ManualControl,
  type MotorType,
  type RollerWorkbookFamily,
  type RollerWorkbookFabric,
  type RollerWorkbookQuoteInput,
  type RollerWorkbookOperation,
  type SideTrack,
} from "@/lib/rollerWorkbookPricing";

function swatchForWorkbookFabric(fabric: RollerWorkbookFabric): string | undefined {
  const filename = rollerWorkbookSwatchFilename(fabric);
  return filename ? swatchUrl(filename) || undefined : undefined;
}

const FAMILY_LABELS: Record<RollerWorkbookFamily, string> = {
  roller: "Rúllugardína",
  zebra: "Sebragardína",
  sheer: "Sheer Shades",
  butterfly: "Fiðrildagardína",
};

const TRACKS: Record<RollerWorkbookFamily, readonly { value: SideTrack; label: string }[]> = {
  roller: [
    { value: "none", label: "Án hliðarlista" },
    { value: "u-white", label: "U-skinna · hvít" },
    { value: "u-grey", label: "U-skinna · grá" },
    { value: "l-white", label: "L-skinna · hvít" },
    { value: "l-black", label: "L-skinna · svört" },
  ],
  zebra: [
    { value: "none", label: "Engin hliðarslá" },
    { value: "l-white", label: "L-skinna · hvít" },
    { value: "l-black", label: "L-skinna · svört" },
  ],
  sheer: [
    { value: "none", label: "Engin hliðarslá" },
    { value: "u-white", label: "U-skinna · hvít" },
    { value: "l-white", label: "L-skinna · hvít" },
  ],
  butterfly: [{ value: "none", label: "Engin hliðarslá" }],
};

const MOTOR_TYPES: readonly { value: MotorType; label: string }[] = [
  { value: "battery-standard", label: "Rafhlaða · staðlaður" },
  { value: "battery-wifi", label: "Rafhlaða · Wi‑Fi" },
  { value: "battery-zigbee", label: "Rafhlaða · Zigbee" },
  { value: "wired", label: "Tengdur · staðlaður" },
  { value: "wired-wifi", label: "Tengdur · Wi‑Fi" },
];

function controlsFor(family: RollerWorkbookFamily): readonly { value: ManualControl; label: string }[] {
  if (family === "sheer") return [{ value: "cord", label: "Snúra" }];
  return [
    { value: "cord", label: "Snúra" },
    { value: "plastic-chain", label: "Plastkeðja" },
    { value: "steel-chain", label: "Stálkeðja" },
  ];
}

function firstFabric(family: RollerWorkbookFamily) {
  return rollerWorkbookFabrics.find((fabric) => fabric.family === family);
}

export type RollerWorkbookProductIdentity =
  | "square-cassette"
  | "arc-cassette"
  | "open-roll"
  | "zebra-blind"
  | "sheer-shades"
  | "butterfly-blinds";

const familyForIdentity: Record<RollerWorkbookProductIdentity, RollerWorkbookFamily> = {
  "square-cassette": "roller",
  "arc-cassette": "roller",
  "open-roll": "roller",
  "zebra-blind": "zebra",
  "sheer-shades": "sheer",
  "butterfly-blinds": "butterfly",
};

export function RollerWorkbookCalculator({
  product,
  productIdentity,
}: {
  product: any;
  productIdentity: RollerWorkbookProductIdentity;
}) {
  const family = familyForIdentity[productIdentity];
  const unavailableOpenRoll = productIdentity === "open-roll";
  const initialFabric = firstFabric(family);
  const [widthCm, setWidthCm] = useState("120");
  const [heightCm, setHeightCm] = useState("160");
  const [quantity, setQuantity] = useState(1);
  const [fabricCode, setFabricCode] = useState(initialFabric?.code ?? "");
  const [fabricSearch, setFabricSearch] = useState("");
  const [operation, setOperation] = useState<RollerWorkbookOperation>("manual");
  const [manualControl, setManualControl] = useState<ManualControl>("cord");
  const [motorType, setMotorType] = useState<MotorType>("battery-standard");
  const [remote, setRemote] = useState(false);
  const [hub, setHub] = useState(false);
  const [noDrill, setNoDrill] = useState(false);
  const [mountPosition, setMountPosition] = useState<"inside" | "outside">("inside");
  const [track, setTrack] = useState<SideTrack>("none");
  const [cassette, setCassette] = useState<string>(
    productIdentity === "arc-cassette" ? ROLLER_WORKBOOK_CASSETTES[1] : ROLLER_WORKBOOK_CASSETTES[0],
  );
  const { addItem } = useCart();

  const familyFabrics = useMemo(
    () => rollerWorkbookFabrics.filter((fabric) => fabric.family === family),
    [family],
  );
  const visibleFabrics = useMemo(() => {
    const needle = fabricSearch.trim().toLocaleLowerCase();
    if (!needle) return familyFabrics;
    return familyFabrics.filter((fabric) =>
      [fabric.code, fabric.name, fabric.color, fabric.light, fabric.size]
        .some((value) => value.toLocaleLowerCase().includes(needle)),
    );
  }, [fabricSearch, familyFabrics]);
  const fabric = familyFabrics.find((item) => item.code === fabricCode) ?? initialFabric;
  // Keep a chosen fabric selected when a subsequent search does not match it;
  // searching must never replace a supplier fabric selection behind the user.
  const selectFabrics = fabric && !visibleFabrics.some((item) => item.code === fabric.code)
    ? [fabric, ...visibleFabrics]
    : visibleFabrics;
  const cassetteChoices = productIdentity === "square-cassette"
    ? [ROLLER_WORKBOOK_CASSETTES[0]]
    : productIdentity === "arc-cassette"
      ? [ROLLER_WORKBOOK_CASSETTES[1]]
      : ROLLER_WORKBOOK_CASSETTES;

  const quoteInput: RollerWorkbookQuoteInput = {
    family,
    fabricCode,
    widthCm: Number(widthCm),
    heightCm: Number(heightCm),
    quantity,
    operation,
    ...(operation === "manual" ? { manualControl } : {}),
    ...(operation === "motor" ? { motorType, remote, hub } : {}),
    ...(family !== "butterfly" ? { noDrill } : {}),
    mountPosition,
    track,
    cassette,
  };
  const quote = useMemo(() => quoteRollerWorkbookBlind(quoteInput), [
    cassette, fabricCode, family, heightCm, manualControl, motorType, mountPosition,
    hub, noDrill, operation, quantity, remote, track, widthCm,
  ]);
  const sizeLimits = useMemo(
    () => getRollerWorkbookSizeLimits(family, operation, fabricCode),
    [fabricCode, family, operation],
  );

  const chooseOperation = (next: RollerWorkbookOperation) => {
    setOperation(next);
    if (next !== "motor") {
      setRemote(false);
      setHub(false);
    }
    if (next === "manual" && family === "sheer") setManualControl("cord");
  };

  const addToCart = () => {
    if (!quote.ok || !fabric || unavailableOpenRoll) return;
    const configuration: Omit<RollerWorkbookQuoteInput, "quantity"> = (() => {
      const { quantity: _quantity, ...values } = quoteInput;
      return values;
    })();
    // The cart owns the persisted roller-workbook line and recalculates from
    // this exact engine input.
    addItem({
      type: "roller-workbook",
      productId: product.id,
      qty: quantity,
      configuration,
      fabricName: fabric.name,
    });
  };

  const activeFabric = {
    name: fabric ? `${fabric.code} · ${fabric.color}` : "Ekkert efni valið",
    image: fabric ? swatchForWorkbookFabric(fabric) : undefined,
  };

  if (unavailableOpenRoll) {
    return (
      <StorefrontLayout
        product={product}
        priceISK={0}
        priceText="—"
        priceLabel="Verð bíður staðfestingar"
        activeFabric={{ name: "Opið rúllukerfi" }}
        quantity={quantity}
        setQuantity={setQuantity}
        canAddToCart={false}
        onAddToCart={() => undefined}
        controls={
          <div className="border-b border-[#ccd9df] py-6">
            <p className="text-[10px] uppercase tracking-[.18em] text-[#6892b8]">Opið rúllukerfi</p>
            <p className="mt-3 text-sm leading-6 text-[#526772]">
              Verð og uppsetningarval fyrir opið rúllukerfi eru ekki staðfest í birgjavinnubókinni.
              Hafðu samband til að fá tilboð áður en hægt er að bæta vörunni í körfu.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#526772]">Hliðarlistar eru valfrjálsir. Láttu vita í tilboðsbeiðninni ef þú vilt bæta þeim við.</p>
            <a className="mt-4 inline-flex border border-[#24313b] px-4 py-3 text-[10px] uppercase tracking-[.16em]" href="mailto:info@gardinulausnir.is?subject=Tilboð%20í%20opið%20rúllukerfi">
              Óska eftir tilboði
            </a>
          </div>
        }
      />
    );
  }

  const errorMessage = !quote.ok
    ? "Ekki er hægt að reikna verð með þessum málum eða valkostum. Athugaðu mál, efni og uppsetningu."
    : null;
  const sideTrackExtra = (nextTrack: SideTrack) => {
    const withoutTrack = quoteRollerWorkbookBlind({ ...quoteInput, track: "none", quantity: 1 });
    const withTrack = quoteRollerWorkbookBlind({ ...quoteInput, track: nextTrack, quantity: 1 });
    if (!withoutTrack.ok || !withTrack.ok) return null;
    return withTrack.retail.unitIsk - withoutTrack.retail.unitIsk;
  };

  return (
    <StorefrontLayout
      product={product}
      priceISK={quote.ok ? quote.retail.totalIsk : 0}
      priceText={quote.ok ? `${quote.retail.totalIsk.toLocaleString("is-IS")} kr.` : "—"}
      priceLabel={quote.ok ? "Reiknað verð" : "Vantar gilt val"}
      activeFabric={activeFabric}
      quantity={quantity}
      setQuantity={setQuantity}
      canAddToCart={quote.ok}
      onAddToCart={addToCart}
      controls={
        <>
          {family === "roller" && (
            <aside className="my-5 rounded border border-[#9ebbd0] bg-[#eaf3f8] p-4 text-sm leading-6 text-[#344b59]" aria-label="Rúllugardínur með hliðarlistum">
              <strong className="block text-[#24313b]">Hægt að velja hliðarlista með rúllugardínum</strong>
              <p className="mt-1">Hliðarlistar hjálpa til við að draga úr birtu meðfram hliðum gardínunnar. Veldu með hliðarlistum eða án í valinu hér fyrir neðan. Þeir eru valfrjálsir og verð þeirra bætist aðeins við ef þeir eru valdir.</p>
              <figure className="mt-4 flex flex-col items-center gap-3 rounded border border-[#ccd9df] bg-white p-3 sm:flex-row">
                <img src={sideTrackImage} alt="Nærmynd af hvítum hliðarlista með burstum við raufina fyrir gardínuefnið" width={575} height={1024} className="h-44 w-28 shrink-0 object-contain" />
                <figcaption className="text-xs leading-5">
                  <strong className="block text-[#24313b]">Hliðarlisti í nærmynd</strong>
                  <span className="mt-1 block">Hér sést rauf með burstum meðfram brún gardínuefnisins. Myndin sýnir dæmi um útfærslu; litur og gerð fara eftir vali.</span>
                </figcaption>
              </figure>
            </aside>
          )}
          <section className="border-b border-[#ccd9df] py-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[.18em]">Efni · {FAMILY_LABELS[family]}</p>
              <span className="text-[10px] text-[#667984]">{familyFabrics.length} valkostir</span>
            </div>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-3 text-[#667984]" size={15} />
              <input aria-label="Leita að efni" value={fabricSearch} onChange={(event) => setFabricSearch(event.target.value)} placeholder="Leita eftir kóða, lit eða ljósgerð" className="w-full border border-[#ccd9df] bg-transparent py-3 pl-9 pr-3 text-sm outline-none focus:border-[#24313b]" />
            </label>
            <label className="mt-3 block">
              <span className="sr-only">Veldu efni</span>
              <select data-testid="rw-fabric" aria-label="Veldu efni" value={fabricCode} onChange={(event) => setFabricCode(event.target.value)} className="w-full border border-[#ccd9df] bg-[#f7f9fa] px-3 py-3 text-sm outline-none focus:border-[#24313b]">
                {selectFabrics.length === 0 ? <option value="">Engin efni fundust</option> : selectFabrics.map((item) => (
                  <option key={item.code} value={item.code}>{item.code} · {item.color} · {item.light} · {item.size}</option>
                ))}
              </select>
            </label>
            <div className="mt-3 grid max-h-96 grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-4" aria-label="Efnisýni" data-testid="rw-swatches">
              {(family === "roller" ? visibleFabrics : visibleFabrics.filter((item) => swatchForWorkbookFabric(item))).map((item) => {
                const image = swatchForWorkbookFabric(item);
                return <button key={item.code} type="button" aria-label={`${item.code} · ${item.color}`} aria-pressed={item.code === fabricCode} title={`${item.code} · ${item.color}`} onClick={() => setFabricCode(item.code)} className={`relative min-w-0 overflow-hidden border text-left ${item.code === fabricCode ? "border-[#24313b] ring-1 ring-[#24313b]" : "border-[#ccd9df]"}`}>
                  {image
                    ? <img src={image} alt={`${item.code}, ${item.color}`} loading="lazy" className="aspect-square w-full object-cover" />
                    : <span className="flex aspect-square items-center justify-center bg-[#eef2f4] p-2 text-center text-[10px] text-[#667984]">Mynd ekki tiltæk</span>}
                  <span className="block break-words px-1.5 py-2 text-[9px] leading-4"><strong className="block">{item.code}</strong>{item.color}</span>
                  {item.code === fabricCode && <Check className="absolute right-1 top-1 rounded-full bg-[#24313b] p-0.5 text-white" size={20} />}
                </button>;
              })}
            </div>
            {visibleFabrics.length === 0 && <p role="status" className="mt-3 text-xs text-[#667984]">Engin efni fundust. Prófaðu annan kóða eða lit.</p>}
            {fabric && <p className="mt-3 text-xs text-[#667984]">{fabric.code} · {fabric.color} · {fabric.light} · {fabric.size}</p>}
            {fabric && !activeFabric.image && <p className="mt-2 text-xs text-[#667984]">Mynd af þessu efni er ekki tiltæk. Efnið er valið eftir birgjakóða.</p>}
          </section>

          <section className="border-b border-[#ccd9df] py-6">
            <p className="mb-3 text-[10px] uppercase tracking-[.18em]">Mál og uppsetning</p>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span><input data-testid="rw-width" aria-label="Breidd í sentímetrum" value={widthCm} onChange={(event) => setWidthCm(event.target.value)} type="number" min="1" step="0.1" inputMode="decimal" className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 outline-none focus:border-[#24313b]" /></label>
              <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span><input data-testid="rw-height" aria-label="Hæð í sentímetrum" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} type="number" min="1" step="0.1" inputMode="decimal" className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 outline-none focus:border-[#24313b]" /></label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["inside", "outside"] as const).map((value) => <button key={value} type="button" onClick={() => setMountPosition(value)} className={`border px-3 py-3 text-left text-xs ${mountPosition === value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{value === "inside" ? "Innan í gluggakarmi" : "Utan á karm"}<span className="mt-1 block text-[10px] text-[#667984]">{value === "inside" ? "5 mm dregnir frá breidd" : "Enginn frádráttur"}</span></button>)}
            </div>
          </section>

          <section className="border-b border-[#ccd9df] py-6">
            <p className="mb-3 text-[10px] uppercase tracking-[.18em]">Stýring</p>
            <div className="grid grid-cols-3 gap-2">
              {(["manual", "cordless", "motor"] as const).filter((value) => !(family === "sheer" || family === "butterfly") || value !== "cordless").map((value) => <button data-testid={`rw-operation-${value}`} key={value} type="button" onClick={() => chooseOperation(value)} className={`border px-2 py-3 text-[10px] ${operation === value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{value === "manual" ? "Handvirkt" : value === "cordless" ? "Snúrulaust" : "Mótor"}</button>)}
            </div>
            {operation === "manual" && <select data-testid="rw-manual-control" aria-label="Veldu handstýringu" value={manualControl} onChange={(event) => setManualControl(event.target.value as ManualControl)} className="mt-3 w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm"><option value="" disabled>Veldu handstýringu</option>{controlsFor(family).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>}
            {operation === "motor" && <>
              <select data-testid="rw-motor-type" aria-label="Veldu mótor" value={motorType} onChange={(event) => setMotorType(event.target.value as MotorType)} className="mt-3 w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm">{MOTOR_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
              <label className="mt-3 flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-xs">Fjarstýring<input data-testid="rw-remote" aria-label="Fjarstýring" type="checkbox" checked={remote} onChange={(event) => setRemote(event.target.checked)} /></label>
              <label className="mt-3 flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-xs"><span>Hub <span className="block text-[10px] text-[#667984]">Valfrjálst · samhæfni og þörf bíður staðfestingar birgja. Einn hub fyrir hverja gardínu.</span></span><input data-testid="rw-hub" aria-label="Valfrjáls hub" type="checkbox" checked={hub} onChange={(event) => setHub(event.target.checked)} /></label>
            </>}
            {family !== "butterfly" && <label className="mt-3 flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-xs">Uppsetning án borunar<input data-testid="rw-no-drill" aria-label="Uppsetning án borunar" type="checkbox" checked={noDrill} onChange={(event) => setNoDrill(event.target.checked)} /></label>}
          </section>

          <section className="border-b border-[#ccd9df] py-6">
            <p className="text-[10px] font-medium uppercase tracking-[.16em] text-[#6892b8]">Hliðarlistar</p>
            {family === "roller" && <p className="mt-2 text-xs leading-5 text-[#667984]">Hliðarlistar eru valfrjálsir. Verð þeirra bætist aðeins við heildarverðið ef þeir eru valdir.</p>}
            <div className="mt-2 grid grid-cols-2 gap-2">{TRACKS[family].map((item) => {
              const extra = sideTrackExtra(item.value);
              return <button data-testid={`rw-track-${item.value}`} key={item.value} type="button" aria-pressed={track === item.value} onClick={() => setTrack(item.value)} className={`border px-3 py-3 text-left text-xs ${track === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}><span className="block">{item.label}</span>{extra !== null && <span className="mt-1 block text-[10px] text-[#667984]">{extra === 0 ? "Innifalið" : `+${extra.toLocaleString("is-IS")} kr. / stk.`}</span>}</button>;
            })}</div>
            <p className="mt-5 text-[10px] font-medium uppercase tracking-[.16em] text-[#6892b8]">Kassetta</p>
            <select data-testid="rw-cassette" aria-label="Veldu kassetu" value={cassette} onChange={(event) => setCassette(event.target.value)} disabled={cassetteChoices.length === 1} className="mt-2 w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70">{cassetteChoices.map((item) => <option key={item} value={item}>{item === ROLLER_WORKBOOK_CASSETTES[0] ? "Ferningskassetta með efni" : "Bogakassetta með efni"}</option>)}</select>
            {sizeLimits && <p className="mt-3 text-xs leading-5 text-[#667984]">Leyfileg mál fyrir valið efni og stýringu: {sizeLimits.minWidthMm}–{sizeLimits.maxWidthMm} mm á breidd, {sizeLimits.minHeightMm}–{sizeLimits.maxHeightMm} mm á hæð, mest {sizeLimits.maxAreaSqm} m².</p>}
          </section>
          {errorMessage && <p role="alert" className="border-b border-red-200 bg-red-50 px-3 py-4 text-sm leading-5 text-red-800">{errorMessage}</p>}
        </>
      }
    />
  );
}

export default RollerWorkbookCalculator;