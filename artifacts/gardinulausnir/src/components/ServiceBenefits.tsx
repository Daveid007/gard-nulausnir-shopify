import { Ruler, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "wouter";
import { WarrantyButton } from "@/components/WarrantyButton";

const itemClass = "flex min-h-11 flex-col items-center gap-1 border text-center sm:flex-row sm:gap-2.5 sm:text-left border-[#94b3cf] bg-[#e2edf6] px-2 py-2 text-[#24313b] sm:px-3 transition hover:bg-[#cddfec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6892b8] focus-visible:ring-offset-2";

function BenefitText({ title, detail }: { title: string; detail: string }) {
  return (
    <span className="leading-tight">
      <span className="block text-xs font-semibold">{title}</span>
      <span className="hidden text-[10px] text-[#596872] sm:block">{detail}</span>
    </span>
  );
}

/**
 * The three service promises shown together wherever a customer decides to
 * buy: free installation, free measuring and the five-year warranty.
 */
export function ServiceBenefits({ className = "" }: { className?: string }) {
  return (
    <ul data-testid="service-benefits" aria-label="Innifalið í þjónustu" className={`grid grid-cols-3 gap-2 ${className}`}>
      <li>
        <div className={`${itemClass} h-full cursor-default hover:bg-[#e2edf6]`}>
          <Wrench size={17} aria-hidden="true" className="shrink-0" />
          <BenefitText title="Frí uppsetning" detail="Á höfuðborgarsvæðinu" />
        </div>
      </li>
      <li>
        <Link href="/maelingar" className={`${itemClass} h-full`}>
          <Ruler size={17} aria-hidden="true" className="shrink-0" />
          <BenefitText title="Frí mæling" detail="Á höfuðborgarsvæðinu" />
        </Link>
      </li>
      <li>
        <WarrantyButton
          className={`${itemClass} h-full w-full`}
          label={<><ShieldCheck size={17} aria-hidden="true" className="shrink-0" /><BenefitText title="5 ára ábyrgð" detail="Á vélbúnaði og brautum" /></>}
          hideIcon
        />
      </li>
    </ul>
  );
}
