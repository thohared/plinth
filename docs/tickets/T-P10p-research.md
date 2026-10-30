# T-P10p: priprema završnih shadera pre prvog kadra

Autor: Codex (GPT-6), 2026-10-30. Baza: `12ff7b838c68b74652261045ab748c191b0e1a60`.
Zajedničko znanje: `thohared/astra-runner` @ `c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`,
README/INDEX/SOURCE-POLICY. Linux; postojeći generički uređaji i demo slike.
Nisu potrebni novi modeli, animacije, plaćeni API ili produkcione zavisnosti.

## 1. Obuhvaćene odredbe

§2.1–2.4/P-20: lokalni proizvod i isti mrežni obuhvat; §2.5–2.7/P-5/§7:
istraživanje pre implementacije, očuvani baseline-i, nezavisan review;
§4.1/§4.4/§6: priprema shadera pre spremnosti, isti prvi demo kadar;
§4.5–4.6/P-6/P-7/P-13: isti materijali, SMAA, boja, alpha i PNG dimenzije;
§4.8–4.9/P-14/P-19: deljenje, mobilni tok i odvojena fizička performance provera.

## 2. Površine i nalazi

- F1 — Vlasnikov [PageSpeed izveštaj](https://pagespeed.web.dev/analysis/https-plinth-phi-vercel-app/6cyzqqeu4z?form_factor=mobile),
  30. oktobar 18:29:33 GMT+1: Lighthouse 13.6.0, emulated Moto G Power,
  Slow 4G, Chromium 153.0.8010.36. Performance 63, FCP/LCP 0.8 s, TBT
  8040 ms, CLS 0, Speed Index 7.7 s. Accessibility/Best Practices/SEO 100.
  Nema CrUX podataka. Interaktivne dijagnostike: main thread 16.3 s, Other
  14984 ms, Script Evaluation 1217 ms; najveći task 7458 ms počinje na 2778 ms.
  JS URL `main-BCX73iHA.js` odgovara normalnom buildu ove baze. Skor nije
  dokaz identične brzine na fizičkom telefonu.
- F2 — `src/scene/studio.ts:initialize` priprema scene kroz `compileAsync`,
  ali `src/scene/pipeline.ts:createPipeline` čeka samo dekodiranje SMAA lookup
  slika. Tri završna SMAA programa prvi put se pripremaju u sinhronom renderu.
  To nije obuhvaćeno `compileAsync(stage.scene, stage.camera)`.
- F3 — Pinovani MIT Three.js 0.185.1 `WebGLRenderer.compileAsync` prvo
  sinhrono inicira programe, pa proverava `KHR_parallel_shader_compile`
  pomoću odvojenih zadataka. `WebGLProgram.onFirstUse` proverava log/link status;
  prvi render nepripremljenog programa zato može blokirati. Dijagnostiku ne gasiti.
  Program zavisi od trenutnog render target-a, tone mapping-a i color space-a:
  pripremiti stvarne pass materijale u odgovarajućem target kontekstu i odmah
  vratiti renderer pre čekanja. Ne držati zajednički target promenjen preko await-a.
- F4 — Pasivna proba normalnog build-a, Linux Chromium 153.0.8010.0,
  SwiftShader, 412×823/DPR1.75, CDP CPU4×: ready opažen na 2248.5 ms,
  dugi zadaci 57/627/393/508 ms. WebGL pozivi i stack pokazuju sinhronu
  pripremu PMREM-a, kontaktne senke i završnih pass-ova. Instrumentovana proba
  locira rad; nije uporediva sa udaljenim PageSpeed rezultatom niti finalni benchmark.
- F5 — `pipeline.test.ts` proverava vlasništvo, decode neuspehe i vraćanje
  renderer stanja; `studio.test.ts` pokriva warm-up failure/recovery. Proširiti
  provere pripreme, odlaganja ready i cleanup-a. `guards/startup.test.ts`
  već proverava disabled shell, upload i stvarni PNG download. Dodati samo
  specifičnu proveru nove pripreme ako se eksperiment pokaže korisnim.

## 3. Praznine i granice

`TODO(spec): none` za raniju pripremu istih shadera, pre postojećeg ready-a.
Ne menjati rezoluciju, DPR, kvalitet, izgled, izvorne slike, granice guarda ili
dependency pinove. Ne prebacivati trošak na prvi korisnikov klik. Efekat mora
pokazati naizmenično baseline/candidate merenje, uz iste ulaze i sirove rezultate.
Ako nema pouzdanog poboljšanja, eksperimentalni kod ne objavljivati kao optimizaciju.
Fizički telefon/Safari i §6/P-19 gate ostaju odvojeni.

Primarni tehnički izvor je isporučeni `node_modules/three` (WebGLRenderer,
WebGLProgram, SMAAPass, ShaderPass, Pass i WebGLPrograms). Web pretraga nije
vratila sadržaj; konkretan PageSpeed izveštaj i proširene dijagnostike pročitani
su iz njegovog UI-a, a API ponašanje iz tačne pinovane implementacije.
