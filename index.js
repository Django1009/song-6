const loadBtn = document.getElementById('loadBtn');
const spinner = document.getElementById('spinner');
const resultsEl = document.getElementById('results');
const daySelect = document.getElementById('daySelect');

// Holds the flattened items loaded from JSON files (expected 7 blocks)
let loadedItems = [];

// Day -> schedule mapping (uses 1-based block numbers corresponding to data1..data7)
const SCHEDULES = {
  A: [1, 2, 3, 5, 6],
  B: [4, 1, 2, 7, 5],
  C: [3, 4, 1, 6, 7],
  D: [2, 3, 4, 5, 6],
  E: [1, 2, 3, 7, 5],
  F: [4, 1, 2, 6, 7],
  G: [3, 4, 7, 5, 6]
};

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${path}`);
  return res.json();
}

async function loadAllData() {
  // Show spinner and disable button
  loadBtn.disabled = true;
  spinner.classList.add('show');
  resultsEl.innerHTML = '';

  const files = [
    'data/data1.json',
    'data/data2.json',
    'data/data3.json',
    'data/data4.json',
    'data/data5.json',
    'data/data6.json',
    'data/data7.json'
  ];

  try {
    // Fetch all files in parallel
    const responses = await Promise.all(files.map(f => fetchJson(f)));

    // responses are arrays (we used arrays in sample JSONs) — flatten and render
    const items = responses.flat();

    // store for later schedule rendering
    loadedItems = items;

    if (!items.length) {
      resultsEl.textContent = 'No data found.';
      return;
    }

    // Render schedule for currently selected day (default to A)
    const selectedDay = (daySelect && daySelect.value) ? daySelect.value : 'A';
    renderSchedule(selectedDay);

  } catch (err) {
    console.error(err);
    resultsEl.textContent = `Error loading data: ${err.message}`;
  } finally {
    spinner.classList.remove('show');
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener('click', loadAllData);

// Re-render when the selected day changes (if data already loaded)
if (daySelect) {
  daySelect.addEventListener('change', () => {
    if (loadedItems && loadedItems.length) renderSchedule(daySelect.value);
  });
}

// Optional: auto-load on first visit for demo
// loadAllData();

/**
 * Render the schedule for a given day (A..G) using loadedItems and SCHEDULES mapping.
 */
function renderSchedule(day) {
  resultsEl.innerHTML = '';

  if (!loadedItems || !loadedItems.length) {
    resultsEl.textContent = 'No data loaded yet. Click "Load Data".';
    return;
  }

  const mapping = SCHEDULES[day] || SCHEDULES['A'];

  mapping.forEach((blockNum, idx) => {
    const item = loadedItems[blockNum - 1] || {};

    const card = document.createElement('article');
    card.className = 'card';

  const title = document.createElement('h3');
  title.textContent = `Block ${idx + 1}: ${item.title || 'Untitled'}`;

    const p1 = document.createElement('p');
    // prefer artist, then class
    p1.textContent = item.artist ? `Artist: ${item.artist}` : (item.class ? `Class: ${item.class}` : '');

    const p2 = document.createElement('p');
    // prefer year then location
    p2.textContent = item.year ? `Year: ${item.year}` : (item.location ? `Location: ${item.location}` : '');

    card.appendChild(title);
    if (p1.textContent) card.appendChild(p1);
    if (p2.textContent) card.appendChild(p2);

    resultsEl.appendChild(card);
  });
}
