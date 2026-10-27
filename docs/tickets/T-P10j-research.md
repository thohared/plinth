# T-P10j: dostupni naslov i praktični vodič — istraživanje

Autor: Codex (GPT-6), 2026-10-27. Baza: `de73a9d334f55ce71fa7030ad2df9d792a16ac2a`.
Zajednička baza: `thohared/astra-runner` @ `c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`;
README/INDEX/SOURCE-POLICY pročitani. Vlasnik je odobrio H1, primere za portfolio
i prezentaciju aplikacije, FAQ i mobilnu proveru. Izričito isključuje društvene
mreže iz ovog sadržaja i odlaže Bing sitemap.

## 1. Odredbe

§1/P-10(1)/P-19: istinit opis postojećeg screenshot-to-PNG proizvoda;
§2.1–2.4/P-20: generički uređaji, lokalne slike, bez novih servisa/paketa/telemetrije;
§2.6–2.7/P-5/§7: istraživanje, jedan pisac, postojeće provere i nezavisan review;
§4.1–4.2/§4.5–4.6: ulaz, uređaji, providnost i stvarna ograničenja PNG-a;
§4.8–4.9/P-14: scene links i dostupne desktop/mobile kontrole;
§6/P-19: simulacija učitavanja nije fizički phone ili full-frame release PASS;
§8 T-P10/P-2: javni HTML i odvojeno merenje rezultata pretrage.

## 2. Površine i nalazi

- F1 — `index.html` nema H1; `src/ui/panel.ts:createPanel` ga kreira kroz
  `root.innerHTML`. Bing URL Inspection je 27. oktobra pokazao “Indexed
  successfully” i zasebno “H1 tag missing”. To sugeriše razliku između početnog
  i renderovanog HTML-a; uzrok Bing nalaza nije definitivno dokazan. Preneti
  postojeći brand blok u početni HTML i sačuvati isti DOM pri inicijalizaciji,
  bez duplog H1 i bez promene prihvaćenog izgleda.
- F2 — `index.html:#about-plinth` već sadrži opis i tri koraka. Dopuniti ga
  dvama konkretnim primerima i FAQ, sačuvati naslov/korake/objašnjenje linkova.
  Ukloniti postojeću frazu “social posts” iz tog opisa. Koristiti već isporučene
  originalne `public/compositions/studio-phone.png` i `clean-tablet.png`, obe
  480×300, sa opisnim alt-om, dimenzijama i lazy loading-om. Nisu novi rezultati
  izvoza niti nove scene. Ne dodavati marketing za društvene mreže.
- F3 — `src/ui/panel.ts` već premešta isti guide čvor ispred završnih utility
  komandi. `panel.css` drži izvoz odvojen od skrolujućeg panela. Duži tekst i
  FAQ moraju ostati čitljivi, sa dostupnim poslednjim komandama i bez uticaja
  na inicijalni editor/izvoz. Prikaz isti za posetioce i botove.
- F4 — `guards/seo.test.ts` već proverava HTML bez JS-a, očuvanje vodiča,
  canonical/robots/XML/schema i desktop/mobile. Dodati proveru jednog H1 pre
  i posle JS-a, očuvanja FAQ/primera i poslednjeg odgovora na malom ekranu.
  Negativni seed uklanja početni H1; postojeće assertions ne menjati/slabiti.
- F5 — `docs/PERFORMANCE-TESTING.md` i `scripts/performance.mjs` jasno odvajaju
  softverski GPU od fizičkog uređaja. SEO provera učitavanja u mobilnoj
  simulaciji treba da sačuva metod, sirove rezultate i ograničenja; ne menjati
  render rezoluciju, kvalitet ili pragove radi boljeg skora. Nema pristupa
  fizičkom telefonu u ovom cloud hostu. Ne predstavljati laboratorijski test
  kao Core Web Vitals stvarnih korisnika ili §6/P-19 release PASS.
- F6 — `docs/SEO.md` već opisuje praćenje impresija/klikova/CTR/upita. Stanje
  indeksa i promena koda nisu dokaz rasta. Sačuvati post-deploy datum i meriti
  uporedive periode; ne dodavati Analytics događaje ili plaćeni API.

## 3. Praznine i granice

Ovo dopunjuje prezentaciju postojećeg proizvoda iz T-P10h, bez novog product
ponašanja ili normativne promene. `TODO(spec): none` u ovom obuhvatu.
Specifikacija, fixture-i, pragovi, workflow-i i zavisnosti ostaju netaknuti.
Bing sitemap je odložen po vlasniku. Prava mobilna brzina/Safari ostaju
neprovereni dok se ne pribavi dokaz sa odgovarajućeg uređaja.

## Primarni izvori provereni 27. oktobra 2026.

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): početni i renderovani HTML, opisni naslovi, prerendering.
- [Google developer SEO](https://developers.google.com/search/docs/fundamentals/get-started-developers): semantički HTML i tekstualno dostupan sadržaj.
- [Google page experience](https://developers.google.com/search/docs/appearance/page-experience): Core Web Vitals nisu garancija ranga.

Pregled repozitorijuma i produkcionog HTTP HTML-a potvrđuju F1/F2. To nije
ponovno merenje svih mogućnosti aplikacije ili dokaz organskog rasta.
