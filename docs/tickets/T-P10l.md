# T-P10l: kraći i prirodniji pomoćni tekst

Autor/izvođač: Codex (GPT-6), 2026-10-28.
Baza: `7e2c4fa09a046f2dc911394938746e1126767879`.
Vlasnik je odobrio tri konkretne jezičke izmene i skraćivanje ponavljanja.
Zajedničke smernice: `thohared/astra-runner` na
`c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`, provereno u prethodnom pregledu.

## Kratak pregled pre izmene

- F1: `index.html:#about-plinth` već opisuje postojeći proizvod iz §1,
  §4.1–4.2/§4.5–4.6 i P-19. Izraz "generic" u korisničkoj rečenici može se
  izostaviti bez promene generičkih uređaja ili pravila §2.1.
- F2: Isti element ponavlja besplatno korišćenje, lokalnu obradu slike i
  mogućnosti PNG izvoza u uvodu i FAQ-u. Sačuvati jasan odgovor za svaku
  mogućnost, uputstvo za manju podržanu veličinu i činjenicu da scene links
  ne sadrže sliku (§2.3/P-20, §4.6/§4.8).
- F3: `src/ui/panel.ts:createPanel` premešta isti HTML vodič u panel.
  `guards/seo.test.ts` proverava sadržaj bez skripte i u radu, FAQ, primere,
  mobilnu dostupnost, metadata i odsustvo overflow-a (§4.9/P-14).
- F4: Render, export, metadata, slike i DOM struktura ne zahtevaju promenu.
  Nema nove mogućnosti ili normativne praznine: `TODO(spec): none`.

## Isporuka i granice

U `index.html` promeniti "Choose a generic phone" u "Choose a phone",
pojednostaviti portfolio primer i zameniti "does not silently reduce" sa
"Your PNG keeps the size you selected." Skratiti ponavljanja između uvoda,
objašnjenja linkova i FAQ-a. Zadržati informacije o besplatnom korišćenju,
nalogu, lokalnoj obradi, deljenju podešavanja, providnosti i veličini PNG-a.

Write set: samo `index.html` i ovaj ticket. Bez em dash znakova u novom
tekstu. Bez izmena README-a, atribucije, koda, stilova, testova, specifikacije,
fixture-a, zavisnosti, workflow-a, Bing prijave ili društvenih mreža.

## Prihvatanje

Postojeći SEO guard i normalni build lokalno; ceo `npm run ci` i postojeći
PG workflow na konačnom PR head-u. Pregledati stvarni mobilni/desktop tekst.
Nema novog testa koji samo ponavlja sadržaj rečenice. PNG workflow po svojim
postojećim path filterima ne pokriva ovu HTML/prose izmenu; raniji PNG dokaz
iz PR-a #51 primenljiv je jer ceo render/export kod i asset-i ostaju isti.
Fresh-context review objaviti na PR-u po §2.6/§7; merge odobrava vlasnik.
