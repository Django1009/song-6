const loadBtn = document.getElementById('loadBtn');
const spinner = document.getElementById('spinner');
const resultsEl = document.getElementById('results');
const daySelect = document.getElementById('daySelect');

let loadedItems = [];

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
  loadBtn.disabled = true;
  spinner.classList.add('show');
  resultsEl.innerHTML = '';

  const files = [
    'data1.json',
    'data2.json',
    'data3.json',
    'data4.json',
    'data5.json',
    'data6.json',
    'data7.json'
  ];

  try {
    const responses = await Promise.all(files.map(f => fetchJson(f)));

    const items = responses.flat();

    loadedItems = items;

    if (!items.length) {
      resultsEl.textContent = 'No data found.';
      return;
    }

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

if (daySelect) {
  daySelect.addEventListener('change', () => {
    if (loadedItems && loadedItems.length) renderSchedule(daySelect.value);
  });
}

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
    p1.textContent = item.artist ? `Artist: ${item.artist}` : (item.class ? `Class: ${item.class}` : '');

    const p2 = document.createElement('p');
    p2.textContent = item.year ? `Year: ${item.year}` : (item.location ? `Location: ${item.location}` : '');

    card.appendChild(title);
    if (p1.textContent) card.appendChild(p1);
    if (p2.textContent) card.appendChild(p2);

    resultsEl.appendChild(card);
  });
}
