/* ═══════════════════════════════════════════════════════════════
   N DETAILING STUDIO — BACKEND (Google Apps Script)

   Šta radi:
   - Svaku rezervaciju sa sajta upisuje u Google Kalendar
     "N Detailing rezervacije" i šalje email vlasniku.
   - Sajt preko njega čita zauzete termine, pa zakazan termin
     odmah postaje nedostupan za sve posetioce.
   - Ako u taj kalendar ručno dodaš bilo koji događaj
     (npr. "privatno", "zakazano telefonom"), sajt te sate
     prikazuje kao zauzete.

   Uputstvo za postavljanje je u fajlu BACKEND-UPUTSTVO.md
   ═══════════════════════════════════════════════════════════════ */

const IME_KALENDARA = 'N Detailing rezervacije';
const EMAIL_VLASNIKA = 'Aclajkovac@gmail.com';
const TRAJANJE_TERMINA_SATI = 2;

function kalendar() {
  const nadjeni = CalendarApp.getCalendarsByName(IME_KALENDARA);
  if (nadjeni.length) return nadjeni[0];
  const novi = CalendarApp.createCalendar(IME_KALENDARA);
  novi.setTimeZone('Europe/Belgrade');
  return novi;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* GET ?date=2026-07-09  →  { busy: ["10:00", "14:00"] } */
function doGet(e) {
  const date = (e.parameter && e.parameter.date) || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ busy: [] });

  const start = new Date(date + 'T00:00:00');
  const end = new Date(date + 'T23:59:59');
  const busy = [];

  kalendar().getEvents(start, end).forEach(ev => {
    // mark every hour the event covers, so a manually added
    // 09:00–13:00 event blocks both the 10:00 and 12:00 slots
    let t = new Date(ev.getStartTime());
    t.setMinutes(0, 0, 0);
    while (t < ev.getEndTime()) {
      busy.push(Utilities.formatDate(t, 'Europe/Belgrade', 'HH:mm'));
      t = new Date(t.getTime() + 3600000);
    }
  });

  return json({ busy: [...new Set(busy)] });
}

/* POST { service, date, time, name, phone, email, car, segment, note } */
function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); }
  catch (err) { return json({ ok: false, error: 'neispravan zahtev' }); }

  if (!b.date || !b.time || !b.name || !b.phone) {
    return json({ ok: false, error: 'nedostaju podaci' });
  }

  const start = new Date(b.date + 'T' + b.time + ':00');
  const end = new Date(start.getTime() + TRAJANJE_TERMINA_SATI * 3600000);

  // slot got taken in the meantime?
  if (kalendar().getEvents(start, end).length > 0) {
    return json({ ok: false, error: 'zauzeto' });
  }

  kalendar().createEvent(
    `🚗 ${b.service} — ${b.name}`,
    start, end,
    { description:
        `Telefon: ${b.phone}\n` +
        `Vozilo: ${b.car || '-'} ${b.segment || ''}\n` +
        `Email: ${b.email || '-'}\n` +
        `Napomena: ${b.note || '-'}\n\n` +
        `Rezervisano preko sajta.` }
  );

  MailApp.sendEmail(
    EMAIL_VLASNIKA,
    `🚗 Nova rezervacija — ${b.date} u ${b.time}`,
    `Usluga:   ${b.service}\n` +
    `Termin:   ${b.date} u ${b.time}\n` +
    `Ime:      ${b.name}\n` +
    `Telefon:  ${b.phone}\n` +
    `Email:    ${b.email || '-'}\n` +
    `Vozilo:   ${b.car || '-'} ${b.segment || ''}\n` +
    `Napomena: ${b.note || '-'}\n\n` +
    `Termin je automatski upisan u Google Kalendar "${IME_KALENDARA}".`
  );

  return json({ ok: true });
}
