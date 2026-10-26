# T-P10h: SEO osnova, istraživanje

Autor: Codex (GPT-6). Datum: 2026-10-26.
Zahtev vlasnika: poboljšati SEO nakon prvih poseta sa Bing-a.
Pregledana baza: `02d05c3b8ed10da457a82475c64236cd4781c6e9`.
Zajedničko znanje: `thohared/astra-runner` na
`c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`, handoff README/INDEX i SOURCE-POLICY.
PR #45 za naziv vlasnika je zaseban otvoren rad; ne preuzimati ga ovde.

## 1. Koje odredbe zahtev dodiruje

- §1 i P-10(1)/P-19: opisati postojeći besplatan screenshot-to-PNG proizvod.
- §2.1–2.4: generički uređaji, lokalna obrada slike, bez novih servisa i zavisnosti.
- §2.6–2.7/P-5 i §7: istraživanje, jedan pisac, nezavisan review i postojeći gate-ovi.
- §4.1, §4.2, §4.4–4.6: činjenično uputstvo za ulaz, pet uređaja, scene i PNG.
- §4.8–4.9/P-14: hash linkovi i raspored desktop/mobile editora ostaju funkcionalni.
- §8 T-P10 i P-2: javna prezentacija/metapodaci, kanonski produkcioni URL.
- P-20: uska postojeća Analytics iznimka; ne dodavati događaje, servise ili praćenje.

## 2. Današnje površine

| Nalaz | Površina i stanje |
| --- | --- |
| F1 | `index.html:8–25`: title/description, OG i Twitter kartica postoje. Naslov `Plinth: Screenshot studio` ne navodi konkretno generisanje mockup-a; nema `rel=canonical`. |
| F2 | `public/`: nema robots.txt ni sitemap.xml. Oba produkciona URL-a vraćaju HTTP 404, provereno GET zahtevima 2026-10-26. Početna strana vraća 200 i odgovara pročitanom izvornom HTML-u. |
| F3 | `index.html:30–31`: canvas i prazan panel; početni odgovor nema objašnjenje proizvoda. `src/ui/panel.ts:createPanel` naknadno gradi kontrole i briše početni sadržaj `root.innerHTML` dodelom. Kratak statički opis treba sačuvati i posle inicijalizacije, dostupan ljudima na istom mestu u panelu. |
| F4 | `src/ui/panel.css:1–7,138–139`: editor ima fiksan viewport i skrolujući panel. Novi informativni odeljak na kraju utilities ne sme da pomeri inicijalne kontrole ili fiksni izvoz. Bez JS-a omogućiti čitanje/scroll opisa. |
| F5 | `index.html`: nema strukturiranog opisa WebApplication. Činjenice za JSON-LD već postoje u §1/P-19 i UI-ju: besplatno, bez naloga, generički uređaji, PNG; nisu opravdani izmišljeni rating/review, video export ili obećanje podrške za svaku veličinu na svakom uređaju. |
| F6 | `src/state/share.ts`, `src/state/navigation.ts`, `src/analytics.ts`: hash scene i privacy gating nisu SEO površine za menjanje. Canonical i sitemap mogu referisati isključivo javni root bez hash/query podataka, bez prepisivanja korisničkog URL-a. |
| F7 | `.github/workflows/ci.yml`, `pg-capture.yml`, `png-capture.yml`: postojeće provere se čuvaju i koriste. Ne dodavati duple dispatch-e ili plaćeni SEO servis. Bing Webmaster Tools/Search Console verifikacija nije potvrđena u ovoj sesiji. Posete nisu dokaz impresija, pozicije ili tačnih upita. |

## 3. Praznine i granice

F1–F5 su nedostajuća prezentacija postojećeg proizvoda, pokrivena §8 T-P10 i
aktuelnim zahtevom vlasnika. Nema promene normativnog ponašanja scene, upload-a,
izvoza, mreže, analitike ili layout ugovora; `TODO(spec): none` za ovaj obuhvat.
Ne menjati PLINTH_SPEC, fixtures, postojeće assertions/pragove, zavisnosti ili
workflow-e. Poseban landing-page tok, novi uređaji, branded ključne reči i nove
marketinške stranice nisu deo ovog zadatka.

## Primarni izvori, provereni 2026-10-26

- [Google Search Essentials](https://developers.google.com/search/docs/essentials):
  koristan sadržaj i opisni izrazi u naslovima; indeksiranje i rezultat nisu garantovani.
- [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics):
  opisni metapodaci, canonical u početnom HTML-u i ograničenja renderovanja.
- [Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap):
  navesti kanonske URL-ove; sitemap je signal za otkrivanje, ne obećanje indeksiranja.
- [WebApplication](https://schema.org/WebApplication): tip i svojstva aplikacije.
- [Bing pomoć](https://www.bing.com/webmasters/help): verifikacija sajta i sitemap
  kroz nalog vlasnika. Stranica Webmaster Guidelines daje samo JS shell ovom
  čitaču; ne tvrdimo da je njen puni sadržaj pregledan.

Ne postoje podaci o obimu konkretnih ključnih reči. `free 3D mockup generator`
je opis stvarne funkcije, bez tvrdnje o broju pretraga ili lakoći rangiranja.
