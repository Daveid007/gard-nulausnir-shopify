import { HONEYCOMB_45_LIMITS, type MountPosition } from "@/lib/pricing";

const helpClass = "mt-2 space-y-2 text-xs leading-relaxed text-[#52636f] normal-case tracking-normal";

export function HoneycombControlHelp({ heightMm }: { heightMm: number }) {
  const maxCordlessHeightCm = HONEYCOMB_45_LIMITS.cordless.maxHeightMm / 10;
  return (
    <div className={helpClass} data-testid="hc-control-help">
      <p><strong>Handvirk með snæri:</strong> Þú togar í snæri til að hækka eða lækka gardínuna.</p>
      <p><strong>Snærislaus:</strong> Þú lyftir eða lækkar botnlistann með hendinni. Enginn mótor og engin fjarstýring — þetta er líka handvirk stýring.</p>
      <p><strong>Mótor:</strong> Gardínan er hækkuð og lækkuð með mótor og fjarstýringu, án þess að þú þurfir að toga í snæri eða færa botnlistann.</p>
      {heightMm > HONEYCOMB_45_LIMITS.cordless.maxHeightMm && (
        <p className="border-l-2 border-[#6892b8] pl-2" role="status">
          Snærislaus stýring er aðeins í boði upp að {maxCordlessHeightCm} cm hæð. Fyrir {heightMm / 10} cm hæð þarf að skoða handvirka stýringu með snæri eða mótor; breidd og flatarmál þurfa einnig að vera innan stærðarmarka.
        </p>
      )}
    </div>
  );
}

export function HoneycombMountHelp({ mountPosition }: { mountPosition: MountPosition }) {
  return (
    <div className={helpClass} data-testid="hc-mount-help">
      <p><strong>Innfelld:</strong> Gardínan situr inni í gluggaopinu. <strong>Utanáliggjandi:</strong> Gardínan er fest utan við opið.</p>
      {mountPosition === "inside" && (
        <p>Sláðu inn breidd gluggaopsins án frádráttar. Reiknivélin dregur sjálfkrafa 5 mm frá breiddinni.</p>
      )}
      <p><strong>Án borunar:</strong> Gardínan er fest með innbyggðri þrýstistöng inni í gluggaopinu, eins og sturtustöng eða klemmuhlið. Hún virkar þannig að hún er spennt út á milli hliðarkarmanna. Á endunum eru stamir gúmmípúðar sem grípa þétt í karminn og halda henni alveg fastri — engin verkfæri, engar skrúfur og engin göt í veggjum eða gluggaprófílum.</p>
      <p><a href="mailto:sala@gardinulausnir.is?subject=Ráðgjöf%20um%20Honeycomb" className="underline underline-offset-4">Fá aðstoð við val og mælingar</a></p>
    </div>
  );
}
