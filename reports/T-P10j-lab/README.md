# T-P10j — laboratorijska provera i vizuelni dokazi

Datum: 27. oktobar 2026. Autor: Codex (GPT-6).
Baza: `de73a9d334f55ce71fa7030ad2df9d792a16ac2a`; kandidat identifikuju
SHA-256 izvora u `manifest.json` (izbegava se samoreferentni commit hash).

## Mobilno učitavanje

Tri naizmenična hladna base/candidate para, ista cloud Linux mašina,
Chromium 153.0.8010.0 / SwiftShader, Lighthouse 13.5.0. Lokalni Vite production
preview; default mobile 412×823/DPR1.75, simulirana slow-4G mreža i 4× CPU.
Tokom šest merenja nije bilo drugih browser testova. Sve sirove izveštaje
čuvaju `base-1..3.json.gz` i `candidate-1..3.json.gz`, a izdvojene metrike i
tačna podešavanja `summary.json`. Nema runtime grešaka ili run warnings.

| Medijana 3 probe | Baza | Kandidat |
| --- | ---: | ---: |
| Lighthouse performance | 44/100 | 45/100 |
| Lighthouse SEO | 100/100 | 100/100 |
| FCP | 1,973 s | 1,955 s |
| LCP | 10,447 s | 10,373 s |
| TBT | 2.698 ms | 2.658 ms |
| CLS | 0,02098 | 0,02098 |
| Speed Index | 2,108 s | 2,048 s |

**Zaključak:** ova dorada nema primetnu promenu u ovom malom laboratorijskom
uzorku; razlika jednog poena nije dokaz ubrzanja. Sporo učitavanje i blokiranje
glavne niti postoje na obe verzije. Lighthouse navodi JS execution/main-thread
work i neiskorišćeni deo JavaScript-a; to je smer za dalju dijagnostiku, ne
dozvola da se izbaci kod potreban pri kasnijim izborima/izvozu ili smanji kvalitet.

Ovo **nije** fizički telefon, field Core Web Vitals/INP, produkcioni CDN/network
test, potpuni frame-time benchmark, Safari potvrda ili §6/P-19 release PASS.
Softverski WebGL trošak i cloud CPU znatno ograničavaju prenos rezultata na
telefon. Početni korak za performanse je stvaran mobilni trace; u ovoj SEO
doradi nema neutemeljenog menjanja renderera, rezolucije ili performance gate-a.
SEO 100 nije potvrda ranga niti zatvara Bingov H1 nalaz; početni H1 proverava
zaseban guard bez JavaScripta, a Bing mora kasnije ponovo da preuzme stranicu.

### Reprodukcija

Napraviti čist baseline checkout na navedenom SHA i izgraditi oba checkout-a.
Zasebno obezbediti Lighthouse 13.5.0 i Chromium; nisu zavisnosti aplikacije.

```sh
CHROME_PATH=/path/to/chromium LIGHTHOUSE_CLI=/path/to/lighthouse/cli/index.js node reports/T-P10j-lab/collect.mjs ../plinth-seo-baseline
PLINTH_CHROMIUM_PATH=/path/to/chromium node reports/T-P10j-lab/visual-check.mjs
```

Collector sam otvara oba preview servera i zatvara ih. Prva odvojena CLI
preflight proba nije mogla da dohvati zasebni preview proces
(`ERR_CONNECTION_REFUSED`); nije dala validne metrike i ne ulazi u tabelu.
Pinned Playwright download je vraćao neispravan ZIP. Za lokalne provere korišćen
je izdvojeni npm paket `@sparticuz/chromium@153.0.0`; u projektu nema izmenjenog
browser pina ili paketa. Cloud CI/PG/PNG koriste postojeći instalacioni postupak.

## Funkcionalni i vizuelni dokazi

`visual-check.mjs` pravi izolovan production build, snima vodič/FAQ u light i
dark temi, desktop 1280×800 i mobilni viewport 390×844/DPR1. Zatim prihvata
stvarni 180×320 PNG, korisničkom kontrolom bira 1:1, izvozi/preuzima 1080×1080
PNG i aktivira poslednju Keyboard shortcuts komandu. `visual-check.json`
beleži rezultate; slike prikazuju pravi app render, nisu generisani mockup UI.

Prva pomoćna vizuelna proba pogrešno je pretpostavila da desktop podrazumeva
1:1; to nije ponašanje aplikacije (host bira početni aspekt). Sledeća proba
imala je pogrešan `#aspect` selektor. Probe su ispravljene da stvarno izaberu
1:1 kroz labelu Aspect ratio; nijedna od tih grešaka nije prikazana kao PASS
ili razlog za promenu aplikacije.

Fokusirani SEO guard: 6/6 prolaza. `PLINTH_SEO_SEED=heading` nad privremenim
build-om uklanja početni H1 i daje očekivani pad `expected 0 to be 1`. Seed
ne menja izvor. Konačni puni CI i cloud dokazi navedeni su u PR-u, za tačan head.

## Search podaci

Privatni Google Search Console performance baseline nije pročitan jer je
automatska provera tražila eksplicitno odobrenje. Nema pretpostavljenih klikova,
impresija, upita ili tvrdnje o rastu. Zakazan je samo korisnički podsetnik za
24. novembar 2026, bez automatskog ulaska u nalog. Bing sitemap je odložen.
