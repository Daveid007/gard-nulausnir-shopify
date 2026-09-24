import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatBusinessInquiry,
  validateBusinessInquiry,
  type BusinessInquiryErrors,
  type BusinessInquiryFields,
} from "@/lib/businessInquiry";

type BusinessInquiryButtonProps = {
  productContext?: string;
  className?: string;
  label?: string;
};

const inputClass = "mt-1.5 w-full border border-[#b9cbd4] bg-white px-3 py-2.5 text-sm text-[#24313b] outline-none transition focus:border-[#6892b8] focus:ring-2 focus:ring-[#a2c2e2]";
const labelClass = "block text-[10px] font-medium uppercase tracking-[.13em] text-[#43515a]";

export function BusinessInquiryButton({ productContext, className = "", label = "Fyrirtæki" }: BusinessInquiryButtonProps) {
  const [errors, setErrors] = useState<BusinessInquiryErrors>({});
  const [result, setResult] = useState<ReturnType<typeof formatBusinessInquiry> | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields: BusinessInquiryFields = {
      company: String(data.get("company") ?? ""),
      contactName: String(data.get("contactName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      projectDescription: String(data.get("projectDescription") ?? ""),
      quantity: String(data.get("quantity") ?? ""),
      desiredTiming: String(data.get("desiredTiming") ?? ""),
    };
    const nextErrors = validateBusinessInquiry(fields);
    setErrors(nextErrors);
    setCopyStatus("");
    if (Object.keys(nextErrors).length) {
      setResult(null);
      return;
    }
    setResult(formatBusinessInquiry(fields, productContext));
  };

  const copyRequest = async () => {
    if (!result) return;
    if (!navigator.clipboard?.writeText) {
      setCopyStatus("Ekki tókst að afrita. Veldu textann og afritaðu hann handvirkt.");
      return;
    }
    try {
      await navigator.clipboard.writeText(result.body);
      setCopyStatus("Fyrirspurnartextinn var afritaður.");
    } catch {
      setCopyStatus("Ekki tókst að afrita. Veldu textann og afritaðu hann handvirkt.");
    }
  };

  const error = (name: keyof BusinessInquiryFields) =>
    errors[name] ? <span id={`business-${name}-error`} className="mt-1 block text-xs normal-case tracking-normal text-red-700">{errors[name]}</span> : null;

  return (
    <Dialog onOpenChange={() => { setErrors({}); setResult(null); setCopyStatus(""); }}>
      <DialogTrigger asChild>
        <button
          type="button"
          data-testid="business-inquiry-open"
          className={`whitespace-nowrap text-[10px] uppercase tracking-[.16em] text-[#43515a] transition-colors hover:text-[#6892b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8] ${className}`}
        >
          {label}
        </button>
      </DialogTrigger>
      <DialogContent data-testid="business-inquiry-dialog" className="max-h-[92dvh] max-w-2xl overflow-y-auto border-[#b9cbd4] bg-[#edf3f8] p-5 text-[#24313b] sm:p-8">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-serif text-3xl tracking-[-.04em]">Tilboðsbeiðni fyrir fyrirtæki</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#5a6b74]">
            Fylltu út upplýsingarnar og búðu til tölvupóst. „Opna tölvupóst“ opnar póstforritið þitt; þú þarft sjálf/ur að senda skilaboðin þar.
          </DialogDescription>
        </DialogHeader>
        {productContext && <p className="border border-[#c8d7de] bg-[#e2edf1] px-3 py-2 text-xs">Vara: {productContext}</p>}
        <form data-testid="business-inquiry-form" onSubmit={submit} onInput={() => { setResult(null); setCopyStatus(""); }} noValidate className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Fyrirtæki <span aria-hidden="true">*</span>
            <input className={inputClass} name="company" required aria-invalid={!!errors.company} aria-describedby={errors.company ? "business-company-error" : undefined} />
            {error("company")}
          </label>
          <label className={labelClass}>Nafn tengiliðar <span aria-hidden="true">*</span>
            <input className={inputClass} name="contactName" required aria-invalid={!!errors.contactName} aria-describedby={errors.contactName ? "business-contactName-error" : undefined} />
            {error("contactName")}
          </label>
          <label className={labelClass}>Netfang <span aria-hidden="true">*</span>
            <input className={inputClass} name="email" type="email" required aria-invalid={!!errors.email} aria-describedby={errors.email ? "business-email-error" : undefined} />
            {error("email")}
          </label>
          <label className={labelClass}>Sími <span className="normal-case tracking-normal text-[#667984]">(valfrjálst)</span>
            <input className={inputClass} name="phone" type="tel" />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>Lýsing verkefnis <span aria-hidden="true">*</span>
            <textarea className={`${inputClass} min-h-28 resize-y`} name="projectDescription" required aria-invalid={!!errors.projectDescription} aria-describedby={errors.projectDescription ? "business-projectDescription-error" : undefined} />
            {error("projectDescription")}
          </label>
          <label className={labelClass}>Áætlaður fjöldi <span className="normal-case tracking-normal text-[#667984]">(valfrjálst)</span>
            <input className={inputClass} name="quantity" type="number" inputMode="numeric" min="1" step="1" aria-invalid={!!errors.quantity} aria-describedby={errors.quantity ? "business-quantity-error" : undefined} />
            {error("quantity")}
          </label>
          <label className={labelClass}>Óskuð tímasetning <span className="normal-case tracking-normal text-[#667984]">(valfrjálst)</span>
            <input className={inputClass} name="desiredTiming" type="text" />
          </label>
          <button type="submit" data-testid="business-inquiry-compose" className="sm:col-span-2 bg-[#a2c2e2] px-5 py-3.5 text-[10px] uppercase tracking-[.18em] transition-colors hover:bg-[#89b0d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8]">
            Útbúa tölvupóst
          </button>
        </form>
        {result && (
          <section data-testid="business-inquiry-result" className="border-t border-[#b9cbd4] pt-4" aria-label="Tilbúin tilboðsbeiðni">
            <p className="text-sm leading-6">Beiðnin er tilbúin en hefur ekki verið send. Opnaðu póstforritið og sendu hana þaðan til sala@gardinulausnir.is.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <a data-testid="business-inquiry-mailto" href={result.mailto} className="inline-flex justify-center bg-[#a2c2e2] px-5 py-3 text-[10px] uppercase tracking-[.16em] hover:bg-[#89b0d5]">Opna tölvupóst</a>
              <button type="button" data-testid="business-inquiry-copy" onClick={copyRequest} className="border border-[#8ca9b8] px-5 py-3 text-[10px] uppercase tracking-[.16em]">Afrita fyrirspurnartexta</button>
            </div>
            <textarea readOnly aria-label="Fyrirspurnartexti til afritunar" value={result.body} className="mt-3 min-h-36 w-full border border-[#b9cbd4] bg-white p-3 text-xs leading-5" />
            <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-[#43515a]">{copyStatus}</p>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}