export const BUSINESS_INQUIRY_RECIPIENT = "hallo@gardinulausnir.is";

export type BusinessInquiryFields = {
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  projectDescription: string;
  quantity?: string;
  desiredTiming?: string;
};

export type BusinessInquiryErrors = Partial<Record<keyof BusinessInquiryFields, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBusinessInquiry(fields: BusinessInquiryFields): BusinessInquiryErrors {
  const errors: BusinessInquiryErrors = {};
  if (!fields.company.trim()) errors.company = "Fyrirtæki er nauðsynlegt.";
  if (!fields.contactName.trim()) errors.contactName = "Nafn tengiliðar er nauðsynlegt.";
  if (!fields.email.trim()) errors.email = "Netfang er nauðsynlegt.";
  else if (!emailPattern.test(fields.email.trim())) errors.email = "Sláðu inn gilt netfang.";
  if (!fields.projectDescription.trim()) errors.projectDescription = "Lýsing verkefnis er nauðsynleg.";
  if (fields.quantity?.trim() && !/^[1-9]\d*$/.test(fields.quantity.trim())) {
    errors.quantity = "Áætlaður fjöldi þarf að vera jákvæð heil tala.";
  }
  return errors;
}

export function formatBusinessInquiry(
  fields: BusinessInquiryFields,
  productContext?: string,
  recipient = BUSINESS_INQUIRY_RECIPIENT,
) {
  const value = (input?: string) => input?.trim() || "Ekki tilgreint";
  const subject = `Tilboðsbeiðni fyrirtækis – ${fields.company.trim()}`;
  const body = [
    "Tilboðsbeiðni fyrirtækis",
    "",
    `Fyrirtæki: ${fields.company.trim()}`,
    `Tengiliður: ${fields.contactName.trim()}`,
    `Netfang: ${fields.email.trim()}`,
    `Sími: ${value(fields.phone)}`,
    `Vara / samhengi: ${value(productContext)}`,
    `Áætlaður fjöldi: ${value(fields.quantity)}`,
    `Óskuð tímasetning: ${value(fields.desiredTiming)}`,
    "",
    "Lýsing verkefnis:",
    fields.projectDescription.trim(),
  ].join("\n");

  return {
    subject,
    body,
    mailto: `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}