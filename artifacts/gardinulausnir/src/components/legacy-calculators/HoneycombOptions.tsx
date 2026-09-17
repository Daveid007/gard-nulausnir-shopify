import type { Dispatch, SetStateAction } from "react";
import type { MountPosition } from "@/lib/pricing";

type HoneycombOptionsProps = {
  idPrefix: string;
  sideTrack: boolean;
  sideTrackType: "u" | "l";
  setSideTrackType: Dispatch<SetStateAction<"u" | "l">>;
  mountPosition: MountPosition;
  setMountPosition: Dispatch<SetStateAction<MountPosition>>;
  noDrill: boolean;
  setNoDrill: Dispatch<SetStateAction<boolean>>;
};

/**
 * The storefront calculators keep the side-track toggle next to the operation
 * controls. These are the dependent options for that existing toggle.
 */
export function HoneycombOptions({
  idPrefix,
  sideTrack,
  sideTrackType,
  setSideTrackType,
  mountPosition,
  setMountPosition,
  noDrill,
  setNoDrill,
}: HoneycombOptionsProps) {
  return (
    <div data-testid={`${idPrefix}-honeycomb-options`} className="space-y-3">
      {sideTrack && (
        <label className="block">
          <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hliðarspor / Track</span>
          <select
            aria-label="Hliðarspor / Track"
            data-testid={`${idPrefix}-track-type`}
            value={sideTrackType}
            onChange={(event) => setSideTrackType(event.target.value as "u" | "l")}
            className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm"
          >
            <option value="u">U-spor (+10 USD/m)</option>
            <option value="l">L-spor (+5 USD/m)</option>
          </select>
        </label>
      )}
      <label className="block">
        <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Festing / Mount</span>
        <select
          aria-label="Festing / Mount"
          data-testid={`${idPrefix}-mount-position`}
          value={mountPosition}
          onChange={(event) => setMountPosition(event.target.value as MountPosition)}
          className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm"
        >
          <option value="outside">Utanáliggjandi / Outside</option>
          <option value="inside">Innfelld / Inside (−5 mm breidd)</option>
        </select>
      </label>
      <label className="flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px] uppercase">
        <span>Án borunar / No-drill (+3 USD/m²)</span>
        <input
          type="checkbox"
          aria-label="Án borunar / No-drill"
          data-testid={`${idPrefix}-no-drill`}
          checked={noDrill}
          onChange={(event) => setNoDrill(event.target.checked)}
        />
      </label>
    </div>
  );
}