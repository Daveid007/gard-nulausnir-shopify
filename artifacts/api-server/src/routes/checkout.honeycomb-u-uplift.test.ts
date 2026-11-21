import test from "node:test";
import assert from "node:assert/strict";
import { buildCartQuote, buildShopifyDraftOrderLines, checkoutRequestSchema } from "./checkout";
import { orderFreightUsd } from "../lib/freight";

const base = { type:"honeycomb",qty:1,width:1405,height:1245,fabricCode:"KB402",
  operation:"manual",mountPosition:"inside",sideTrack:true,sideTrackType:"u",
  railColor:"Hvítur",bottomRail:"Hvítur" };
const items = (overrides = {}) => checkoutRequestSchema.parse({items:[{...base,...overrides}]}).items;

test("45 mm U tracks: existing 24,874 becomes 31,093 in quote and Shopify lines",()=>{
  const input=items();
  const snapshot=JSON.stringify(input);
  assert.equal(Math.round(24874*1.25),31093);
  assert.equal(buildCartQuote(input).totalIsk,31093);
  assert.equal(buildShopifyDraftOrderLines(input)[0].unitPriceIsk,31093);
  assert.equal(JSON.stringify(input),snapshot);
});
test("without tracks remains 21,757, with free installation unchanged",()=>{
  assert.equal(buildCartQuote(items({sideTrack:false})).totalIsk,21757);
  assert.equal(buildCartQuote(items()).installationIsk,0);
  assert.equal(buildCartQuote(items()).totalIsk,31093);
  assert.equal(buildCartQuote(items()).deliveryIncluded,false);
});
test("U track uplift does not change freight or the other line in a mixed cart",()=>{
  const withTracks=items();
  const withoutTracks=items({sideTrack:false});
  assert.equal(orderFreightUsd(withTracks[0],withTracks),orderFreightUsd(withoutTracks[0],withoutTracks));
  const mixed=[...withTracks,...withoutTracks];
  const control=[...withoutTracks,...withoutTracks];
  assert.equal(buildCartQuote(mixed).lines[1].unitPriceIsk,buildCartQuote(control).lines[1].unitPriceIsk);
  const lines=buildShopifyDraftOrderLines(mixed);
  assert.equal(buildCartQuote(mixed).totalIsk,lines.reduce((sum,l)=>sum+l.unitPriceIsk*l.quantity,0));
});
