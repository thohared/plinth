# T-P10p: kraće blokiranje pri pripremi prikaza

Autor/izvođač: Codex (GPT-6), 2026-10-30. Research: [T-P10p-research.md](T-P10p-research.md), F1–F5.
Odredbe: §2/§4.1/§4.4–4.6/§4.8–4.9/§6–§7, P-5/P-6/P-7/P-13/P-14/P-19/P-20.

**Status: eksperiment odbačen, nema implementacionog PR-a ili promene produkcije.**
Kriterijum merljive koristi nije ispunjen. Sačuvani su patch i uporediva
merenja u [izveštaju](../../reports/T-P10p-lab/README.md); ostatak ovog ticketa
je plan probe, ne potvrda prihvatanja. Puni CI/PG/PNG i nezavisan merge review
nisu pokrenuti za odbačeni kandidat. Aplikacioni fajlovi vraćeni su na bazu.

## Isporuka

Pripremiti iste završne SMAA/copy shadere asinhrono pre prvog kadra (F2/F3).
Koristiti odgovarajući target svakog pass-a, vratiti zajednički renderer pre
čekanja i osloboditi privremenu geometriju i pri neuspehu. Zadržati lookup decode,
stvarni ready, shader dijagnostiku, postojeći kvalitet i oporavak konteksta.
Eksperiment zadržati samo ako uporediva merenja pokažu korist (F1/F4).

Write set: `src/scene/pipeline.ts`, `src/scene/studio.ts`, novi pomoćni warm-up
modul i njegovi testovi; samo dopuna mock-a u `studio.test.ts` bez promene
asercija; novi dodatni browser guard ako je potreban; ovaj ticket/research,
`reports/T-P10p-lab/**`, sažetak u `docs/PERFORMANCE-TESTING.md`.
Spec, postojeći guardovi, baseline-i, workflow-i i dependencies ostaju neizmenjeni.

## Prihvatanje

- Testovi čekaju stvarne compile promise-e, proveravaju restore target/viewport/
  scissor pre await-a, failure cleanup i disposal; negativna proba otkriva
  izostavljenu pripremu. Postojeće asercije ostaju netaknute.
- Normalni Linux build, typecheck/unit i puni postojeći CI/PG/PNG na konačnom
  head-u; bez ponovljenih ručnih dispatch-a. Pregled slika i stvarni mobile
  upload → PNG tok. Nijedan baseline se ne menja.
- Tri naizmenična Lighthouse para u istom okruženju, sirovi izveštaji,
  source/build identitet i rasponi. Odvojiti load metrike od fizičkog gate-a.
- Fresh-context nezavisan review sa a–d izveštajem na PR-u. Merge je zasebna
  odluka vlasnika. `TODO(spec): none` za ovaj obuhvat.
