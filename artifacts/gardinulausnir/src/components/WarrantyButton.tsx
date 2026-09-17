import { ShieldCheck } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function WarrantyText() {
  return <>Við bjóðum <strong className="text-[#24313b]">5 ára ábyrgð</strong> á vélbúnaði og brautum fyrir allar okkar gardínur.</>;
}

export function WarrantyButton({ label = "5 ára ábyrgð", className }: { label?: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={className ?? "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-[#94b3cf] bg-[#e2edf6] px-3 py-2 text-xs font-medium text-[#24313b] transition hover:bg-[#cddfec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6892b8] focus-visible:ring-offset-2"}>
          <ShieldCheck size={17} aria-hidden="true" />
          {label}
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg border-[#ccd9df] bg-[#f7f9fa] p-6 text-[#24313b]">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle className="font-serif text-3xl">5 ára ábyrgð</DialogTitle>
          <DialogDescription className="text-[#596872]">Ábyrgð á vélbúnaði og brautum.</DialogDescription>
        </DialogHeader>
        <p className="text-sm leading-6 text-[#596872]"><WarrantyText /></p>
        <a className="w-fit text-sm text-[#435f79] underline underline-offset-4" href="mailto:hallo@gardinulausnir.is?subject=Spurning%20um%20%C3%A1byrg%C3%B0">Spyrja um ábyrgð</a>
        <DialogClose asChild>
          <button type="button" className="mt-2 min-h-11 border border-[#94b3cf] bg-[#e2edf6] px-4 py-2 text-sm hover:bg-[#cddfec]">Loka</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}