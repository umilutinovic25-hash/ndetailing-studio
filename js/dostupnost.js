/* ═══════════════════════════════════════════════════════════════
   PODEŠAVANJE TERMINA — N Detailing Studio

   Ovo je JEDINI fajl koji treba da menjaš.
   Posle svake izmene sačuvaj fajl (na GitHub-u: Edit → Commit changes)
   i sajt se automatski ažurira za par minuta.
   ═══════════════════════════════════════════════════════════════ */

window.DOSTUPNOST = {

  /* ─── BACKEND (Google Kalendar) ───
     URL Apps Script web aplikacije — vidi backend/BACKEND-UPUTSTVO.md
     Dok je prazno (''), sajt radi bez kalendara.                    */
  backendUrl: '',

  /* Broj na koji stižu WhatsApp potvrde (bez + i bez razmaka) */
  brojWhatsApp: '381665154400',

  /* Email na koji stižu rezervacije */
  emailZaRezervacije: 'Aclajkovac@gmail.com',

  /* ─── RADNO VREME po danima ───
     Format: [od, do] u satima. Ako ne radiš taj dan, stavi: null   */
  radnoVreme: {
    ponedeljak: [8, 20],
    utorak:     [8, 20],
    sreda:      [8, 20],
    cetvrtak:   [8, 20],
    petak:      [8, 20],
    subota:     [9, 18],
    nedelja:    null
  },

  /* Koliko sati traje jedan termin (razmak između termina) */
  trajanjeTermina: 2,

  /* ─── NERADNI DANI ───
     Datumi kada NE radiš (praznik, odmor...). Format: 'GGGG-MM-DD'
     Primer:  neradniDani: ['2026-07-15', '2026-08-01'],            */
  neradniDani: [
    // '2026-07-15',
  ],

  /* ─── ZAUZETI TERMINI ───
     Pojedinačni termini koje želiš da blokiraš (već zakazano
     telefonom, privatna obaveza...). Format: 'GGGG-MM-DD': ['HH:00']
     Primer:
     zauzetiTermini: {
       '2026-07-10': ['10:00', '12:00'],
       '2026-07-11': ['08:00'],
     },                                                              */
  zauzetiTermini: {
    // '2026-07-10': ['10:00', '12:00'],
  }

};
