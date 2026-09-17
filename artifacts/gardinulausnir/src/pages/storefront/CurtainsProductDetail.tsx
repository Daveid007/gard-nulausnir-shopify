import { useState } from "react";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Footer, Header } from "./_shared/Storefront";
import { CURTAIN_SWATCH_ASSETS } from "./_shared/curtains-assets";
import {
  curtainInquiryHref,
  getCurtainProductDefinition,
  GLUGGATJOLD_1000_ID,
  type CurtainProductId,
} from "./_shared/curtains";

export function CurtainsProductDetail({ productId = GLUGGATJOLD_1000_ID }: { productId?: CurtainProductId }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const product = getCurtainProductDefinition(productId);
  if (!product) return null;
  const swatches = CURTAIN_SWATCH_ASSETS[productId];
  const selectedSwatch = swatches[selectedIndex];

  return (
    <div className="solmyrkvun-grid min-h-screen bg-[#f7f9fa] text-[#24313b]">
      <Header categoryNav showCart={false} />
      <main>
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 pb-5 pt-7 md:px-10 md:pb-8 md:pt-10">
          <Link href="/collection#curtains" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[#667984]">
            <ArrowLeft size={14} /> Til baka í Gluggatjöld
          </Link>
        </div>

        <section
          id="vörulýsing"
          data-testid="curtain-product"
          data-product-id={product.id}
          className="mx-auto grid max-w-[1480px] gap-10 px-5 pb-16 md:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] md:gap-16 md:px-10 md:pb-28"
        >
          <div data-testid="curtain-gallery" className="min-w-0">
            <button
              type="button"
              data-testid="curtain-gallery-open"
              onClick={() => setZoomOpen(true)}
              className="group relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[#e8eef1] p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8] md:p-10"
              aria-label={`Stækka sýnishorn ${selectedSwatch.code}`}
            >
              <ResponsiveImage
                data-testid="curtain-selected-image"
                src={selectedSwatch.image}
                alt={`${product.title}, litakóði ${selectedSwatch.code}`}
                sizes="(min-width: 768px) 58vw, 100vw"
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-[#f7f9fa]/90 px-3 py-2 text-[9px] uppercase tracking-[.16em]">
                <Maximize2 size={13} /> Stækka sýnishorn
              </span>
            </button>
            <p className="mt-3 text-[10px] uppercase tracking-[.16em] text-[#667984]">
              Sýnishorn · litakóði {selectedSwatch.code}
            </p>
          </div>

          <div data-testid="curtain-config-card" className="pt-1">
            <p className="text-[10px] uppercase tracking-[.25em] text-[#6892b8]">Gluggatjöld</p>
            <h1 className="mt-4 max-w-xl font-serif text-[clamp(2.8rem,5vw,5.4rem)] leading-[.9] tracking-[-.06em]">
              {product.title}
            </h1>
            <div className="mt-7 border-b border-[#ccd9df] pb-6">
              <p className="max-w-lg text-sm leading-6 text-[#5a6b74]">
                Skoðaðu {swatches.length} litasýnishorn og veldu litakóðann sem þú vilt spyrjast fyrir um.
              </p>
              {product.lightControl && (
                <p data-testid="curtain-light-control" className="mt-4 text-sm font-medium text-[#24313b]">
                  {product.lightControl}
                </p>
              )}
              <p data-testid="curtain-price" className="mt-5 font-serif text-2xl tracking-tight">
                Verð eftir fyrirspurn
              </p>
            </div>

            <div className="border-b border-[#ccd9df] py-7">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-[10px] uppercase tracking-[.2em]">Veldu lit</h2>
                  <p className="mt-2 text-sm text-[#5a6b74]">
                    Valinn litakóði: <strong className="font-medium text-[#24313b]">{selectedSwatch.code}</strong>
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[.16em] text-[#667984]">{swatches.length} sýnishorn</span>
              </div>
              <div data-testid="curtain-swatch-grid" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {swatches.map((swatch, index) => {
                  const selected = selectedIndex === index;
                  return (
                    <button
                      key={swatch.code}
                      type="button"
                      data-testid={`curtain-swatch-${swatch.code}`}
                      aria-label={`Velja litakóða ${swatch.code}`}
                      aria-pressed={selected}
                      onClick={() => setSelectedIndex(index)}
                      className={`group flex items-center gap-2 border bg-[#f7f9fa] p-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8] ${selected ? "border-[#24313b]" : "border-[#ccd9df] hover:border-[#7e9bab]"}`}
                    >
                      <ResponsiveImage
                        src={swatch.image}
                        alt=""
                        aria-hidden="true"
                        sizes="48px"
                        className="h-12 w-12 shrink-0 object-cover"
                      />
                      <span className="text-[11px] tracking-[.03em]">{swatch.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-b border-[#ccd9df] py-7">
              <p className="max-w-lg text-sm leading-6 text-[#5a6b74]">
                Hafðu samband til að fá upplýsingar um þessa vöru og valinn lit. Tengillinn hér fyrir neðan opnar tölvupóst — hann sendir ekki inn pöntun.
              </p>
              <a
                data-testid="curtain-inquiry"
                href={curtainInquiryHref(product.id, selectedSwatch.code)}
                className="mt-6 inline-flex w-full items-center justify-center bg-[#a2c2e2] px-5 py-4 text-[10px] uppercase tracking-[.19em] transition-colors hover:bg-[#89b0d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8]"
              >
                Opna fyrirspurn í tölvupósti · {selectedSwatch.code}
              </a>
            </div>

            <p id="upplýsingar" className="pt-6 text-xs leading-5 text-[#667984]">
              Upplýsingar um mál og útfærslu eru staðfestar í samtali áður en ákvörðun er tekin.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl border-[#ccd9df] bg-[#f7f9fa] p-4 text-[#24313b] sm:p-7">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="font-serif text-2xl tracking-[-.03em]">{product.title}</DialogTitle>
            <DialogDescription className="text-sm text-[#667984]">
              Stækkað sýnishorn · litakóði {selectedSwatch.code}
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[68vh] items-center justify-center overflow-hidden bg-[#e8eef1] p-4 sm:p-8">
            <ResponsiveImage
              src={selectedSwatch.image}
              alt={`${product.title}, stækkað sýnishorn, litakóði ${selectedSwatch.code}`}
              sizes="90vw"
              className="max-h-[62vh] max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CurtainsProductDetail;
