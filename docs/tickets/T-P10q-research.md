# T-P10q: sklapanje opisa i uputstva

Autor: Codex (GPT-6), 2026-10-30. Baza `12ff7b838c68b74652261045ab748c191b0e1a60`.
Vlasnik traži da opis sa prikazanog screenshota može da se skloni ako nije potreban.
Ovaj zahtev ima prednost nad nastavkom fizičkog performance snimanja.

## 1. Obuhvaćene odredbe

§2.2–2.3/P-20: isti lokalni proizvod, bez novih servisa ili čuvanja podataka;
§2.5–2.7/P-5/§7: istraživanje, jedan pisac, nezavisan review;
§4.9/P-14: pristupačan desktop/mobilni panel;
P-10(1)/P-19: korisno i istinito uputstvo, PNG tok ostaje dostupan.

## 2. Površine i nalazi

- F1 — `index.html:#about-plinth` sadrži sav tekst sa screenshots-a, tabelu,
  primere i FAQ. Nativni `details` sa `summary` može sklopiti ceo blok i bez
  JavaScript-a. Početno `open` zadržava postojeći vidljivi sadržaj; zatvaranje
  je korisnikov izbor. Ponovno otvaranje ostaje na istom mestu.
- F2 — `src/ui/panel.ts:createPanel` čuva server-delivered čvor, obnavlja panel
  i premešta ga u `#panel-utilities`. Mora sačuvati ceo details wrapper, uključujući
  izbor napravljen tokom učitavanja. Uklanjanje ili dupliranje sadržaja nije potrebno.
- F3 — `panel.css` već stilizuje nativni Advanced details i focus-visible.
  Uski stilovi za guide summary mogu obezbediti najmanje 44 px visine i jasne
  Show/Hide oznake u obe teme, bez izmene renderer-a ili dimenzija panela.
- F4 — Postojeći SEO/discovery/startup guardovi proveravaju statički sadržaj,
  njegov identitet u editoru, overflow, utility komande i pravi upload/PNG tok.
  Zadržati sve asercije i postojeći SEO negative-seed anchor. Ručno proveriti
  touch, Enter/Space, no-JS i stanje sklapanja pre/posle inicijalizacije.
- F5 — CI na `0175a6c` otkrio je zastarelu pretpostavku da panel ima samo
  jedan `summary`. Lokalna reprodukcija postojećeg invalid-edits testa pada
  na Playwright strict-mode proveri, pre asercija o unosu. Četiri klika u
  `panel.test.ts` (dva), `shortcuts.test.ts` i `png-access.test.ts` otvaraju
  Advanced settings pa pristupaju `#control-w`. Njihov tačan cilj je postojeći
  `summary[aria-controls="advanced-controls"]`. Precizirati samo te lokatore;
  svi slučajevi, korisnički koraci, asercije, pragovi i seed-ovi ostaju isti.
  Ovo ispravlja identitet kontrole, bez sužavanja pokrića guardova.
- F6 — CI na `e0de705` prolazi 133/134 guard provere, ali stari
  `review-polish.test.ts` light slučaj čita help bottom `608.359375` i feedback
  top `229` posle promene viewport-a sa 400×800 na 400×400. `resize` u
  `src/main.ts` asinhrono upisuje `body.style.height`; tri zasebna bounding-box
  poziva mogu obuhvatiti dve geometrije. Isti izvorni kod i test su na main-u.
  Bounded lokalna proba na main-u `12ff7b8`, posle pravog PNG preuzimanja,
  ponavlja pet 800→400 promena i iste scroll/bounds pozive: dva puta reprodukuje
  baš `608.359375 > 229`. Posle čekanja na `body.style.height === '400px'`
  svih pet daje `208.359375 <= 229`. Kandidat prolazi svih pet neposrednih i
  pet stabilizovanih merenja. Linux, Node 24, Chromium 153, SwiftShader;
  nema mock-a, sleep-a, promene callback-a ili tvrdnje o fizičkom uređaju.
  Sačuvati sve asercije i čekati taj postojeći signal završene promene visine
  pre scroll/bounds provere. `panel.test.ts` već koristi isti signal pri resize-u.

## 3. Granice

`TODO(spec): none`. Nema uklanjanja teksta, SEO metapodataka, schema/llms izmena,
storage-a, novog runtime JS događaja, promene izgleda uređaja ili PNG rezolucije.
Nisu potrebni novi modeli, animacije, biblioteke ili plaćeni API. Po reload-u
vodič ponovo kreće otvoren; zahtev ne uvodi trajno pamćenje izbora.
