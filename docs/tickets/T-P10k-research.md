# T-P10k: brže početno učitavanje — istraživanje

Autor: Codex (GPT-6), 2026-10-27. Baza: `017d206d30285edf877e0244d02e8e72380d10f2`.
Zajedničko znanje: `thohared/astra-runner` @
`c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`; README/INDEX/SOURCE-POLICY,
Three.js vault Entry 1 C i Entry 12 C/D. Linux, postojeće zavisnosti i Chromium;
proba ne zahteva nove modele, teksture ili animacije, niti plaćene API-je.

## 1. Koje odredbe su obuhvaćene?

§2.1–2.4/P-20: postojeća lokalna obrada, generički uređaji, bez novih servisa;
§2.6–2.7/P-5/§7: zasebno istraživanje, jedan pisac, nezavisan review;
§4.1–4.4/§6: završena demo scena i priprema shadera pre spremnosti;
§4.5–4.6/P-6/P-7/P-13: isti AA, materijali, boja, alpha i PNG dimenzije;
§4.8–4.9/P-14: isti linkovi, interaktivnost i mobilni raspored;
§6/P-19: laboratorijski load test nije full-frame/physical-phone release PASS.

## 2. Koje površine postoje i šta pokazuju?

- F1 — Vlasnikov [PageSpeed izveštaj](https://pagespeed.web.dev/analysis/https-plinth-phi-vercel-app/ba3qts0ek0?form_factor=mobile),
  27. oktobar 20:04:15 GMT+1, Lighthouse 13.5.0, emulated Moto G Power,
  Slow 4G: performance 33, FCP 2.2 s, LCP 12.8 s, TBT 9,410 ms,
  CLS .046, Speed Index 12.7 s; ostale glavne kategorije 100. Nema CrUX podataka.
  Renderovani UI izveštaja: 21.3 s main thread, od toga Other 19,728 ms,
  Script Evaluation 1,452 ms. Najduži task 8,479 ms. LCP element je
  `#mobile-pick`, dodat tek posle inicijalizacije; raw element render delay
  18,900 ms nije ista mera kao simulirani LCP 12.8 s.
- F2 — `src/scene/studio.ts:93–110` generiše sva četiri PMREM-a u jednom
  sinhronom nizu, zatim čeka image decode i `compileAsync`. Svaki
  `src/scene/environment.ts:97` pravi i uništava novi PMREMGenerator.
  Pinovani `three@0.185.1`, `src/extras/PMREMGenerator.js:_allocateTargets`,
  čuva ping-pong target, LOD geometriju i filter materijale za ponovnu upotrebu;
  `dispose` ih oslobađa. Jedan generator za sva četiri istovetna formata može
  izbeći ponovnu pripremu bez promene izlaza. Potrebni su finally cleanup,
  odvojeno vlasništvo izlaznih target-a i test oporavka.
- F3 — `src/main.ts:132–243` čeka demo i sve shader varijante pre panela;
  `src/ui/panel.ts:110–119` tek tada kreira mobilni brand i akcije. Mogu se
  poslati isti HTML čvorovi ranije, pa povezati i uključiti nakon spremnosti.
  Ne prikazivati aktivnu nefunkcionalnu komandu ili lažni ready. Ne menjati
  završni prvi kadar, kvalitet, DPR, materijale ili PNG rezoluciju radi skora.
- F4 — `src/screen/demo.ts:11–18` preuzima/dekodira portrait pa landscape
  serijski. Oba su lokalna i potrebna; paralelno učitavanje uz all-settled
  cleanup uklanja zavisnost između zahteva bez smanjenja slike ili promene
  vlasništva. Dekodirana slika mora biti zatvorena ako druga ne uspe.
- F5 — Pasivna lokalna WebGL proba baznog normalnog build-a (412×823,
  DPR 1.75, Chromium 153.0.8010.0, SwiftShader, bez CPU/network throttle)
  zabeležila je ready 976.7 ms, 35 `getProgramInfoLog` poziva/428.5 ms,
  duge task-ove 110/417/256 ms. To locira sinhrona shader čekanja, ali nije
  poređenje sa udaljenim PageSpeed hardverom ili dokaz ubrzanja. Ne gasiti
  shader dijagnostiku radi skora. Uporediti finalni build sa istom bazom u
  naizmeničnim Lighthouse prolazima; sačuvati sirove izveštaje i metod.
- F6 — `guards/pg-mode.test.ts`, `guards/state-share.test.ts`,
  `guards/output-alpha.test.ts`, postojeći PG/PNG i `studio.test.ts`
  pokrivaju prvi demo, stanje, alpha i oporavak. Dodati fokusirane regresije
  za batch ownership, neuspeh demo učitavanja i početnu mobilnu strukturu.
  Novi guard mora pasti na zasejanoj povredi. Postojeći pragovi ostaju.

## 3. Praznine između ugovora i koda

`TODO(spec): none` za ponovnu upotrebu generatora, paralelne lokalne demo
zahteve, raniju istu mobilnu strukturu i raspodelu pripreme u zadatke pre
ready. §6 warm-up ostaje obavezan; nema odloženog rada na prvi korisnikov klik.
Kontrole se uključuju tek kada stvarna scena radi. Promena osvetljenja,
rezolucije, shader modela, novih asset-a ili release pragova nije u ovom tiketu.
Fizički telefon, Safari i §6/P-19 gate ostaju odvojeni i neprovereni ovim testom.

Primarni izvori: pinovani MIT Three.js iz `node_modules/three` (PMREMGenerator,
WebGLRenderer.compileAsync i WebGLProgram); [web.dev o dugim zadacima](https://web.dev/articles/optimize-long-tasks).
Savremeni Three.js docs indeks je otvoren, ali PMREM detalj vratio je 404;
konkretni API ugovor proveren je u isporučenom 0.185.1 izvoru.
