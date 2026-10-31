# T-P10r: pristupačan oporavak pri pokretanju

Codex (GPT-6), 2026-10-30. Research: T-P10r-research.md F1–F5.
Odredbe: §2.2–2.7, §4.1/4.9, §7, P-10(1), P-13(2), P-14(5), P-19.

Prikazati jasan engleski naslov/poruku kada import ili boot ne uspe.
Greška pri kreiranju WebGL konteksta navodi grafičku podršku bez nagađanja
uzroka. Ponuditi ručni Reload page koji čuva adresu i skrolabilan postojeći
About Plinth vodič na desktopu i telefonu. Fokusirati naslov; reload i
native disclosure dostupni tastaturi, najmanje 44 px. Ne ostaviti lažni
ready signal ili nedovršene kontrole dostupne. Bez automatskih retry-a.
Uspešan startup i kasniji context-loss/export recovery ostaju isti.

Write set: ovaj ticket/research, src/startup.ts, src/main.ts, novi
src/ui/startupFailure.ts, uski src/ui/panel.css i novi
 guards/startup-failure.test.ts. Nema spec/fixtures/dependencies/workflow izmena.

Acceptance: oba uzroka × mobile/desktop, dostupnost vodiča/reload-a,
focus/overflow/touch target, blokiran WebGL bez raw tehničke poruke,
stvarni ručni reload posle uklanjanja bloka sa istim URL-om, uspešan
upload i PNG posle oporavka. Negativni seed onemogućenog reload-a mora
pasti. Postojeći startup guard ostaje neizmenjen. Build, Linux npm run ci,
automatski PG/PNG, slike i nezavisan fresh-context a–d review.
TODO(spec): none. Merge odobrava vlasnik zasebno.
