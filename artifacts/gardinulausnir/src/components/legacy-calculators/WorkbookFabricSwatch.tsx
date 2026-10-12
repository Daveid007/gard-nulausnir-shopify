import { useState } from "react";
import { Check } from "lucide-react";
import type { RollerWorkbookFabric } from "../../data/rollerWorkbookFabrics";

type Props = {
  fabric: Pick<RollerWorkbookFabric, "code" | "color">;
  image?: string;
  selected: boolean;
  onSelect: () => void;
};

export function WorkbookFabricSwatch({ fabric, image, selected, onSelect }: Props) {
  const [failedImage, setFailedImage] = useState<string>();
  const showImage = Boolean(image && image !== failedImage);
  const color = fabric.color.trim() && fabric.color.trim() !== "/"
    ? fabric.color
    : "Litur samkvæmt efniskóða";
  const label = `${fabric.code} · ${color}`;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      data-image-state={showImage ? "available" : "unavailable"}
      onClick={onSelect}
      className={`relative min-w-0 overflow-hidden border text-left ${selected ? "border-[#24313b] ring-1 ring-[#24313b]" : "border-[#ccd9df]"}`}
    >
      {showImage ? (
        <img
          src={image}
          alt={label}
          loading="lazy"
          onError={() => setFailedImage(image)}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <span className="flex aspect-square items-center justify-center bg-[#eef2f4] p-2 text-center text-[10px] text-[#667984]">
          Mynd ekki tiltæk
        </span>
      )}
      <span className="block break-words px-1.5 py-2 text-[9px] leading-4">
        <strong className="block">{fabric.code}</strong>
        {color}
      </span>
      {selected && <Check className="absolute right-1 top-1 rounded-full bg-[#24313b] p-0.5 text-white" size={20} />}
    </button>
  );
}
