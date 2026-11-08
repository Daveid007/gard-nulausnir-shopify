import type { FabricInfo } from "@/lib/dualRollerFabrics";
import { rollerWorkbookSwatchFilename } from "@/lib/rollerWorkbookSwatches";
import { swatchUrl } from "@/pages/storefront/_shared/swatches";

export function dualRollerSwatch(code: string): string | undefined {
  const filename = rollerWorkbookSwatchFilename({ family: "roller", code });
  return filename ? swatchUrl(filename) || undefined : undefined;
}

export function DualRollerFabricPicker({ layer, fabrics, selected, onSelect }: {
  layer: "front" | "back";
  fabrics: FabricInfo[];
  selected: FabricInfo;
  onSelect: (code: string) => void;
}) {
  return <div>
    <span className="mb-2 block text-[10px] uppercase tracking-[.18em]">
      {layer === "front" ? "Fremra lag" : "Aftara lag"} · {selected.is} · {selected.code}
    </span>
    <div data-testid={`dualroller-${layer}-fabrics`} className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
      {fabrics.map((fabric) => {
        const image = dualRollerSwatch(fabric.code);
        return <button type="button" key={fabric.code} data-testid={`dualroller-${layer}-${fabric.code}`}
          onClick={() => onSelect(fabric.code)} aria-pressed={selected.code === fabric.code}
          aria-label={`Velja ${fabric.is} (${fabric.code})`}
          className={`min-w-0 border p-1 text-left ${selected.code === fabric.code ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
          {image ? <img src={image} alt={fabric.is} loading="lazy" className="aspect-square w-full object-cover" />
            : <span className="flex aspect-square items-center justify-center text-[10px]">Mynd ekki tiltæk</span>}
          <span className="mt-1 block break-words text-[10px]">{fabric.is}</span>
          <span className="block break-all text-[9px]">{fabric.code}</span>
        </button>;
      })}
    </div>
  </div>;
}
