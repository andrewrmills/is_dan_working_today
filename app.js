/**
 * Dan's Roster App — app.js
 *
 * Schedule: 4 days on, 4 days off, repeating 8-day cycle.
 *   Cycle days 1–4 = Work
 *   Cycle days 5–8 = Off
 *
 * Reference: 11 March 2026 is cycle day 5 (first day off).
 *
 * To find the cycle day for any date:
 *   1. Count days from 11 March 2026 to the target date.
 *   2. Add that offset to cycle day 5.
 *   3. Apply modulo 8 (adjusted so result is 1–8, not 0–8).
 */

// ─── Roster calculation ───────────────────────────────────────────────────────

const REFERENCE_DATE = new Date(2026, 2, 11); // 11 March 2026 (month is 0-indexed)
const REFERENCE_CYCLE_DAY = 5;                // Day 5 of the cycle

/**
 * Return the number of whole days between two Date objects (ignoring time).
 */
function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / msPerDay);
}

/**
 * Return the cycle day (1–8) for a given Date.
 */
function getCycleDay(date) {
  const offset = daysBetween(REFERENCE_DATE, date);
  // Shift into 0-based index, apply mod 8, then shift back to 1-based
  const zeroBased = ((REFERENCE_CYCLE_DAY - 1 + offset) % 8 + 8) % 8;
  return zeroBased + 1;
}

/**
 * Return true if the given Date is a work day.
 */
function isWorkDay(date) {
  return getCycleDay(date) <= 4;
}

// ─── State ────────────────────────────────────────────────────────────────────

const today = new Date();
let viewYear  = today.getFullYear();
let viewMonth = today.getMonth(); // 0-indexed
let selectedDate = null;          // currently clicked date
let highlightWeekOf = null;       // date whose week gets highlighted

// ─── DOM references ───────────────────────────────────────────────────────────

const bannerStatus   = document.getElementById('banner-status');
const bannerFace     = document.getElementById('banner-face');
const bannerCycleDay = document.getElementById('banner-cycle-day');
const calTitle       = document.getElementById('cal-title');
const calGrid        = document.getElementById('cal-grid');
const datePicker     = document.getElementById('date-picker');
const popup          = document.getElementById('day-popup');
const popupClose     = document.getElementById('popup-close');
const popupContent   = document.getElementById('popup-content');

// ─── Banner ───────────────────────────────────────────────────────────────────

function renderBanner() {
  const work = isWorkDay(today);
  const cd   = getCycleDay(today);

  bannerStatus.textContent = work ? 'Yes' : 'No';
  bannerFace.textContent   = work ? '😢' : '😊';
  // For work days cd is 1–4; for off days cd is 5–8, so subtract 4 to get 1–4
  const dayNum = work ? cd : cd - 4;
  bannerCycleDay.textContent = work
    ? `Today is work day ${dayNum}`
    : `Today is day off ${dayNum}`;

  const banner = document.getElementById('banner');
  banner.className = work ? 'banner work' : 'banner off';
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/**
 * Return the ISO week start (Monday) for a given date.
 * Used to compare which week a date belongs to.
 */
function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  // Treat Sunday as day 7 so Monday is start of week
  const diff = (day === 0) ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function renderCalendar() {
  calTitle.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  // Clear previous cells (keep header row)
  while (calGrid.children.length > 7) {
    calGrid.removeChild(calGrid.lastChild);
  }

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay  = new Date(viewYear, viewMonth + 1, 0);

  // Determine the week-start of the highlighted week (if any)
  const hlWeekStart = highlightWeekOf ? weekStart(highlightWeekOf) : null;

  // Pad the start with empty cells (Sunday-first grid)
  for (let i = 0; i < firstDay.getDay(); i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-cell blank';
    calGrid.appendChild(blank);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(viewYear, viewMonth, d);
    const work = isWorkDay(date);
    const cd   = getCycleDay(date);
    const isToday   = sameDay(date, today);
    const isSelected = selectedDate && sameDay(date, selectedDate);

    // Is this date in the highlighted week?
    const inHighlightWeek = hlWeekStart && sameDay(weekStart(date), hlWeekStart);

    const cell = document.createElement('div');
    cell.className = [
      'cal-cell',
      work ? 'work' : 'off',
      isToday    ? 'today'     : '',
      isSelected ? 'selected'  : '',
      inHighlightWeek ? 'week-highlight' : ''
    ].filter(Boolean).join(' ');

    cell.innerHTML = `
      <span class="cell-date">${d}</span>
      <span class="cell-emoji">${work ? '😢' : '🍺'}</span>
      <span class="cell-label">${work ? `Work day ${cd}` : `Day off ${cd - 4}`}</span>
    `;

    cell.addEventListener('click', () => showDayPopup(date));
    calGrid.appendChild(cell);
  }
}

// ─── Day popup ────────────────────────────────────────────────────────────────

function showDayPopup(date) {
  selectedDate = date;
  renderCalendar(); // re-render to show selected highlight

  const work = isWorkDay(date);
  const cd   = getCycleDay(date);
  const dateStr = date.toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  popupContent.innerHTML = `
    <p class="popup-date">${dateStr}</p>
    <p class="popup-status ${work ? 'work' : 'off'}">${work ? '😢 Work' : '🍺 Off'}</p>
    <p class="popup-cycle">${work ? `Work day <strong>${cd}</strong>` : `Day off <strong>${cd - 4}</strong>`}</p>
  `;

  popup.classList.remove('hidden');
}

popupClose.addEventListener('click', () => {
  popup.classList.add('hidden');
  selectedDate = null;
  renderCalendar();
});

// Close popup when clicking outside the popup box
popup.addEventListener('click', (e) => {
  if (e.target === popup) {
    popup.classList.add('hidden');
    selectedDate = null;
    renderCalendar();
  }
});

// ─── Navigation ───────────────────────────────────────────────────────────────

document.getElementById('prev-month').addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar();
});

document.getElementById('today-btn').addEventListener('click', () => {
  viewYear  = today.getFullYear();
  viewMonth = today.getMonth();
  highlightWeekOf = null;
  renderCalendar();
});

// ─── Date picker / Jump to date ───────────────────────────────────────────────

document.getElementById('jump-btn').addEventListener('click', () => {
  const val = datePicker.value; // "YYYY-MM-DD"
  if (!val) return;

  const [y, m, d] = val.split('-').map(Number);
  const target = new Date(y, m - 1, d);

  viewYear        = target.getFullYear();
  viewMonth       = target.getMonth();
  highlightWeekOf = target;

  renderCalendar();
});

// Also trigger on Enter key in the date input
datePicker.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('jump-btn').click();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

renderBanner();
renderCalendar();
