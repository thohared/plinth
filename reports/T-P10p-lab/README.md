# T-P10p: zaključak probe učitavanja

Autor: Codex (GPT-6), 2026-10-30. **Ne usvajati ovaj kandidat.**
Nema izmene produkcionog koda, deploy-a, PR-a ili novog performance PASS-a.

## Novi javni izveštaj

[Vlasnikov PageSpeed izveštaj](https://pagespeed.web.dev/analysis/https-plinth-phi-vercel-app/6cyzqqeu4z?form_factor=mobile)
pokazuje 63/100, FCP/LCP 0.8 s, CLS 0, TBT 8040 ms i Speed Index 7.7 s.
Accessibility, Best Practices i SEO imaju 100. Nema CrUX podataka.
Najduži zadatak traje 7458 ms. U expanded main-thread dijagnostici Other je
14984 ms naspram Script Evaluation 1217 ms. Samo smanjivanje 66 KiB neiskorišćenog
JavaScript-a nije potvrđeno rešenje ovog dominantnog troška.

Raniji korisnikov izveštaj u T-P10k imao je 33/100, LCP 12.8 s i CLS .046.
Ovo je bolji javni snimak, ali su datumi/verzije Lighthouse-a različiti, pa to
nije kontrolisano A/B poređenje niti dokaz tačnog doprinosa pojedinačnog PR-a.

## Šta je provereno

Pinovani Three.js kod i pasivni WebGL stack-ovi potvrđuju pripremu dela
postprocess programa pri prvom renderu. Kandidat unapred pokreće compileAsync
nad istim SMAA/copy materijalima, u njihovom stvarnom target kontekstu, uz
vraćanje renderer stanja pre čekanja. Kvalitet/DPR/slike/dimenzije nisu menjani.

Jedan preliminarni Lighthouse par sa serijskom varijantom dao je skor 73→76
i TBT 1781→1190 ms. To nije finalni rezultat, nije dovoljno ponovljeno i
ta varijanta nije dokaz za završni patch. Naknadna proba paralelne pripreme
proverila je stvarni ready marker, da bolji TBT ne prikrije duže čekanje.

## Završna izolovana proba stvarne spremnosti

Baza `12ff7b838c68b74652261045ab748c191b0e1a60`; kandidat je ta baza plus
`rejected-candidate.patch`. Normalni Vite build, Linux/Node 24.22.1,
Chromium 153.0.8010.0, SwiftShader, 412×823/DPR1.75, CDP CPU4×,
bez mrežnog usporavanja. Novi browser proces po run-u, redosled
base-1/candidate-1/base-2/candidate-2/base-3/candidate-3. Tokom ove serije
nije bilo drugih lokalnih testova ili promena build-a. Ranija razvojna serija
koja se preklopila sa dodatnom probom/build-om isključena je iz ovog dokaza.

| Vreme do stvarnog ready-a | Baza | Kandidat |
|---|---:|---:|
| Run 1 | 1293 ms | 8607 ms |
| Run 2 | 7468 ms | 1358 ms |
| Run 3 | 1285 ms | 7423 ms |
| Medijana | 1293 ms | 7423 ms |

Obe verzije imaju veliku varijabilnost. Tri prolaza ne potvrđuju stabilan
procenat regresije niti ponašanje fizičkog telefona. Dovoljna su da se odbaci
tvrdnja da je ovaj kandidat pouzdano brži: niži TBT sam ne zatvara kriterijum.
Sačuvani `readiness.json` sadrži sve prolaze i long-task zapise, a manifest
identitet HTML/JS/CSS build-ova. Nema izbačenih sporih prolaza u finalnoj seriji.

## Odluka i nastavak

Kandidat je odbačen i aplikacioni fajlovi vraćeni. Nema razloga da se za njega
troše puni CI/PG/PNG run-ovi ili traži merge. Pokušaj samo sa dodatnim GL flush-om
takođe nije usvojen; nije deo finalnog patch-a ili tabele.

Pre dalje promene renderer-a treba uhvatiti cold-start trace na fizičkom
Android uređaju i razdvojiti PMREM, shader compilation i prvi draw. Veća promena
kao renderovanje u worker-u zahteva zasebno istraživanje i proveru input/export/
recovery toka; ovaj nalaz je ne odobrava. Ne smanjivati DPR, AA ili PNG kvalitet
i ne odlagati 3D do prvog klika samo radi skora.

Reprodukcija: odvojeni checkout-i baze, patch samo u kandidatu, `npm ci` i
`npm run build` u oba. Iz kandidata pokrenuti
`CHROME_PATH=/path/to/chromium node reports/T-P10p-lab/readiness.mjs /path/to/base`.
Patch je arhiva odbačenog eksperimenta, ne preporučena izmena aplikacije.
