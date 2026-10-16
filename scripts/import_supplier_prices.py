"""Generate exact-key supplier rates; invalid or conflicting entries retain legacy rates."""
import collections
import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

source = pathlib.Path(sys.argv[1])
root = pathlib.Path(__file__).resolve().parents[1]
ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
groups = collections.defaultdict(list)
with zipfile.ZipFile(source) as archive:
    strings = ["".join(node.itertext()) for node in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
    for row in ET.fromstring(archive.read("xl/worksheets/sheet7.xml")).findall("s:sheetData/s:row", ns):
        values = {}
        for cell in row:
            value = cell.find("s:v", ns)
            if value is not None:
                values[re.sub(r"\d", "", cell.get("r"))] = strings[int(value.text)] if cell.get("t") == "s" else value.text
        if not values.get("D") or values.get("D") == "CODE":
            continue
        key = "|".join(values.get(col, "").strip() for col in ("B", "C", "G", "D"))
        try:
            price = float(values.get("H", ""))
        except ValueError:
            price = 0
        groups[key].append(price)

rates = {key: prices[0] for key, prices in groups.items() if len(set(prices)) == 1 and prices[0] > 0}
text = '''// Generated from Quote for all blinds REV 4.0, visible Price sheet-ALL.
// User-approved policy: zero, missing and conflicting values retain prior prices.
const rates: Record<string, number> = ''' + json.dumps(rates, ensure_ascii=False, indent=2) + ''';
export function supplierRate(product: string, style: string, size: string, code: string, previous: number): number {
  return rates[[product, style, size, code].join("|")] ?? previous;
}
export function updateSupplierTable(table: Record<string, { usdPerSqm: number }>, product: string, style: string, size: string) {
  for (const [code, entry] of Object.entries(table)) entry.usdPerSqm = supplierRate(product, style, size, code, entry.usdPerSqm);
}
'''
for relative in ("artifacts/gardinulausnir/src/lib/supplierPricesRev4.ts", "artifacts/api-server/src/lib/supplierPricesRev4.ts"):
    (root / relative).write_text(text)
mirror = root.parents[1] / "artifacts/api-server/src/lib"
if mirror.is_dir():
    (mirror / "supplierPricesRev4.ts").write_text(text)
print(f"Generated {len(rates)} valid exact-key rates; retained prior pricing for {len(groups)-len(rates)} invalid/conflicting keys.")
