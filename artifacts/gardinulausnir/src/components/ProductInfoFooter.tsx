import { Link } from "wouter";

export function ProductInfoFooter() {
  return (
    <footer data-testid="footer" className="border-t border-[#d8e1e5] bg-[#eaf1f5] px-5 py-12 md:px-10">
      <div className="mx-auto grid max-w-[1510px] gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <section>
          <h2 className="mb-4 text-sm font-semibold">Hafa samband</h2>
          <p className="text-sm leading-6 text-[#5a6b74]">Spurningar um mælingar, efni eða val á gardínum?</p>
          <a className="mt-3 inline-block text-sm underline underline-offset-4" href="mailto:hallo@gardinulausnir.is">hallo@gardinulausnir.is</a>
        </section>
        <section>
          <h2 className="mb-4 text-sm font-semibold">Afhending &amp; Skilmálar</h2>
          <p className="text-sm leading-6 text-[#5a6b74]">Fáðu staðfestingu á afhendingartíma og skilmálum fyrir þína sérpöntun áður en hún er samþykkt.</p>
          <a className="mt-3 inline-block text-sm underline underline-offset-4" href="mailto:hallo@gardinulausnir.is?subject=Afhending%20og%20skilm%C3%A1lar">Spyrja um pöntun</a>
        </section>
        <section>
          <h2 className="mb-4 text-sm font-semibold">Um okkur</h2>
          <p className="text-sm leading-6 text-[#5a6b74]">Gardínulausnir hjálpar þér að velja gardínur eftir málum, birtu og þörfum rýmisins.</p>
          <Link className="mt-3 inline-block text-sm underline underline-offset-4" href="/um-okkur">Lestu söguna okkar</Link>
        </section>
        <section>
          <h2 className="mb-4 text-sm font-semibold">Algengar spurningar</h2>
          <details className="border-b border-[#ccd9df] py-2 text-sm">
            <summary className="cursor-pointer">Í hvaða einingu mæli ég?</summary>
            <p className="pt-2 leading-6 text-[#5a6b74]">Sláðu breidd og hæð inn í sentímetrum. Leyfileg stærð fer eftir gardínugerð.</p>
          </details>
          <details className="border-b border-[#ccd9df] py-2 text-sm">
            <summary className="cursor-pointer">Hvernig breytist verðið?</summary>
            <p className="pt-2 leading-6 text-[#5a6b74]">Reiknivélin uppfærir verðið þegar þú breytir málum, efni, fjölda eða verðlögðum aukahlutum.</p>
          </details>
        </section>
      </div>
    </footer>
  );
}