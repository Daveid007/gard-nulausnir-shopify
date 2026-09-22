import assert from "node:assert/strict";
import { formatBusinessInquiry, validateBusinessInquiry } from "../src/lib/businessInquiry.ts";

const valid = {
  company: "Próf & co.",
  contactName: "Ása Jónsdóttir",
  email: "asa@example.is",
  phone: "555 1234",
  projectDescription: "Gardínur í tvö rými.\nÞarf ráðgjöf.",
  quantity: "12",
  desiredTiming: "Fyrir júní",
};

assert.deepEqual(validateBusinessInquiry(valid), {});
assert.ok(validateBusinessInquiry({ ...valid, company: "", email: "rangt", quantity: "1.5" }).company);
assert.ok(validateBusinessInquiry({ ...valid, company: "", email: "rangt", quantity: "1.5" }).email);
assert.ok(validateBusinessInquiry({ ...valid, company: "", email: "rangt", quantity: "1.5" }).quantity);

const formatted = formatBusinessInquiry(valid, "Rúllugardína – blá");
assert.match(formatted.mailto, /^mailto:hallo@gardinulausnir\.is\?/);
assert.equal(decodeURIComponent(formatted.mailto.split("subject=")[1].split("&body=")[0]), "Tilboðsbeiðni fyrirtækis – Próf & co.");
const decodedBody = decodeURIComponent(formatted.mailto.split("&body=")[1]);
for (const expected of ["Próf & co.", "Ása Jónsdóttir", "asa@example.is", "555 1234", "Gardínur í tvö rými.", "12", "Fyrir júní", "Rúllugardína – blá"]) {
  assert.ok(decodedBody.includes(expected), `body should include ${expected}`);
}

console.log("Business inquiry formatter and validation tests passed.");