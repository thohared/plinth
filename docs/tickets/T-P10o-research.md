# T-P10o research: GEO / LLMO / AEO

Autor: Codex (GPT-6), 2026-10-30. Pregledana baza nakon fetch-a:
`84ffcc57e4d13939350005fd387852e63f0c65fe` (origin/main).
Shared handoff/policy pregledani na reviziji
`c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`; ciljna Plinth specifikacija
ostaje merodavna. Ovo je istraživanje pre implementation ticketa.

## Nalazi i odluke

- **F1, postojeća osnova.** `index.html` već ima canonical, WebApplication
  JSON-LD i statički vodič koji panel zadržava. Robots dozvoljava crawl svim
  botovima; sitemap sadrži samo javni root. Zadržati jedan kanonski dokument,
  postojeće verifikacije i pravila privatnosti. Ne praviti posebne bot-stranice.
- **F2, AI pretraga.** Google-ov aktuelni [AI vodič][google] traži iste osnove:
  pristupačan, koristan sadržaj i strukturirane podatke koji odgovaraju vidljivom
  tekstu. Ne zahteva poseban AI schema tip. Google ne koristi `llms.txt` za
  vidljivost/rang u AI rezultatima. [Bing smernice][bing] takođe naglašavaju
  jasne činjenice, crawlable HTML i izbegavanje manipulacije. Nema garancije
  indeksiranja, citata, preporuke ili rasta poseta.
- **F3, pitanja koja alat može pouzdano da odgovori.** §4.1–4.2, §4.5–4.6,
  §4.8–4.9 i P-13/P-14/P-19 definišu pet generičkih modela, tri ulazna formata,
  Fill screen/Fit image, PNG-only release, literalne izlazne dimenzije i deljenje
  podešavanja bez slike. Kratak pregled, tabela 1× dimenzija i odgovori o ovim
  granicama pomažu i čitaocu i servisu koji citira stranicu. Ne dodavati video,
  upload servis, nalog, izmišljene recenzije ili tvrdnje o podršci svakog uređaja.
- **F4, opis entiteta.** [Schema.org WebApplication][schema] podržava stabilan
  identifikator, jezik, screenshot i featureList. Dopuniti postojeći pojedinačni
  objekat, uskladiti featureList sa vidljivim činjenicama. Ne izmišljati rating,
  popularnost ili nagrade; ne dodavati FAQ rich-result obećanja.
- **F5, pristup AI servisima.** [OpenAI bot dokumentacija][openai] razlikuje
  OAI-SearchBot, GPTBot i korisnički ChatGPT-User. Postojeći wildcard Allow već
  dopušta search crawler; nema razloga menjati robots ili trening politiku.
  [llms.txt][llms] je predlog za kratak Markdown pregled i korisne linkove.
  Opcioni fajl može opisati iste javne činjenice, ali nije SEO uslov ili dokaz
  da ga svaki servis koristi. Bez bot-uputstava za rangiranje i novih endpointa.
- **F6, UX i zaštita.** Proširiti samo postojeći vodič pri dnu panela, pre utility
  komandi. Dvokolonska tabela i semantički dl staju u uski panel; proveriti
  desktop/mobile, light/dark, bez JS-a i posle pokretanja. Bez novih runtime
  zahteva, zavisnosti, trackera, promena renderovanja ili baseline-a. Dosadašnji
  SEO guardovi ostaju neizmenjeni; novi proverava dimenzije prema P-13 i
  usklađenost vidljivih/strukturiranih činjenica. Namerno pogrešna dimenzija,
  JSON-LD činjenica ili llms činjenica moraju oboriti test na privremenom buildu.
- **F7, objava i merenje.** Vlasnik je odložio Bing sitemap i izostavio društvene
  mreže iz sadržaja. Ovaj ticket ne pristupa webmaster nalozima, ne ponavlja
  verifikaciju i ne predstavlja laboratorijski test kao search rezultat.
  Posle zasebno odobrenog merge-a proveriti javni HTML/llms endpoint i zabeležiti
  datum. Stvarne search/AI citate i saobraćaj meriti zasebno, uporedivim periodima.

## Obuhvat specifikacije

Prezentacija već implementiranog proizvoda prema §1, §2, §4.1–4.2,
§4.5–4.6, §4.8–4.9, §7–§8, P-2/P-5/P-10(1)/P-13/P-14/P-19/P-20.
Nema novog ponašanja aplikacije; nije potrebna izmena specifikacije.
Fizički GPU/performance i Safari release kriterijumi ostaju odvojeni.

[google]: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
[bing]: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
[schema]: https://schema.org/WebApplication
[openai]: https://developers.openai.com/api/docs/bots
[llms]: https://llmstxt.org/

## Nalaz nezavisnog pregleda pre objave

Predlog formata rezerviše H2 odeljke za liste Markdown linkova; detalji proizvoda
idu pre njih, bez dodatnih heading-a. Referentni parser pokušava da svaku
nepraznu liniju H2 odeljka pročita kao link. Prvobitni H2 naslovi za mogućnosti
i tabelu zato nisu kompatibilni. Zameniti ih podebljanim oznakama pre jedinog
H2 odeljka sa linkovima; kvalifikaciju o opcionom formatu takođe staviti pre
linkova. Aditivni guard proverava ovu granicu, uz seed vraćenog H2 naslova.
