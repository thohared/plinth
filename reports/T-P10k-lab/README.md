# T-P10k: mobilno učitavanje

Baza: `017d206d30285edf877e0244d02e8e72380d10f2`, tree
`e35c44d93a073fcc0eaabeaaf85c9d69279d46e8`. Kandidat je normalni build ove
grane; `manifest.json` sadrži identitet svakog HTML/JS/CSS fajla i pune brojke.
Mereno 2026-10-27, Linux, Node 24.22.1, Lighthouse 13.5.0,
Chromium 153.0.8010.0, SwiftShader, 412×823/DPR 1.75, Lighthouse mobile
simulated Slow 4G/4× CPU. Isto okruženje i isti izvorni demo za oba build-a.
Redosled: base-1/candidate-1/base-2/candidate-2/base-3/candidate-3, novi browser
proces po run-u. Tokom finalne serije nisu paralelno pokretani browser/testovi.

## Rezultat

| Mera | Baza, medijana | Kandidat, medijana |
|---|---:|---:|
| Performance | 45 | 71 |
| FCP | 1.957 s | 0.907 s |
| LCP | 10.383 s | 2.402 s |
| TBT | 2689 ms | 1677 ms |
| CLS | 0.02098 | 0 |
| Speed Index | 2.006 s | 1.591 s |
| SEO | 100 | 100 |

Performance: baza 44/45/45, kandidat 71/75/70. Kandidat TBT ima raspon
1104.5–2008 ms i sample CoV 28.6%; FCP 906–1574 ms/CoV 34.1%. Obe mere
su promenljive: ne obećavamo tačan skor ili procenat za drugi računar.
LCP je stabilniji (CoV 3.5%); TBT medijana niža je oko 38%, LCP oko 77%.
TBT i dalje nije zelen i inicijalizacija 3D studija ostaje skupa. Raniji LCP
znači ranije prikazan stabilan interfejs, ne da se u tom trenutku već može
izvesti PNG. Komande ostaju disabled do završenog stvarnog warm-up-a.

Ovo **nije novi produkcioni PageSpeed rezultat**, CrUX/INP podatak, fizički
telefon/Safari dokaz ili §6/P-19 performance PASS. Vlasnikov javni izveštaj
ima 33/LCP 12.8 s/TBT 9410 ms na drugom hostu; ne mešati te brojke sa ovim
uporedivim lokalnim baznim 45. Posle merge/deploy-a može se meriti javni URL.

## Šta se promenilo

- Mali početni JS (~2.18 kB, ~1.09 kB gzip) postavlja isti editor/PG režim
  i odmah pokreće preuzimanje velikog 3D modula. Nema čekanja prvog klika.
- Mobilni brand/akcije su postojeći HTML čvorovi, kasnije samo povezani.
  Footer dobija isti prostor unapred; neiscrtani canvas nije vidljiv.
- Jedan PMREMGenerator deli privremene filter programe/target-e za sva četiri
  proceduralna okruženja. Izlazni target-i ostaju zasebni. Petlja je i dalje
  sinhrona: konačna verzija ne uvodi eksplicitni yield između PMREM poslova.
- Demo slike se učitavaju paralelno i obe ostaju pripremljene pre spremnosti.
  Nema novih slika, smanjenja rezolucije/DPR-a, promene AA/shader dijagnostike,
  materijala, PNG dimenzija ili naknadne pripreme na prvi izbor scene.

Prva proba samo sa deljenim PMREM-om i ranijim akcijama smanjila je TBT,
ali skor 45→44 i CLS .046–.076 pokazali su problem početnog rasporeda.
T-P10k research F7/F8 beleži zašto je zatim izdvojen početni modul i rezervisan
footer. Taj eksperiment nije konačni rezultat. Jedan kasniji pilot para dao
je 45→71; tabela iznad koristi zasebnu finalnu seriju od tri para.

## Dokazi i reprodukcija

Šest `*.json.gz` fajlova su potpuni Lighthouse JSON izveštaji, bez izbacivanja
sporih run-ova. `summary.json` zadržava konfiguraciju i environment svakog
run-a; `manifest.json` sadrži min/max/CoV i SHA-256 normalnih build-ova.

Pripremiti odvojene baseline i candidate checkout-e, `npm ci` i `npm run build`
u oba. Iz kandidata, uz postojeću zasebnu instalaciju Lighthouse-a:

```sh
CHROME_PATH=/path/to/chromium LIGHTHOUSE_CLI=/path/to/lighthouse/cli/index.js node reports/T-P10k-lab/collect.mjs /path/to/baseline
CHROME_PATH=/path/to/chromium node reports/T-P10k-lab/visual-check.mjs /path/to/baseline
```

Ne pokretati druge testove tokom poređenja. `collect.mjs` koristi Vite preview
na 4196/4197, visual check 4198/4199. Ne graditi u istom `dist` tokom merenja.
Lighthouse/Chromium su samo spoljašnji test alati, nisu dodate zavisnosti.
`visual-check.json` poredi sve RGBA kanale pet stvarnih 1280×800/DPR1 canvas
capture-a, sa sva četiri okruženja i laptopom; nema relaksiranog praga.
Slike `mobile-ready`, `mobile-settings` i `desktop-ready` su stvarni browser
snimci. Postojeći CI/PG/PNG su odvojeni acceptance dokazi na finalnom PR-u.

Automatska approval kontrola odbila je GitHub upload pojedinačnog
`phone-warm-sunset.png` snimka, pa taj PNG nije objavljen u PR-u. Njegovo
RGBA poređenje je već izvršeno (0 promenjenih kanala) i zapisano u
`visual-check.json`; prikaz su pregledali builder i nezavisan reviewer.
Skripta reprodukuje svih pet poređenja i lokalno ponovo pravi taj snimak.
Ovo izostavljanje artefakta ne menja kod, fixture-e, pragove ili rezultate.
