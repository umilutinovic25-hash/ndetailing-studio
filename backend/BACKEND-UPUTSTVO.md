# Postavljanje backend-a (Google Apps Script) — 5 minuta

Backend povezuje sajt sa Google Kalendarom: rezervacije se upisuju u kalendar,
zauzeti termini nestaju sa sajta, a vlasnik dobija email.

> **Važno:** radi se ulogovan u Google nalog **Aclajkovac@gmail.com**
> (da kalendar i mejlovi budu kod vlasnika).

## Koraci

1. Otvori **https://script.google.com** i klikni **"New project"** (Novi projekat)
2. Obriši sve iz editora i nalepi ceo sadržaj fajla **`Code.gs`** iz ovog foldera
3. Gore levo klikni na "Untitled project" i nazovi ga npr. **N Detailing Backend**
4. Klikni **Deploy → New deployment**
5. Klikni na zupčanik ⚙ pored "Select type" → izaberi **Web app**
6. Podesi:
   - Description: `backend`
   - Execute as: **Me**
   - Who has access: **Anyone** ← obavezno, inače sajt ne može da ga zove
7. Klikni **Deploy** → Google će tražiti dozvole → **Authorize access** →
   izaberi nalog → ako piše "Google hasn't verified this app" klikni
   **Advanced → Go to N Detailing Backend (unsafe)** → **Allow**
   (bezbedno je — to je tvoja sopstvena skripta na tvom nalogu)
8. Kopiraj **Web app URL** (počinje sa `https://script.google.com/macros/s/...`)

## Povezivanje sa sajtom

9. Otvori na GitHub-u fajl `js/dostupnost.js` → Edit (olovka)
10. Nalepi URL u polje `backendUrl`:
    ```js
    backendUrl: 'https://script.google.com/macros/s/OVDE_TVOJ_URL/exec',
    ```
11. **Commit changes** — sajt se sam ažurira za ~1 minut

## Kako se koristi posle

- **Nova rezervacija** → stiže email + pojavljuje se u Google Kalendaru
  "N Detailing rezervacije" (vidi se i u Google Calendar aplikaciji na telefonu)
- **Blokiranje termina:** dodaj bilo koji događaj u taj kalendar
  (npr. 10–12h "privatno") — sajt te sate odmah prikazuje kao zauzete
- **Otkazivanje:** obriši događaj iz kalendara — termin se oslobađa na sajtu
- Radno vreme i neradni dani se i dalje podešavaju u `js/dostupnost.js`

## Ako nešto menjaš u Code.gs kasnije

Posle izmene koda uradi **Deploy → Manage deployments → ✏️ Edit →
Version: New version → Deploy** (URL ostaje isti).
