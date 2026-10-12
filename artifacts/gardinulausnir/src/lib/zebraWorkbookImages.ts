/**
 * Supplier photos checked against the code printed on each image.
 * DS-TR / DS-RD / DS-BO are workbook category prefixes, not photo codes.
 * ZU00 has no current priced workbook row. DL22034-0002 is excluded because
 * that uploaded image is labelled DL22034-0003.
 */
export const zebraWorkbookImageManifest: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries([
    "DL20205-0090", "DL20205-0092", "DL20205-0007", "DL20205-0004", "DL20205-0003",
    "DL20025-0004", "DL20025-0003", "DL20025-0002", "DL20025-0001",
    "BE503", "BE502", "BE501",
    "BL2005", "BL2004", "BL2003", "BL2002", "BL2001",
    "G37-005", "G37-004", "G37-003", "G37-002", "G37-001",
    "G38-005", "G38-004", "G38-003", "G38-002", "G38-001",
    "G35-004", "G35-003", "G35-002", "G35-001",
    "G32-004", "G32-003", "G32-002", "G32-001",
    "BL5109", "BL5108", "BL5107", "BL5106", "BL5105", "BL5104", "BL5103", "BL5102", "BL5101",
    "BL5006", "BL5005", "BL5004", "BL5003", "BL5002", "BL5001",
    "G31-005", "G31-004", "G31-003", "G31-002", "G31-001",
    "BL210", "BL208", "BL207", "BL206", "BL203", "BL202", "BL201",
    "HYBZ-909", "HYBZ-907", "HYBZ-905", "HYBZ-903", "HYBZ-901",
    "DL22030-0005", "DL22030-0004", "DL22030-0003", "DL22030-0002", "DL22030-0001",
    "DL22033-0004", "DL22033-0002", "DL22033-0001",
    "DL22034-0013", "DL22034-0012", "DL22034-0011", "DL22034-0008", "DL22034-0003", "DL22034-0001",
  ].map((code) => [code.replace(/[^A-Z0-9]/g, ""), `zebra-${code}.webp`])),
);

export function zebraWorkbookSwatchFilename(code: string): string | undefined {
  const supplierCode = code.toUpperCase().replace(/^DS-(TR|RD|BO)-/, "");
  return zebraWorkbookImageManifest[supplierCode.replace(/[^A-Z0-9]/g, "")];
}
