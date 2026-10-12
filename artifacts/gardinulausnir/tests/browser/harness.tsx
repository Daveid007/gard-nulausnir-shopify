import { useState } from "react";
import { createRoot } from "react-dom/client";
import { RollerWorkbookCalculator, type RollerWorkbookProductIdentity } from "../../src/components/legacy-calculators/RollerWorkbookCalculator";
import { WorkbookFabricSwatch } from "../../src/components/legacy-calculators/WorkbookFabricSwatch";
import { CartProvider, useCart } from "../../src/lib/cart";
import "../../src/index.css";

const identities: Record<string, RollerWorkbookProductIdentity> = {
  roller: "square-cassette",
  zebra: "zebra-blind",
  sheer: "sheer-shades",
  butterfly: "butterfly-blinds",
};

function CartGuard() {
  const { items } = useCart();
  return <output data-testid="cart-count">{items.length}</output>;
}

function ReplacementImageHarness() {
  const [image, setImage] = useState("/fixture/failed.png");
  const [selected, setSelected] = useState(false);
  return (
    <section className="max-w-sm p-4">
      <div data-testid="replacement-card">
        <WorkbookFabricSwatch
          fabric={{ code: "BROWSER-TEST", color: "/" }}
          image={image}
          selected={selected}
          onSelect={() => setSelected(true)}
        />
      </div>
      {/* Update props on the SAME mounted component, rather than remounting it. */}
      <button type="button" onClick={() => setImage("/fixture/replacement.png")}>
        Load replacement image
      </button>
    </section>
  );
}

const params = new URLSearchParams(location.search);
const family = params.get("family") ?? "roller";
const identity = identities[family];
if (!identity) throw new Error(`Unsupported test family: ${family}`);

createRoot(document.getElementById("root")!).render(
  params.get("mode") === "replacement" ? <ReplacementImageHarness /> : (
    <CartProvider>
      <main className="mx-auto max-w-7xl p-4">
        <RollerWorkbookCalculator
          productIdentity={identity}
          product={{
            id: identity,
            title: "Browser regression fixture",
            image: undefined,
            gallery: [],
          }}
        />
        <CartGuard />
      </main>
    </CartProvider>
  ),
);
