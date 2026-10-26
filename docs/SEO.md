# Plinth: SEO i praćenje rezultata

T-P10h, 2026-10-26. Autor: Codex (GPT-6).
Kanonski sajt: https://plinth-phi.vercel.app/

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
