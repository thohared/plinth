# Plinth: SEO i praćenje rezultata

T-P10h, 2026-10-26. Autor: Codex (GPT-6).
Kanonski sajt: https://plinth-phi.vercel.app/

## T-P10o: GEO / LLMO / AEO, 30. oktobar 2026.

Vodič dobija pregled mogućnosti, odgovore o izboru modela, crop/fit ponašanju,
deljenju bez slike i browser zahtevima, uz tačnu tabelu svih pet PNG dimenzija.
Tekst postoji u početnom HTML-u i ostaje u editoru. Postojeći WebApplication
dobija stabilan `@id`, jezik, primer slike i featureList jednak vidljivim
činjenicama. Nema novih stranica, skripti, bot-only sadržaja ili trackera.

`/llms.txt` je opcioni činjenični pregled sa javnim linkovima. Format je predlog,
ne standard koji svi servisi koriste. Google izričito navodi da ovaj fajl ne
koristi za AI vidljivost/rang. Koristan HTML i tačne informacije su glavna
isporuka; nema obećanja citata, rangiranja ili novih poseta. Postojeći robots
već dopušta search crawlere; pravila za trening botove nisu menjana.

Ovo je status implementacije, ne potvrda produkcione objave. Posle odobrenog
merge-a proveriti HTTP 200 i text/plain za llms.txt, početni HTML i JSON-LD,
pa zabeležiti datum. Porediti stvarne search rezultate i, gde su dostupni,
AI citation izveštaje kroz iste periode. Citati nisu isto što i klikovi.
Ovaj ticket ne čita privatne izveštaje i ne dodaje Analytics događaje.
Bing sitemap ostaje odložen; društvene mreže ostaju van vodiča.

Primarni izvori, obuhvat i provere: [research](tickets/T-P10o-research.md),
[ticket](tickets/T-P10o.md). Stariji datirani statusi ispod ostaju istorija.

## Aktuelno stanje — 27. oktobar 2026.

- PR #49 je spojen kao `de73a9d334f55ce71fa7030ad2df9d792a16ac2a` i objavljen.
  Oba servisa potvrđuju vlasništvo; Google sitemap je obrađen sa statusom
  Success i jednom otkrivenom stranicom.
- Bing URL Submission je prihvatio javni root. Naknadni URL Inspection
  pokazuje **Indexed successfully / URL can appear on Bing**. To ne dokazuje
  konkretan rang, klikove ili povećanje saobraćaja.
- Bing sitemap formular vraća serversku grešku i u agentovom i u vlasnikovom
  pregledaču. **Vlasnik je odložio ovu stavku:** nema novih pokušaja, support
  prijava ili izmene XML-a u T-P10j. Robots već referiše ispravan sitemap.
- T-P10j prenosi postojeći brand H1 u početni HTML i čuva ga pri pokretanju,
  dopunjuje vodič primerima za portfolio i prezentaciju aplikacije i FAQ-om.
  Društvene mreže su izostavljene iz vodiča prema zahtevu vlasnika. Postojeći
  OG/Twitter metapodaci ostaju, kao i aplikaciono deljenje podešavanja scene.
  Implementacija na grani nije dokaz objave; datum produkcione objave upisati
  po merge-u i potvrdi deployment-a.

### Merenje rezultata

Pre poređenja proveriti Google URL Inspection i Search results izveštaj za
tačan URL-prefix property. Koristiti Web, isti URL i iste country/device
filtere; porediti puna 28-dnevna razdoblja, odvojeno mobilni/desktop prikaz.
Zabeležiti impressions, clicks, CTR, average position i najčešće upite, kao i
datum poslednjih dostupnih podataka. Male uzorke i odložene podatke nazvati
nedovoljnim dokazom. Prosečna pozicija nije stabilan rang za sve korisnike.

Čitanje privatnog Google performance izveštaja u ovoj sesiji nije izvršeno:
automatska provera pristupa traži izričito vlasnikovo odobrenje. Nema izmišljenog
baseline-a, raspoređenog automatskog pristupa nalogu ili novog tracker-a.
Podsetnik za pregled za nekoliko nedelja može da se odvoji od samog čitanja
naloga. Vercel posete nisu zamena za search impressions i upite.

Mobilno laboratorijsko poređenje za T-P10j čuva metod i sirove rezultate u
`reports/T-P10j-lab/`; taj test nije field Core Web Vitals, fizički telefon,
Safari ili §6/P-19 release PASS. Ne snižavati kvalitet 3D prikaza radi skora.

## Šta ova promena isporučuje

Opisni title/description i OG/Twitter metapodaci; jedan canonical root;
robots.txt i sitemap.xml; JSON-LD WebApplication; kratak čitljiv opis i
uputstvo u početnom HTML-u, sačuvano pri dnu panela posle inicijalizacije,
iznad završnih Share scene/Keyboard shortcuts komandi.
Sadržaj opisuje postojeći besplatni PNG tok sa generičkim uređajima.
Nema novih zavisnosti, mrežnih poziva, posebnih stranica za botove, izmišljenih
recenzija, novih Analytics događaja ili promene javnog URL-a.

Pre promene, GET za root vraćao je 200, a `/robots.txt` i `/sitemap.xml` 404.
Početni HTML imao je metapodatke za deljenje, canvas i prazan panel; canonical,
sitemap i strukturirani opis nisu postojali. Bing posete je prijavio vlasnik;
broj, upiti, impresije i rang nisu nezavisno provereni.

## Posle merge-a i produkcione objave

Za izvršene korake i trenutno odloženi Bing sitemap važi gornji datirani
status; sledeća lista čuva opšti postupak, nije nalog da se koraci ponove.

1. Proveriti HTTP 200 za root, robots.txt i sitemap.xml, MIME tipove, source
   HTML canonical i odsustvo `noindex` u produkcionom HTML-u/zaglavlju. Otvoriti
   studio i proveriti upload i PNG download. Preview nije dokaz produkcione objave.
2. U [Bing Webmaster Tools](https://www.bing.com/webmasters/) dodati/verifikovati
   tačno `https://plinth-phi.vercel.app/` ako nije već verifikovan. U Sitemaps
   poslati `https://plinth-phi.vercel.app/sitemap.xml`; URL Inspection koristiti
   za root i zahtev indeksiranja kad je potreban. Verifikacioni token/fajl se
   preuzima iz naloga, nikada ne izmišlja. Ne tražiti DNS pristup tuđem vercel.app domenu.
3. U [Google Search Console](https://search.google.com/search-console) koristiti
   URL-prefix property za isti HTTPS root, potvrditi vlasništvo ponuđenim
   postupkom i poslati isti sitemap. Za URL Inspection sačuvati rezultat
   stvarnog fetch/render pregleda, ne samo snimak lokalnog build-a.
4. Zabeležiti datum objave. Porediti 28 dana pre/posle sa istim filterima:
   search impressions, clicks, CTR, upiti i odredišne stranice, odvojeno po
   pretraživaču i uređaju. Kod veoma malog uzorka pojedinačna poseta nije trend.
   Ranije i kasnije periode ne predstavljati kao dokaz da je SEO uzrok promene.
5. Tek prema stvarnim upitima razmotriti dodatna korisna uputstva ili primere
   za konkretne primene; ne stvarati veliki broj gotovo identičnih stranica.

Verifikacija naloga, predaja sitemap-a, zahtev indeksiranja i merenje rasta
nisu izvršeni ovom izmenom koda. Sitemap je signal za otkrivanje sadržaja;
canonical je signal izbora URL-a. JSON-LD ne garantuje poseban prikaz rezultata.
Ni implementacija ni provere ne garantuju indeksiranje, rang ili dodatne posete.

## Granice podataka

P-20 dozvoljava samo postojeće osnovne posete. Query-bearing landing URL-ovi
ne inicijalizuju Analytics, a detaljni referreri takođe mogu sprečiti inicijalizaciju;
referrer statistika zato nije potpuna mera search saobraćaja. SEO promena ne
proširuje ovu dozvolu. Webmaster izveštaji i Vercel Analytics mere različite
stvari; ne očekivati nužno identične ukupne brojeve. Ne slati scene hash,
filenames ili slike pretraživačima kroz sitemap/metapodatke.

Ako se jednog dana menja domen, zasebno planirati preusmeravanja, canonical,
sitemap, društvene URL-ove i P-20 produkcioni Analytics ugovor. Današnji zadatak
ne kupuje domen niti menja hosting.

Primarni izvori i tačno pregledana baza: [istraživanje](tickets/T-P10h-research.md).
Acceptance i write set: [ticket](tickets/T-P10h.md).

## Nalaz tokom provere

Prvi kompletni lokalni CI na implementaciji `dd23f2b` imao je 118/120 guard
prolaza. Dve postojeće light/dark provere u `review-polish.test.ts` otkrile su
da tekst dodat iza poslednje kontrole potiskuje tu kontrolu van panela kada
korisnik skroluje do kraja nakon izvoza. Vodič je zato premešten pre završnih
utility komandi. Postojeći test i njegova očekivanja ostali su neizmenjeni.
Taj prvi rezultat nije PASS za konačnu isporuku; potreban je novi kompletni CI.

## T-P10i: verifikacioni tagovi, 2026-10-26

T-P10h je objavljen kroz PR #48; produkcioni HTTP/metadata/robots/sitemap i
desktop/mobilni upload → PNG download pregled prošli su posle objave.
Dokazi su zabeleženi u opisu tog PR-a.

Vlasnik je potom potvrdio Microsoft prijavu, a Bing je za tačan HTTPS root
izdao `msvalidate.01` tag. Google Search Console je za isti URL-prefix
property izdao `google-site-verification` tag. T-P10i dodaje oba stvarna
izdata taga u početni HTML head. Tagovi služe proveri vlasništva; ne izvršavaju
JavaScript i ne dodaju praćenje posetilaca. Nalozi i kodovi za prijavu se ne
objavljuju. Tagove zadržati i posle uspešne verifikacije.

U trenutku pripreme ove izmene, potvrda vlasništva u oba servisa i slanje
sitemap-a još čekaju objavu tagova. Posle merge-a prvo proveriti tagove na
javnom root-u, zatim kliknuti Verify u oba naloga i poslati postojeći
`https://plinth-phi.vercel.app/sitemap.xml`. Stvarni status zabeležiti u PR
handoff-u. Build ili deploy uspeh ne predstavljaju potvrdu verifikacije,
indeksiranja ili rasta poseta. P-20 Analytics i privatnost uploada ostaju isti.

Research i acceptance: [T-P10i](tickets/T-P10i.md).
