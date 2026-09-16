import { Footer } from "@/components/Footer";

// Compatibility wrapper only: Footer owns the data-testid="footer" and its
// lg:grid-cols-4 layout so product pages never render a second legacy footer.
export function ProductInfoFooter() {
  return <Footer />;
}
