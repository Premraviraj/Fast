// ---- Season state ----
// activeSeason is "current" until we know the real year; SEASON_LABEL built dynamically
let activeSeason = 'current';
let currentSeasonYear = new Date().getFullYear(); // fallback, overwritten on init
const SEASON_LABEL = {};

async function initSeasons() {
  try {
    const { season } = await apiFetch('/api/meta/season');
    currentSeasonYear = season;
  } catch {
    // fallback: use JS year
  }

  // Build pills: current year + 2 previous
  const years = [currentSeasonYear - 2, currentSeasonYear - 1, currentSeasonYear];
  years.forEach(yr => { SEASON_LABEL[String(yr)] = String(yr); });
  SEASON_LABEL['current'] = String(currentSeasonYear);

  const container = document.getElementById('season-pills');
  container.innerHTML = years.map((yr, i) => {
    const isCurrent = i === years.length - 1;
    const season = isCurrent ? 'current' : String(yr);
    const label = String(yr).slice(2); // "24", "25", "26"
    return `<button class="season-pill${isCurrent ? ' active' : ''}" data-season="${season}" title="${yr} Season">${label}</button>`;
  }).join('');

  // Wire up pill clicks
  container.querySelectorAll('.season-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.season-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSeason = pill.dataset.season;
      const activeView = document.querySelector('.nav-btn.active')?.dataset.view || 'home';
      clearView(activeView);
      showSkeleton(activeView);
      updateSeasonLabels();
      loadView(activeView);
    });
  });

  updateSeasonLabels();

  // Restore last visited page (or default to home)
  const savedView = localStorage.getItem('pitwall_view') || 'home';
  const seasonFilter = document.querySelector('.season-filter');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === savedView));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${savedView}`)?.classList.add('active');
  if (seasonFilter) seasonFilter.style.display = (savedView === 'teams' || savedView === 'merch' || savedView === 'compare') ? 'none' : '';

  showSkeleton(savedView);
  await new Promise(r => setTimeout(r, 500));
  loadView(savedView);
}

// ---- Skeleton loaders ----
function skelCards(n, cols = 'repeat(auto-fill, minmax(180px, 1fr))') {
  return `<div class="skel-grid" style="grid-template-columns:${cols}">` +
    Array(n).fill(`
      <div class="skel-card">
        <div class="skel skel-img"></div>
        <div class="skel skel-h"></div>
        <div class="skel skel-h-sm"></div>
        <div class="skel skel-h-xs"></div>
      </div>`).join('') + '</div>';
}
function skelRows(n) {
  return Array(n).fill(`
    <div class="skel-row">
      <div class="skel skel-avatar"></div>
      <div class="skel-lines">
        <div class="skel skel-h"></div>
        <div class="skel skel-h-sm"></div>
      </div>
      <div class="skel skel-bar"></div>
    </div>`).join('');
}
function skelStats(n) {
  return `<div class="skel-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">` +
    Array(n).fill(`
      <div class="skel-stat-card">
        <div class="skel skel-h-xs"></div>
        <div class="skel skel-h" style="width:50%"></div>
        <div class="skel skel-h-sm"></div>
      </div>`).join('') + '</div>';
}

function showSkeleton(view) {
  switch (view) {
    case 'home':
      document.getElementById('home-cards').innerHTML = skelStats(4);
      document.getElementById('last-race').innerHTML = skelRows(8);
      break;
    case 'races':
      document.getElementById('races-grid').innerHTML =
        skelCards(12, 'repeat(auto-fill, minmax(260px, 1fr))');
      break;
    case 'standings':
      document.querySelector('#driver-standings-table tbody').innerHTML =
        Array(12).fill(`<tr>${Array(6).fill('<td><div class="skel skel-h" style="margin:4px 0"></div></td>').join('')}</tr>`).join('');
      break;
    case 'drivers':
      document.getElementById('drivers-grid').innerHTML =
        skelCards(12, 'repeat(auto-fill, minmax(180px, 1fr))');
      break;
    case 'circuits':
      document.getElementById('circuits-grid').innerHTML =
        skelCards(10, 'repeat(auto-fill, minmax(260px, 1fr))');
      break;
    case 'teams':
      document.getElementById('teams-grid').innerHTML =
        skelCards(10, 'repeat(auto-fill, minmax(260px, 1fr))');
      break;
    case 'highlights':
      document.getElementById('highlights-grid').innerHTML =
        skelCards(8, 'repeat(auto-fill, minmax(280px, 1fr))');
      break;
    case 'merch':
      document.getElementById('merch-grid').innerHTML =
        skelCards(10, 'repeat(auto-fill, minmax(280px, 1fr))');
      break;
  }
}
const cache = {};
function seasonCache(season) {
  if (!cache[season]) cache[season] = {};
  return cache[season];
}

// ---- Team colors ----
const TEAM_COLORS = {
  'red_bull': '#3671C6', 'mercedes': '#27F4D2', 'ferrari': '#E8002D',
  'mclaren': '#FF8000', 'aston_martin': '#229971', 'alpine': '#FF87BC',
  'williams': '#64C4FF', 'rb': '#6692FF', 'kick_sauber': '#52E252',
  'haas': '#B6BABD', 'alphatauri': '#5E8FAA', 'alfa': '#C92D4B',
  'sauber': '#52E252', 'racing_point': '#F596C8', 'renault': '#FFF500',
};
function teamColor(id) { return TEAM_COLORS[id] || '#888'; }

// ---- Driver photos ----
const DRIVER_PHOTOS = {
  'max_verstappen': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
  'norris':         'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
  'leclerc':        'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
  'piastri':        'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
  'sainz':          'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png',
  'hamilton':       'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png',
  'russell':        'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
  'perez':          'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png',
  'alonso':         'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
  'stroll':         'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
  'gasly':          'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png',
  'ocon':           'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png',
  'albon':          'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png',
  'tsunoda':        'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',
  'bottas':         'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png',
  'zhou':           'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png',
  'magnussen':      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png',
  'hulkenberg':     'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png',
  'ricciardo':      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png',
  'lawson':         'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png',
  'colapinto':      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png',
  'bearman':        'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png',
  'antonelli':      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea_Kimi_Antonelli/andant01.png',
  'hadjar':         'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png',
  'doohan':         'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png',
  'bortoleto':      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBAR01_Gabriel_Bortoleto/gabbar01.png',
  'lindblad':       'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ARVLIN01_Arvid_Lindblad/arvlin01.png',
};
function driverPhoto(id) { return DRIVER_PHOTOS[id] || null; }

// ---- Utils ----
function loader(_on) { /* replaced by skeleton loaders */ }
async function apiFetch(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('API error');
  return res.json();
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function isDatePast(d) { return new Date(d) < new Date(); }
function seasonLabel(s) { return SEASON_LABEL[s] || s; }

// ---- Season filter (wired dynamically in initSeasons) ----

function updateSeasonLabels() {
  const yr = seasonLabel(activeSeason);
  document.getElementById('hero-title').innerHTML = `${yr} Formula 1<br><span class="red">World Championship</span>`;
  document.getElementById('races-title').textContent = `${yr} Race Schedule`;
  document.getElementById('standings-title').textContent = `${yr} Standings`;
  document.getElementById('drivers-title').textContent = `${yr} Drivers`;
  document.getElementById('circuits-title').textContent = `${yr} Circuits`;
  document.getElementById('teams-title').textContent = `${yr} Teams`;
  const navLabel = document.getElementById('nav-season-label');
  if (navLabel) navLabel.textContent = `${yr} Season`;
}

function clearView(view) {
  // Clear rendered content so it reloads for the new season
  if (view === 'races') document.getElementById('races-grid').innerHTML = '';
  if (view === 'standings') {
    document.querySelector('#driver-standings-table tbody').innerHTML = '';
    document.querySelector('#constructor-standings-table tbody').innerHTML = '';
  }
  if (view === 'drivers') document.getElementById('drivers-grid').innerHTML = '';
  if (view === 'circuits') document.getElementById('circuits-grid').innerHTML = '';
  if (view === 'teams') document.getElementById('teams-grid').innerHTML = '';
  if (view === 'highlights') document.getElementById('highlights-grid').innerHTML = '';
  if (view === 'home') {
    document.getElementById('home-cards').innerHTML = '';
    document.getElementById('last-race').innerHTML = '';
  }
}

// ---- Hamburger / curtain nav ----
const hamburger = document.getElementById('hamburger');
const navOverlay = document.getElementById('nav-overlay');
let navOpen = false;

// Tooltip — show on load, dismiss on click or after 4s, then show season tip
const hamburgerTip = document.getElementById('hamburger-tip');
const tipTimer = setTimeout(() => hamburgerTip.classList.add('visible'), 800);
const dismissTip = () => { hamburgerTip.classList.remove('visible'); clearTimeout(tipTimer); };
setTimeout(() => {
  dismissTip();
  // Show season tip 0.5s after menu tip hides
  setTimeout(() => {
    const seasonTip = document.getElementById('season-tip');
    if (seasonTip) {
      seasonTip.classList.add('visible');
      setTimeout(() => seasonTip.classList.remove('visible'), 3500);
    }
  }, 500);
}, 4800);
hamburger.addEventListener('click', dismissTip, { once: true });

function openNav() {
  navOpen = true;
  hamburger.classList.add('open');
  navOverlay.classList.add('open');
  document.querySelector('.site-header').classList.add('nav-is-open');
  gsap.timeline()
    .to(navOverlay, { '--p1': '100%', duration: 0.4, ease: 'power1.out' }, 0)
    .to(navOverlay, { '--p2': '100%', duration: 0.4, ease: 'power1.out' }, 0.1)
    .to(navOverlay, { '--p3': '100%', duration: 0.4, ease: 'power1.out' }, 0.2)
    .to(navOverlay, { '--p4': '100%', duration: 0.4, ease: 'power1.out' }, 0.3);
}

function closeNav() {
  navOpen = false;
  hamburger.classList.remove('open');
  document.querySelector('.site-header').classList.remove('nav-is-open');
  gsap.timeline({ onComplete: () => navOverlay.classList.remove('open') })
    .to(navOverlay, { '--p4': '0%', duration: 0.35, ease: 'power1.in' }, 0)
    .to(navOverlay, { '--p3': '0%', duration: 0.35, ease: 'power1.in' }, 0.08)
    .to(navOverlay, { '--p2': '0%', duration: 0.35, ease: 'power1.in' }, 0.16)
    .to(navOverlay, { '--p1': '0%', duration: 0.35, ease: 'power1.in' }, 0.24);
}

hamburger.addEventListener('click', () => navOpen ? closeNav() : openNav());

// Close on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape' && navOpen) closeNav(); });

// ---- Navigation ----
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const view = btn.dataset.view;
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    if (navOpen) closeNav();

    // Show skeleton + 0.5s delay only on first visit (empty container)
    const containers = {
      home: () => document.getElementById('home-cards'),
      races: () => document.getElementById('races-grid'),
      standings: () => document.querySelector('#driver-standings-table tbody'),
      drivers: () => document.getElementById('drivers-grid'),
      circuits: () => document.getElementById('circuits-grid'),
      teams: () => document.getElementById('teams-grid'),
      highlights: () => document.getElementById('highlights-grid'),
      merch: () => document.getElementById('merch-grid'),
      compare: () => document.getElementById('compare-empty'),
    };
    const el = containers[view]?.();
    if (el && !el.children.length) {
      showSkeleton(view);
      await new Promise(r => setTimeout(r, 500));
    }

    loadView(view);

    // Hide season filter on teams, merch and compare pages
    const seasonFilter = document.querySelector('.season-filter');
    if (seasonFilter) seasonFilter.style.display = (view === 'teams' || view === 'merch' || view === 'compare') ? 'none' : '';

    // Persist active page
    localStorage.setItem('pitwall_view', view);
  });
});

// ---- Tabs (delegated) ----
document.addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  const parent = btn.closest('section') || document;
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  parent.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const tab = parent.querySelector(`#${btn.dataset.tab}`);
  if (tab) tab.classList.add('active');
});

// ---- Modal ----
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', closeModal);
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

// ---- Views ----
async function loadView(view) {
  if (view === 'home') await loadHome();
  else if (view === 'races') await loadRaces();
  else if (view === 'standings') await loadStandings();
  else if (view === 'drivers') await loadDrivers();
  else if (view === 'circuits') await loadCircuits();
  else if (view === 'teams') await loadTeams();
  else if (view === 'highlights') await loadHighlights();
  else if (view === 'merch') loadMerch();
  else if (view === 'compare') initCompare();
}

// ---- HOME ----
async function loadHome() {
  loader(true);
  const s = activeSeason;
  const yr = seasonLabel(s);
  try {
    const c = seasonCache(s);
    const [races, last, ds] = await Promise.all([
      c.races || apiFetch(`/api/${s}/races`).then(d => { c.races = d; return d; }),
      apiFetch(`/api/${s}/results/last`),
      c.driverStandings || apiFetch(`/api/${s}/standings/drivers`).then(d => { c.driverStandings = d; return d; }),
    ]);

    const done = races.filter(r => isDatePast(r.date));
    const next = races.find(r => !isDatePast(r.date));
    const leader = ds?.DriverStandings?.[0];

    document.getElementById('home-cards').innerHTML = `
      <div class="stat-card">
        <div class="label">Season</div>
        <div class="value">${yr}</div>
        <div class="sub">Formula 1 World Championship</div>
      </div>
      <div class="stat-card">
        <div class="label">Races Completed</div>
        <div class="value">${done.length}</div>
        <div class="sub">of ${races.length} total</div>
      </div>
      <div class="stat-card">
        <div class="label">${s === 'current' ? 'Next Race' : 'Champion'}</div>
        <div class="value" style="font-size:18px">${
          s === 'current'
            ? (next ? next.raceName.replace('Grand Prix','GP') : '—')
            : (leader ? leader.Driver.familyName : '—')
        }</div>
        <div class="sub">${
          s === 'current'
            ? (next ? formatDate(next.date) : 'Season complete')
            : (leader ? leader.points + ' pts' : '')
        }</div>
      </div>
      <div class="stat-card">
        <div class="label">Championship Leader</div>
        <div class="value" style="font-size:18px">${leader ? leader.Driver.familyName : '—'}</div>
        <div class="sub">${leader ? leader.points + ' pts' : ''}</div>
      </div>`;

    renderLastRace(last, yr);
  } catch (e) {
    document.getElementById('home-cards').innerHTML = `<p style="color:var(--muted)">Failed to load data.</p>`;
  }
  loader(false);
}

function renderLastRace(race, yr) {
  if (!race) { document.getElementById('last-race').innerHTML = `<p style="color:var(--muted)">No race data yet.</p>`; return; }
  const results = race.Results?.slice(0, 10) || [];
  document.getElementById('last-race').innerHTML = `
    <p style="color:var(--muted);margin-bottom:12px;font-size:14px">${race.raceName} — ${formatDate(race.date)} — ${race.Circuit.circuitName}</p>
    <table class="race-result-table">
      <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Time / Status</th><th>Points</th></tr></thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td class="${r.position==='1'?'pos-1':r.position==='2'?'pos-2':r.position==='3'?'pos-3':''}">${r.position}</td>
            <td>${r.Driver.givenName} ${r.Driver.familyName}</td>
            <td>${r.Constructor.name}</td>
            <td>${r.Time?.time || r.status}</td>
            <td>${r.points}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ---- RACES ----
async function loadRaces() {
  const grid = document.getElementById('races-grid');
  if (grid.children.length && !grid.querySelector('.skel-card')) return;
  loader(true);
  const s = activeSeason;
  try {
    const c = seasonCache(s);
    const races = c.races || await apiFetch(`/api/${s}/races`).then(d => { c.races = d; return d; });
    renderRacesGrid('races-grid', races, s);
  } catch (e) { console.error(e); }
  loader(false);
}

function renderRacesGrid(containerId, races, season) {
  const today = new Date();
  const nextIdx = races.findIndex(r => new Date(r.date) >= today);
  document.getElementById(containerId).innerHTML = races.map((r, i) => {
    const past = isDatePast(r.date);
    const isNext = i === nextIdx && season === 'current';
    const badge = isNext ? '<span class="race-badge badge-next">NEXT RACE</span>'
      : past ? '<span class="race-badge badge-done">Completed</span>'
      : '<span class="race-badge badge-upcoming">Upcoming</span>';
    return `
      <div class="race-card ${past?'past':''} ${isNext?'next':''}" data-round="${r.round}" data-season="${season}">
        <div class="race-round">Round ${r.round}</div>
        <div class="race-name">${r.raceName}</div>
        <div class="race-circuit">${r.Circuit.circuitName}, ${r.Circuit.Location.country}</div>
        <div class="race-date">${formatDate(r.date)}</div>
        ${badge}
      </div>`;
  }).join('');

  document.getElementById(containerId).querySelectorAll('.race-card').forEach(card => {
    card.addEventListener('click', () => showRaceModal(card.dataset.round, card.dataset.season));
  });
}

async function showRaceModal(round, season) {
  openModal('<div style="color:var(--muted);padding:20px;text-align:center">Loading...</div>');
  try {
    const race = await apiFetch(`/api/${season}/results/${round}`);

    // Upcoming race — show probability panel
    if (!race || !race.Results) {
      // Find race info from cache to get circuitId
      const c = seasonCache(season);
      const raceInfo = c.races?.find(r => r.round === round);
      const circuitId = raceInfo?.Circuit?.circuitId;
      const raceName = raceInfo?.raceName || `Round ${round}`;
      const raceDate = raceInfo ? formatDate(raceInfo.date) : '';
      const circuitName = raceInfo?.Circuit?.circuitName || '';

      openModal(`
        <div class="modal-title">${raceName}</div>
        <div class="modal-sub">${raceDate}${circuitName ? ' — ' + circuitName : ''}</div>
        <div class="prob-section">
          <div class="prob-header">
            <span class="prob-title">Win Probability</span>
            <span class="prob-subtitle">Based on last 5 years at this circuit + current standings</span>
          </div>
          <div id="prob-list" class="prob-list">
            <div style="color:var(--muted);font-size:13px;padding:12px 0">
              ${circuitId ? 'Calculating...' : 'Circuit data unavailable.'}
            </div>
          </div>
        </div>`);

      if (!circuitId) return;

      try {
        const probs = await apiFetch(`/api/probability/${circuitId}`);
        const el = document.getElementById('prob-list');
        if (!el || !probs.length) return;
        el.innerHTML = probs.map((d, i) => {
          const color = teamColor(d.constructorId);
          const photo = driverPhoto(d.driverId);
          const initials = d.name.split(' ').map(x => x[0]).join('');
          return `
            <div class="prob-row">
              <div class="prob-rank">${i + 1}</div>
              <div class="prob-avatar" style="border-color:${color}">
                ${photo
                  ? `<img src="${photo}" alt="${d.name}" onerror="this.outerHTML='<span>${initials}</span>'">`
                  : `<span>${initials}</span>`}
              </div>
              <div class="prob-info">
                <div class="prob-name">${d.name}</div>
                <div class="prob-team" style="color:${color}">${d.constructor}</div>
                <div class="prob-bar-wrap">
                  <div class="prob-bar" style="width:${d.probability}%;background:${color}"></div>
                </div>
              </div>
              <div class="prob-right">
                <div class="prob-pct">${d.probability}%</div>
                <div class="prob-meta">
                  ${d.wins > 0 ? `<span class="prob-tag wins" title="${d.wins} win${d.wins>1?'s':''} at this circuit">${d.wins}W</span>` : ''}
                  ${d.podiums > 0 ? `<span class="prob-tag pods" title="${d.podiums} podium${d.podiums>1?'s':''} at this circuit">${d.podiums}P</span>` : ''}
                  ${d.inForm ? `<span class="prob-tag form" title="Strong form in last 2 races">🔥</span>` : ''}
                  ${d.topCar ? `<span class="prob-tag car" title="Top 3 constructor this season">⚡</span>` : ''}
                </div>
              </div>
            </div>`;
        }).join('');
      } catch {
        const el = document.getElementById('prob-list');
        if (el) el.innerHTML = `<div style="color:var(--muted);font-size:13px">Could not load probability data.</div>`;
      }
      return;
    }

    // Past race — show results as before
    openModal(`
      <div class="modal-title">${race.raceName}</div>
      <div class="modal-sub">${formatDate(race.date)} — ${race.Circuit.circuitName}, ${race.Circuit.Location.country}</div>
      <table class="race-result-table" style="margin-top:16px">
        <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Laps</th><th>Time / Status</th><th>Pts</th></tr></thead>
        <tbody>
          ${race.Results.map(r => `
            <tr>
              <td class="${r.position==='1'?'pos-1':r.position==='2'?'pos-2':r.position==='3'?'pos-3':''}">${r.position}</td>
              <td>${r.Driver.givenName} ${r.Driver.familyName}</td>
              <td>${r.Constructor.name}</td>
              <td>${r.laps}</td>
              <td>${r.Time?.time || r.status}</td>
              <td>${r.points}</td>
            </tr>`).join('')}
        </tbody>
      </table>`);
  } catch (e) {
    openModal('<p style="color:var(--muted)">Failed to load data.</p>');
  }
}

// ---- STANDINGS ----
async function loadStandings() {
  const tbody = document.querySelector('#driver-standings-table tbody');
  if (tbody.children.length && !tbody.querySelector('.skel')) return;
  loader(true);
  const s = activeSeason;
  try {
    const c = seasonCache(s);
    const [ds, cs] = await Promise.all([
      c.driverStandings || apiFetch(`/api/${s}/standings/drivers`).then(d => { c.driverStandings = d; return d; }),
      c.constructorStandings || apiFetch(`/api/${s}/standings/constructors`).then(d => { c.constructorStandings = d; return d; }),
    ]);
    if (ds?.DriverStandings) renderDriverStandingsTable('#driver-standings-table tbody', ds.DriverStandings);
    if (cs?.ConstructorStandings) renderConstructorStandingsTable('#constructor-standings-table tbody', cs.ConstructorStandings);
  } catch (e) { console.error(e); }
  loader(false);
}

function renderDriverStandingsTable(selector, standings) {
  document.querySelector(selector).innerHTML = standings.map(s => `
    <tr>
      <td class="pos">${s.position}</td>
      <td class="driver-name">
        <span class="team-dot" style="background:${teamColor(s.Constructors[0]?.constructorId)}"></span>
        ${s.Driver.givenName} ${s.Driver.familyName}
      </td>
      <td>${s.Constructors[0]?.name || '—'}</td>
      <td>${s.Driver.nationality}</td>
      <td class="pts">${s.points}</td>
      <td>${s.wins}</td>
    </tr>`).join('');
}

function renderConstructorStandingsTable(selector, standings) {
  document.querySelector(selector).innerHTML = standings.map(s => `
    <tr>
      <td class="pos">${s.position}</td>
      <td class="driver-name">
        <span class="team-dot" style="background:${teamColor(s.Constructor.constructorId)}"></span>
        ${s.Constructor.name}
      </td>
      <td>${s.Constructor.nationality}</td>
      <td class="pts">${s.points}</td>
      <td>${s.wins}</td>
    </tr>`).join('');
}

// ---- DRIVERS ----
async function loadDrivers() {
  const grid = document.getElementById('drivers-grid');
  if (grid.children.length && !grid.querySelector('.skel-card')) return;
  loader(true);
  const s = activeSeason;
  const yr = seasonLabel(s);
  try {
    const c = seasonCache(s);
    const [drivers, ds] = await Promise.all([
      c.drivers || apiFetch(`/api/${s}/drivers`).then(d => { c.drivers = d; return d; }),
      c.driverStandings || apiFetch(`/api/${s}/standings/drivers`).then(d => { c.driverStandings = d; return d; }),
    ]);

    // Build team map for this season
    const teamMap = {};
    ds?.DriverStandings?.forEach(st => {
      teamMap[st.Driver.driverId] = {
        teamId: st.Constructors[0]?.constructorId || '',
        teamName: st.Constructors[0]?.name || '—',
      };
    });
    c.teamMap = teamMap;

    document.getElementById('drivers-grid').innerHTML = drivers.map(d => {
      const team = teamMap[d.driverId] || {};
      const color = teamColor(team.teamId);
      const initials = (d.givenName[0] || '') + (d.familyName[0] || '');
      const photo = driverPhoto(d.driverId);
      return `
        <div class="driver-card" data-id="${d.driverId}" data-season="${s}">
          ${photo
            ? `<img class="driver-card-photo" src="${photo}" alt="${d.givenName} ${d.familyName}" loading="lazy" onerror="this.outerHTML='<div class=\\'driver-card-photo-placeholder\\'>${initials}</div>'">`
            : `<div class="driver-card-photo-placeholder">${initials}</div>`}
          <div class="driver-card-team-bar" style="background:${color}"></div>
          <div class="driver-card-body">
            <div class="driver-number">${d.permanentNumber || '—'}</div>
            <div class="driver-code">${d.code || d.driverId.toUpperCase().slice(0,3)}</div>
            <div class="driver-name">${d.givenName} ${d.familyName}</div>
            <div class="driver-team">${team.teamName || '—'}</div>
            <div class="driver-nat">${d.nationality}</div>
          </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.driver-card').forEach(card => {
      card.addEventListener('click', () => showDriverModal(card.dataset.id, card.dataset.season));
    });
  } catch (e) { console.error(e); }
  loader(false);
}

async function showDriverModal(driverId, season) {
  const c = seasonCache(season);
  const yr = seasonLabel(season);
  const d = c.drivers?.find(x => x.driverId === driverId);
  if (!d) return;
  const team = c.teamMap?.[driverId] || {};
  const color = teamColor(team.teamId);
  const initials = (d.givenName[0] || '') + (d.familyName[0] || '');
  const photo = driverPhoto(driverId);

  openModal(`
    <div class="driver-modal">
      ${photo
        ? `<img class="driver-modal-photo" src="${photo}" alt="${d.givenName} ${d.familyName}" onerror="this.outerHTML='<div class=\\'driver-modal-photo-placeholder\\'>${initials}</div>'">`
        : `<div class="driver-modal-photo-placeholder">${initials}</div>`}
      <div class="driver-modal-info">
        <div class="driver-modal-number" style="color:${color}">${d.permanentNumber || '—'}</div>
        <div class="driver-modal-name">${d.givenName} ${d.familyName}</div>
        <div class="driver-modal-team" style="color:${color}">${team.teamName || '—'}</div>
        <div class="driver-stats-grid">
          <div class="driver-stat"><div class="s-label">Nationality</div><div class="s-value" style="font-size:14px">${d.nationality}</div></div>
          <div class="driver-stat"><div class="s-label">Date of Birth</div><div class="s-value" style="font-size:14px">${d.dateOfBirth}</div></div>
          <div class="driver-stat" id="modal-stat-pts"><div class="s-label">${yr} Points</div><div class="s-value">—</div></div>
          <div class="driver-stat" id="modal-stat-wins"><div class="s-label">${yr} Wins</div><div class="s-value">—</div></div>
        </div>
        <div class="driver-season-results">
          <h4>${yr} Race Results</h4>
          <div id="modal-driver-results" style="color:var(--muted);font-size:13px">Loading...</div>
        </div>
        <a href="${d.url}" target="_blank" style="color:var(--red);font-size:13px;margin-top:12px;display:inline-block">Wikipedia →</a>
      </div>
    </div>`);

  try {
    const [ds, results] = await Promise.all([
      c.driverStandings || apiFetch(`/api/${season}/standings/drivers`).then(x => { c.driverStandings = x; return x; }),
      apiFetch(`/api/${season}/driver/${driverId}/results`),
    ]);

    const standing = ds?.DriverStandings?.find(s => s.Driver.driverId === driverId);
    if (standing) {
      document.getElementById('modal-stat-pts').innerHTML = `<div class="s-label">${yr} Points</div><div class="s-value">${standing.points}</div>`;
      document.getElementById('modal-stat-wins').innerHTML = `<div class="s-label">${yr} Wins</div><div class="s-value">${standing.wins}</div>`;
    }

    const el = document.getElementById('modal-driver-results');
    if (!el) return;
    if (results && results.length) {
      el.innerHTML = `
        <table class="race-result-table">
          <thead><tr><th>Round</th><th>Race</th><th>Pos</th><th>Points</th><th>Status</th></tr></thead>
          <tbody>
            ${results.map(r => {
              const res = r.Results?.[0];
              if (!res) return '';
              return `<tr>
                <td>${r.round}</td>
                <td>${r.raceName.replace(' Grand Prix','')}</td>
                <td class="${res.position==='1'?'pos-1':res.position==='2'?'pos-2':res.position==='3'?'pos-3':''}">${res.position}</td>
                <td>${res.points}</td>
                <td style="color:var(--muted)">${res.status}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
    } else {
      el.textContent = 'No results yet this season.';
    }
  } catch (e) {
    const el = document.getElementById('modal-driver-results');
    if (el) el.textContent = 'Could not load results.';
  }
}

// ---- CIRCUIT STATIC DATA ----
const CIRCUIT_INFO = {
  albert_park:   { length: '5.278 km', turns: 16, drs: 4, firstGP: 1996,  lapRecord: { time: '1:20.235', driver: 'Leclerc', year: 2022 } },
  americas:      { length: '5.513 km', turns: 20, drs: 2, firstGP: 2012,  lapRecord: { time: '1:36.169', driver: 'Hamilton', year: 2019 } },
  bahrain:       { length: '5.412 km', turns: 15, drs: 3, firstGP: 2004,  lapRecord: { time: '1:31.447', driver: 'De la Rosa', year: 2005 } },
  baku:          { length: '6.003 km', turns: 20, drs: 2, firstGP: 2017,  lapRecord: { time: '1:43.009', driver: 'Leclerc', year: 2019 } },
  catalunya:     { length: '4.657 km', turns: 14, drs: 2, firstGP: 1991,  lapRecord: { time: '1:18.149', driver: 'Verstappen', year: 2021 } },
  hungaroring:   { length: '4.381 km', turns: 14, drs: 2, firstGP: 1986,  lapRecord: { time: '1:16.627', driver: 'Hamilton', year: 2020 } },
  interlagos:    { length: '4.309 km', turns: 15, drs: 2, firstGP: 1973,  lapRecord: { time: '1:10.540', driver: 'Bottas', year: 2018 } },
  jeddah:        { length: '6.174 km', turns: 27, drs: 3, firstGP: 2021,  lapRecord: { time: '1:30.734', driver: 'Leclerc', year: 2022 } },
  losail:        { length: '5.380 km', turns: 16, drs: 2, firstGP: 2021,  lapRecord: { time: '1:24.319', driver: 'Verstappen', year: 2023 } },
  marina_bay:    { length: '4.940 km', turns: 19, drs: 3, firstGP: 2008,  lapRecord: { time: '1:35.867', driver: 'Leclerc', year: 2023 } },
  miami:         { length: '5.412 km', turns: 19, drs: 3, firstGP: 2022,  lapRecord: { time: '1:29.708', driver: 'Verstappen', year: 2023 } },
  monaco:        { length: '3.337 km', turns: 19, drs: 1, firstGP: 1950,  lapRecord: { time: '1:12.909', driver: 'Leclerc', year: 2021 } },
  monza:         { length: '5.793 km', turns: 11, drs: 2, firstGP: 1950,  lapRecord: { time: '1:21.046', driver: 'Barrichello', year: 2004 } },
  red_bull_ring: { length: '4.318 km', turns: 10, drs: 3, firstGP: 1970,  lapRecord: { time: '1:05.619', driver: 'Leclerc', year: 2020 } },
  silverstone:   { length: '5.891 km', turns: 18, drs: 2, firstGP: 1950,  lapRecord: { time: '1:27.097', driver: 'Hamilton', year: 2020 } },
  spa:           { length: '7.004 km', turns: 19, drs: 2, firstGP: 1950,  lapRecord: { time: '1:46.286', driver: 'Bottas', year: 2018 } },
  suzuka:        { length: '5.807 km', turns: 18, drs: 2, firstGP: 1987,  lapRecord: { time: '1:30.983', driver: 'Hamilton', year: 2019 } },
  villeneuve:    { length: '4.361 km', turns: 14, drs: 3, firstGP: 1978,  lapRecord: { time: '1:13.078', driver: 'Bottas', year: 2019 } },
  yas_marina:    { length: '5.281 km', turns: 16, drs: 2, firstGP: 2009,  lapRecord: { time: '1:26.103', driver: 'Leclerc', year: 2021 } },
  zandvoort:     { length: '4.259 km', turns: 14, drs: 2, firstGP: 1952,  lapRecord: { time: '1:11.097', driver: 'Hamilton', year: 2021 } },
  imola:         { length: '4.909 km', turns: 19, drs: 2, firstGP: 1980,  lapRecord: { time: '1:15.484', driver: 'Hamilton', year: 2020 } },
  shanghai:      { length: '5.451 km', turns: 16, drs: 3, firstGP: 2004,  lapRecord: { time: '1:32.238', driver: 'Leclerc', year: 2024 } },
  las_vegas:     { length: '6.201 km', turns: 17, drs: 2, firstGP: 2023,  lapRecord: { time: '1:35.490', driver: 'Sainz', year: 2023 } },
  vegas:         { length: '6.201 km', turns: 17, drs: 2, firstGP: 2023,  lapRecord: { time: '1:35.490', driver: 'Sainz', year: 2023 } },
  mexico_city:   { length: '4.304 km', turns: 17, drs: 3, firstGP: 1963,  lapRecord: { time: '1:17.774', driver: 'Bottas', year: 2021 } },
  rodriguez:     { length: '4.304 km', turns: 17, drs: 3, firstGP: 1963,  lapRecord: { time: '1:17.774', driver: 'Bottas', year: 2021 } },
};

function circuitInfo(id) {
  return CIRCUIT_INFO[id] || null;
}

// ---- TEAMS ----
const TEAMS = [
  {
    id: 'mclaren', name: 'McLaren', fullName: 'McLaren Formula 1 Team',
    base: 'Woking, United Kingdom', principal: 'Andrea Stella',
    chassis: 'MCL39', engine: 'Mercedes', drivers: ['norris', 'piastri'],
    color: '#FF8000',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren.png',
    principalPhoto: null,
    principalBio: 'Andrea Stella joined McLaren in 2015 as Performance Director after 13 years at Ferrari. Appointed Team Principal in 2023, he led McLaren to their first Constructors\' Championship since 1998 in 2024, transforming the team into a championship-winning outfit.',
  },
  {
    id: 'ferrari', name: 'Ferrari', fullName: 'Scuderia Ferrari HP',
    base: 'Maranello, Italy', principal: 'Frédéric Vasseur',
    chassis: 'SF-26', engine: 'Ferrari', drivers: ['leclerc', 'hamilton'],
    color: '#E8002D',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari.png',
    principalPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/MJXKPW_240117_SF_F1_FVasseur_Red_PR_AN_076161-1920x0_YRHUGH_%28close-up%29.jpg/330px-MJXKPW_240117_SF_F1_FVasseur_Red_PR_AN_076161-1920x0_YRHUGH_%28close-up%29.jpg',
    principalBio: 'Frédéric Vasseur took charge of Scuderia Ferrari in January 2023. A veteran team boss with stints at Renault, Lotus and Alfa Romeo, he is known for his driver development eye — having nurtured Charles Leclerc and Kimi Räikkönen earlier in their careers.',
  },
  {
    id: 'red_bull', name: 'Red Bull Racing', fullName: 'Oracle Red Bull Racing',
    base: 'Milton Keynes, United Kingdom', principal: 'Christian Horner',
    chassis: 'RB21', engine: 'Ford RBPT', drivers: ['max_verstappen', 'hadjar'],
    color: '#3671C6',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing.png',
    principalPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Horner_at_F1_Live_in_London_02.jpg/330px-Horner_at_F1_Live_in_London_02.jpg',
    principalBio: 'Christian Horner has led Red Bull Racing since its formation in 2005, becoming the most successful team principal of the modern era. Under his leadership the team won four consecutive Constructors\' Championships from 2010–2013 and again in 2022–2023.',
  },
  {
    id: 'mercedes', name: 'Mercedes', fullName: 'Mercedes-AMG PETRONAS F1 Team',
    base: 'Brackley, United Kingdom', principal: 'Toto Wolff',
    chassis: 'W16', engine: 'Mercedes', drivers: ['russell', 'antonelli'],
    color: '#27F4D2',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes.png',
    principalPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Toto_Wolff_2022_%2852474843183%29_%28cropped%29.jpg/330px-Toto_Wolff_2022_%2852474843183%29_%28cropped%29.jpg',
    principalBio: 'Toto Wolff joined Mercedes as Team Principal and CEO in 2013. He oversaw an unprecedented run of eight consecutive Constructors\' Championships from 2014 to 2021, cementing Mercedes as the dominant force of the hybrid era.',
  },
  {
    id: 'aston_martin', name: 'Aston Martin', fullName: 'Aston Martin Aramco F1 Team',
    base: 'Silverstone, United Kingdom', principal: 'Andy Cowell',
    chassis: 'AMR26', engine: 'Honda', drivers: ['alonso', 'stroll'],
    color: '#229971',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin.png',
    principalPhoto: null,
    principalBio: 'Andy Cowell became Aston Martin Team Principal in 2024, bringing deep engineering expertise from his time as Managing Director of Mercedes-AMG High Performance Powertrains, where he oversaw the development of the dominant V6 hybrid engine.',
  },
  {
    id: 'alpine', name: 'Alpine', fullName: 'BWT Alpine F1 Team',
    base: 'Enstone, United Kingdom', principal: 'Oliver Oakes',
    chassis: 'A525', engine: 'Renault', drivers: ['gasly', 'colapinto'],
    color: '#FF87BC',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/alpine-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/alpine.png',
    principalPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Oliver_Oakes_2007_FRenault_Eurocup.jpg/330px-Oliver_Oakes_2007_FRenault_Eurocup.jpg',
    principalBio: 'Oliver Oakes became Alpine\'s Team Principal in 2024 at just 37, making him one of the youngest team bosses in F1 history. He previously founded and ran Hitech Grand Prix, a successful junior formula team.',
  },
  {
    id: 'haas', name: 'Haas', fullName: 'MoneyGram Haas F1 Team',
    base: 'Kannapolis, United States', principal: 'Ayao Komatsu',
    chassis: 'VF-25', engine: 'Ferrari', drivers: ['ocon', 'bearman'],
    color: '#B6BABD',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/haas-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/haas.png',
    principalPhoto: null,
    principalBio: 'Ayao Komatsu was appointed Haas Team Principal in 2024 after serving as Chief Engineer. A Japanese engineer who joined the team at its inception in 2016, he is known for his technical precision and calm leadership style.',
  },
  {
    id: 'rb', name: 'Racing Bulls', fullName: 'Visa Cash App Racing Bulls F1 Team',
    base: 'Faenza, Italy', principal: 'Laurent Mekies',
    chassis: 'VCARB 02', engine: 'Honda', drivers: ['lawson', 'arvid_lindblad'],
    color: '#6692FF',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/rb-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/racing-bulls.png',
    principalPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Laurent_Mekies_%2854917242735%29_%28cropped%29.jpg/330px-Laurent_Mekies_%2854917242735%29_%28cropped%29.jpg',
    principalBio: 'Laurent Mekies joined Racing Bulls as Team Principal in 2023 after a decade at Ferrari, where he served as Sporting Director. A French engineer by training, he brings strong technical and strategic experience to the Red Bull junior team.',
  },
  {
    id: 'williams', name: 'Williams', fullName: 'Williams Racing',
    base: 'Grove, United Kingdom', principal: 'James Vowles',
    chassis: 'FW47', engine: 'Mercedes', drivers: ['sainz', 'albon'],
    color: '#64C4FF',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/williams-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/williams.png',
    principalPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/James_Vowles_at_Goodwood_FOS.png/330px-James_Vowles_at_Goodwood_FOS.png',
    principalBio: 'James Vowles joined Williams as Team Principal in 2023 after 20 years at Mercedes, where he was Chief Strategist. He is leading a full rebuild of the historic team, modernising its infrastructure and culture.',
  },
  {
    id: 'kick_sauber', name: 'Audi', fullName: 'Audi F1 Team',
    base: 'Hinwil, Switzerland', principal: 'Mattia Binotto',
    chassis: 'C45', engine: 'Audi', drivers: ['hulkenberg', 'bortoleto'],
    color: '#52E252',
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2025/kick-sauber-logo.png',
    car:  'https://media.formula1.com/content/dam/fom-website/teams/2025/kick-sauber.png',
    principalPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Mattia_Binotto%2C_2022_%28cropped%29.jpg/330px-Mattia_Binotto%2C_2022_%28cropped%29.jpg',
    principalBio: 'Mattia Binotto leads the Audi F1 project after serving as Ferrari Team Principal from 2019–2022. An engineer by background, he oversaw Ferrari\'s technical renaissance and now heads Audi\'s ambitious works entry into Formula 1.',
  },
];

async function loadTeams() {
  const grid = document.getElementById('teams-grid');
  if (grid.children.length && !grid.querySelector('.skel-card')) return;
  loader(true);
  const s = activeSeason;
  try {
    // Get current standings to show constructor points
    const c = seasonCache(s);
    const cs = c.constructorStandings || await apiFetch(`/api/${s}/standings/constructors`).then(d => { c.constructorStandings = d; return d; });
    const pointsMap = {};
    cs?.ConstructorStandings?.forEach(st => { pointsMap[st.Constructor.constructorId] = { points: st.points, position: st.position, wins: st.wins }; });

    document.getElementById('teams-grid').innerHTML = TEAMS.map(team => {
      const standing = pointsMap[team.id] || {};
      const driverNames = team.drivers.map(id => {
        const photo = driverPhoto(id);
        const initials = id.replace(/_/g,' ').split(' ').map(x=>x[0]?.toUpperCase()||'').join('');
        return `<div class="team-driver-chip">
          <div class="team-driver-avatar" style="border-color:${team.color}">
            ${photo ? `<img src="${photo}" alt="${id}" onerror="this.outerHTML='<span>${initials}</span>'">` : `<span>${initials}</span>`}
          </div>
        </div>`;
      }).join('');

      // Get driver full names from DRIVER_PHOTOS keys mapping
      const driverLabels = team.drivers.map(id => {
        const nameMap = {
          'max_verstappen':'Max Verstappen','norris':'Lando Norris','leclerc':'Charles Leclerc',
          'piastri':'Oscar Piastri','sainz':'Carlos Sainz','hamilton':'Lewis Hamilton',
          'russell':'George Russell','perez':'Sergio Pérez','alonso':'Fernando Alonso',
          'stroll':'Lance Stroll','gasly':'Pierre Gasly','ocon':'Esteban Ocon',
          'albon':'Alexander Albon','tsunoda':'Yuki Tsunoda','bottas':'Valtteri Bottas',
          'zhou':'Guanyu Zhou','magnussen':'Kevin Magnussen','hulkenberg':'Nico Hülkenberg',
          'lawson':'Liam Lawson','colapinto':'Franco Colapinto','bearman':'Oliver Bearman',
          'antonelli':'Kimi Antonelli','hadjar':'Isack Hadjar','doohan':'Jack Doohan',
          'bortoleto':'Gabriel Bortoleto','arvid_lindblad':'Arvid Lindblad',
        };
        return nameMap[id] || id;
      });

      return `
        <div class="team-card" data-id="${team.id}" style="--team-color:${team.color}">
          <div class="team-card-car">
            <img src="${team.car}" alt="${team.name} car"
              onerror="this.closest('.team-card-car').classList.add('no-car')" />
            ${standing.position ? `<span class="team-card-pos">P${standing.position}</span>` : ''}
            ${standing.points ? `<span class="team-card-pts">${standing.points} pts</span>` : ''}
          </div>
          <div class="team-card-foot">
            <img class="team-card-logo" src="${team.logo}" alt="${team.name}" onerror="this.style.display=&quot;none&quot;" />
            <div class="team-card-foot-info">
              <div class="team-card-name">${team.name}</div>
              <div class="team-card-hint">Tap to explore →</div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Wire clicks
    document.querySelectorAll('.team-card').forEach(card => {
      card.addEventListener('click', () => {
        const team = TEAMS.find(t => t.id === card.dataset.id);
        if (team) showTeamModal(team);
      });
    });
  } catch(e) { console.error(e); }
  loader(false);
}

function showTeamModal(team) {
  const driverNameMap = {
    'max_verstappen':'Max Verstappen','norris':'Lando Norris','leclerc':'Charles Leclerc',
    'piastri':'Oscar Piastri','sainz':'Carlos Sainz','hamilton':'Lewis Hamilton',
    'russell':'George Russell','perez':'Sergio Pérez','alonso':'Fernando Alonso',
    'stroll':'Lance Stroll','gasly':'Pierre Gasly','ocon':'Esteban Ocon',
    'albon':'Alexander Albon','lawson':'Liam Lawson','colapinto':'Franco Colapinto',
    'bearman':'Oliver Bearman','antonelli':'Kimi Antonelli','hadjar':'Isack Hadjar',
    'doohan':'Jack Doohan','bortoleto':'Gabriel Bortoleto','arvid_lindblad':'Arvid Lindblad',
    'hulkenberg':'Nico Hülkenberg','bottas':'Valtteri Bottas',
  };

  const driversHtml = team.drivers.map(id => {
    const name = driverNameMap[id] || id;
    return `
      <div class="team-modal-driver" style="border-color:${team.color}">
        <div class="team-modal-driver-name" style="color:${team.color}">${name}</div>
      </div>`;
  }).join('');

  openModal(`
    <div class="team-modal">
      <div class="team-modal-header" style="border-color:${team.color}">
        <img class="team-modal-logo" src="${team.logo}" alt="${team.name}" onerror="this.style.display=&quot;none&quot;" />
        <div>
          <div class="team-modal-name" style="color:${team.color}">${team.name}</div>
          <div class="team-modal-fullname">${team.fullName}</div>
        </div>
      </div>

      <div class="team-modal-car-wrap">
        <img src="${team.car}" alt="${team.name} car" onerror="this.closest('.team-modal-car-wrap').style.display='none'" />
      </div>

      <div class="team-modal-section-label">Drivers</div>
      <div class="team-modal-drivers">${driversHtml}</div>

      <div class="team-modal-section-label">Team Principal</div>
      <div class="team-modal-principal">
        <div class="team-modal-principal-photo">
          ${team.principalPhoto
            ? `<img src="${team.principalPhoto}" alt="${team.principal}" onerror="this.outerHTML='<div class=\\'tmp-initials\\'>${team.principal.split(' ').map(x=>x[0]).join('')}</div>'">`
            : `<div class="tmp-initials">${team.principal.split(' ').map(x=>x[0]).join('')}</div>`}
        </div>
        <div class="team-modal-principal-info">
          <div class="team-modal-principal-name">${team.principal}</div>
          <div class="team-modal-principal-bio">${team.principalBio}</div>
        </div>
      </div>

      <div class="team-modal-section-label">Technical</div>
      <div class="team-modal-tech-grid">
        <div class="team-meta-item"><span class="tm-label">Chassis</span><span class="tm-value">${team.chassis}</span></div>
        <div class="team-meta-item"><span class="tm-label">Engine</span><span class="tm-value">${team.engine}</span></div>
        <div class="team-meta-item"><span class="tm-label">Base</span><span class="tm-value">${team.base}</span></div>
        <div class="team-meta-item"><span class="tm-label">Founded</span><span class="tm-value">${team.fullName}</span></div>
      </div>
    </div>`);
}

// ---- CIRCUITS ----
async function loadCircuits() {
  const grid = document.getElementById('circuits-grid');
  if (grid.children.length && !grid.querySelector('.skel-card')) return;
  loader(true);
  const s = activeSeason;
  try {
    const c = seasonCache(s);
    const circuits = c.circuits || await apiFetch(`/api/${s}/circuits`).then(d => { c.circuits = d; return d; });

    document.getElementById('circuits-grid').innerHTML = circuits.map(circ => {
      const info = circuitInfo(circ.circuitId);
      return `
        <div class="circuit-card" data-id="${circ.circuitId}">
          <div class="circuit-card-map">
            <img src="/api/circuit-svg/${circ.circuitId}" alt="${circ.circuitName}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
              loading="lazy" />
            <div class="circuit-svg-fallback" style="display:none">${circ.circuitName.replace('Grand Prix Circuit','').replace('Street Circuit','').replace('International Circuit','').trim()}</div>
            <span class="circuit-country-badge">${circ.Location.country}</span>
          </div>
          <div class="circuit-card-body">
            <div class="circuit-name">${circ.circuitName}</div>
            <div class="circuit-location">${circ.Location.locality}, ${circ.Location.country}</div>
            ${info ? `
            <div class="circuit-quick-stats">
              <span><span class="cqs-label">Length</span>${info.length}</span>
              <span><span class="cqs-label">Turns</span>${info.turns}</span>
              <span><span class="cqs-label">DRS</span>${info.drs}</span>
              <span><span class="cqs-label">First GP</span>${info.firstGP}</span>
            </div>` : ''}
          </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.circuit-card').forEach(card => {
      card.addEventListener('click', () => {
        const circ = c.circuits.find(x => x.circuitId === card.dataset.id);
        if (circ) showCircuitModal(circ, s);
      });
    });
  } catch (e) { console.error(e); }
  loader(false);
}

async function showCircuitModal(circ, season) {
  const info = circuitInfo(circ.circuitId);

  openModal(`
    <div class="circuit-modal">
      <div class="circuit-modal-svg">
        <img src="/api/circuit-svg/${circ.circuitId}" alt="${circ.circuitName}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="circuit-svg-fallback" style="display:none">${circ.circuitName}</div>
      </div>
      <div class="circuit-modal-header">
        <div class="circuit-modal-name">${circ.circuitName}</div>
        <div class="circuit-modal-location">${circ.Location.locality}, ${circ.Location.country}</div>
      </div>
      ${info ? `
      <div class="circuit-overview-grid">
        <div class="circuit-overview-stat">
          <div class="cos-label">Track Length</div>
          <div class="cos-value">${info.length}</div>
        </div>
        <div class="circuit-overview-stat">
          <div class="cos-label">Turns</div>
          <div class="cos-value">${info.turns}</div>
        </div>
        <div class="circuit-overview-stat">
          <div class="cos-label">DRS Zones</div>
          <div class="cos-value">${info.drs}</div>
        </div>
        <div class="circuit-overview-stat">
          <div class="cos-label">First Grand Prix</div>
          <div class="cos-value">${info.firstGP}</div>
        </div>
        <div class="circuit-overview-stat" style="grid-column:span 2">
          <div class="cos-label">Lap Record</div>
          <div class="cos-value">${info.lapRecord.time} <span style="font-size:13px;color:var(--muted);font-weight:400">— ${info.lapRecord.driver}, ${info.lapRecord.year}</span></div>
        </div>
      </div>` : ''}
      <div class="circuit-champions-section">
        <div class="circuit-champions-title">Last 3 Champions at this Circuit</div>
        <div id="circuit-champions" class="circuit-champions-list">
          <div class="circuit-champ-loading">Loading...</div>
        </div>
      </div>
      <a href="${circ.url}" target="_blank" style="color:var(--red);font-size:13px;margin-top:16px;display:inline-block">Wikipedia →</a>
    </div>`);

  // Include current year if this circuit's race has already happened this season
  const currentYear = new Date().getFullYear();
  const cachedRaces = seasonCache('current').races || [];
  const thisCircuitRace = cachedRaces.find(r => r.Circuit.circuitId === circ.circuitId);
  const raceAlreadyDone = thisCircuitRace && isDatePast(thisCircuitRace.date);
  const years = raceAlreadyDone
    ? [currentYear,     currentYear - 1, currentYear - 2]
    : [currentYear - 1, currentYear - 2, currentYear - 3];

  try {
    const results = await Promise.all(
      years.map(yr => apiFetch(`/api/${yr}/circuits/${circ.circuitId}/results`).catch(() => null))
    );

    const el = document.getElementById('circuit-champions');
    if (!el) return;

    const validResults = results.map((data, i) => ({ year: years[i], data })).filter(x => x.data && x.data.Results);

    if (!validResults.length) {
      el.innerHTML = `<div style="color:var(--muted);font-size:13px">No historical data available.</div>`;
      return;
    }

    el.innerHTML = validResults.map(({ year, data }) => {
      const winner = data.Results[0];
      const photo = driverPhoto(winner.Driver.driverId);
      const initials = (winner.Driver.givenName[0] || '') + (winner.Driver.familyName[0] || '');
      const teamId = winner.Constructor.constructorId;
      const color = teamColor(teamId);
      return `
        <div class="circuit-champ-card">
          <div class="circuit-champ-year">${year}</div>
          <div class="circuit-champ-photo-wrap" style="border-color:${color}">
            ${photo
              ? `<img src="${photo}" alt="${winner.Driver.givenName}" onerror="this.outerHTML='<div class=\\'circuit-champ-initials\\'>${initials}</div>'">`
              : `<div class="circuit-champ-initials">${initials}</div>`}
          </div>
          <div class="circuit-champ-name">${winner.Driver.givenName}<br><strong>${winner.Driver.familyName}</strong></div>
          <div class="circuit-champ-team" style="color:${color}">${winner.Constructor.name}</div>
          ${winner.Time ? `<div class="circuit-champ-time">${winner.Time.time}</div>` : ''}
        </div>`;
    }).join('');
  } catch (e) {
    const el = document.getElementById('circuit-champions');
    if (el) el.innerHTML = `<div style="color:var(--muted);font-size:13px">Could not load data.</div>`;
  }
}

// ---- HIGHLIGHTS ----
async function loadHighlights() {
  const grid = document.getElementById('highlights-grid');
  if (grid.children.length && !grid.querySelector('.skel-card')) return;

  const s = activeSeason;
  const yr = seasonLabel(s);
  document.getElementById('highlights-title').textContent = `${yr} Race Highlights`;

  try {
    const c = seasonCache(s);
    const races = c.races || await apiFetch(`/api/${s}/races`).then(d => { c.races = d; return d; });

    // For current season show only past races; for historical seasons show all
    const isCurrent = s === 'current' || String(yr) === String(currentSeasonYear);
    const visibleRaces = isCurrent ? races.filter(r => isDatePast(r.date)) : races;

    if (!visibleRaces.length) {
      grid.innerHTML = `<p style="color:var(--muted);font-size:14px">No races completed yet this season.</p>`;
      return;
    }

    grid.innerHTML = visibleRaces.map(r => {
      const query = encodeURIComponent(`F1 ${yr} ${r.raceName} Race Highlights`);
      const ytSearch = `https://www.youtube.com/results?search_query=${query}`;
      const country = r.Circuit.Location.country;
      const color = `hsl(${(r.round * 47) % 360}, 60%, 18%)`;

      return `
        <a class="highlight-card" href="${ytSearch}" target="_blank" rel="noopener">
          <div class="highlight-thumb">
            <div class="highlight-thumb-bg" style="background:linear-gradient(135deg,${color},#111)">
              <div class="highlight-thumb-inner">
                <div class="highlight-thumb-flag">${country}</div>
                <div class="highlight-thumb-round">R${r.round}</div>
              </div>
            </div>
            <div class="highlight-play">
              <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span class="highlight-yt-badge">YouTube ↗</span>
          </div>
          <div class="highlight-body">
            <div class="highlight-round">Round ${r.round} · ${yr}</div>
            <div class="highlight-name">${r.raceName}</div>
            <div class="highlight-date">${formatDate(r.date)} · ${country}</div>
          </div>
        </a>`;
    }).join('');
  } catch(e) {
    document.getElementById('highlights-grid').innerHTML =
      `<p style="color:var(--muted);font-size:14px">Could not load highlights.</p>`;
  }
}

// ---- MERCH ----
const W = 'https://upload.wikimedia.org/wikipedia/commons/';
const F1CDN = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/';

const MERCH_PRODUCTS = [
  // ---- TEAM STORES (official F1 CDN high-res PNGs) ----
  { section:'teams', team:'McLaren',       teamColor:'#FF8000',
    name:'McLaren Official Store',         price:'From £25',
    img:'https://upload.wikimedia.org/wikipedia/commons/b/bb/Mclaren_Logo_2021.svg',
    url:'https://store.mclaren.com/en/formula1/team/' },
  { section:'teams', team:'Ferrari',       teamColor:'#E8002D',
    name:'Scuderia Ferrari Official Store', price:'From €30',
    img:'https://upload.wikimedia.org/wikipedia/en/d/df/Scuderia_Ferrari_HP_logo_24.svg',
    url:'https://f1store4.formula1.com/en/scuderia-ferrari/t-76758670+z-71034-984427031' },
  { section:'teams', team:'Red Bull Racing', teamColor:'#3671C6',
    name:'Red Bull Racing Official Store', price:'From €30',
    img:'https://upload.wikimedia.org/wikipedia/commons/6/62/RED_BULL_LOGO_2026.svg',
    url:'https://www.redbullshopus.com/collections/oracle-red-bull-racing' },
  { section:'teams', team:'Mercedes-AMG',  teamColor:'#27F4D2',
    name:'Mercedes-AMG Official Store',    price:'From £25',
    img:'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg',
    url:'https://shop-int.mercedesamgf1.com/' },
  { section:'teams', team:'Aston Martin',  teamColor:'#229971',
    name:'Aston Martin Official Store',    price:'From £25',
    img:'https://upload.wikimedia.org/wikipedia/commons/0/03/Aston_Martin_F1_Team_logo_2024.jpg',
    url:'https://shop.astonmartinf1.com' },
  { section:'teams', team:'Alpine',        teamColor:'#FF87BC',
    name:'Alpine Official Store',          price:'From €25',
    img:'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg',
    url:'https://f1store.formula1.com/en/bwt-alpine-f1-team' },
  { section:'teams', team:'Williams',      teamColor:'#64C4FF',
    name:'Williams Racing Official Store', price:'From £25',
    img:'https://upload.wikimedia.org/wikipedia/commons/7/7d/Williams_F1_logo_2026.png',
    url:'https://store.williamsf1.com' },
  { section:'teams', team:'Haas',          teamColor:'#B6BABD',
    name:'Haas Official Store',            price:'From $25',
    img:'https://upload.wikimedia.org/wikipedia/commons/1/18/TGR_Haas_F1_Team_Logo_%282026%29.svg',
    url:'https://www.tricorp.com/over-tricorp/sponsoring/tricorp-official-partner-moneygram-haas-f1-team' },
  { section:'teams', team:'Racing Bulls',  teamColor:'#6692FF',
    name:'Racing Bulls Official Store',    price:'From €25',
    img:'https://upload.wikimedia.org/wikipedia/en/2/2b/VCARB_F1_logo.svg',
    url:'https://www.redbullshopus.com/collections/visa-cash-app-racing-bulls' },
  { section:'teams', team:'Audi / Sauber', teamColor:'#52E252',
    name:'Kick Sauber Official Store',     price:'From €25',
    img:'https://upload.wikimedia.org/wikipedia/commons/e/e4/Logo_of_Stake_F1_Team_Kick_Sauber.png',
    url:'https://www.audirichmond.com/en/f1-merchandise/' },

  // ---- LEGACY ----
  { section:'legacy', team:'Legend', teamColor:'#e10600',
    name:'Ayrton Senna — Official Collection',
    img: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Ayrton_Senna_8_%28cropped%29.jpg',
    url:'https://f1store.formula1.com/en/ayrton-senna' },
  { section:'legacy', team:'Legend', teamColor:'#e10600',
    name:'Michael Schumacher — Official Collection',
    img: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Michael_Schumacher_Ferrari_2004.jpg',
    url:'https://f1store.formula1.com/en/michael-schumacher' },

  // ---- LEGO Speed Champions 2025 F1 Collection ----
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Ferrari SF-24 Speed Champions #77242', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77242-1.jpg',
    url:'https://www.lego.com/en-in/product/ferrari-sf-24-f1-race-car-77242' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Red Bull RB20 Speed Champions #77243', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77243-1.jpg',
    url:'https://www.lego.com/en-in/product/oracle-red-bull-racing-rb20-f1-race-car-77243' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Mercedes W15 Speed Champions #77244', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77244-1.jpg',
    url:'https://www.lego.com/en-in/product/mercedes-amg-f1-w15-race-car-77244' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Aston Martin AMR24 Speed Champions #77245', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77245-1.jpg',
    url:'https://www.lego.com/en-in/themes/speed-champions' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Racing Bulls VCARB Speed Champions #77246', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77246-1.jpg',
    url:'https://www.lego.com/en-in/themes/speed-champions' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Kick Sauber C44 Speed Champions #77247', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77247-1.jpg',
    url:'https://www.lego.com/en-in/themes/speed-champions' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Alpine A524 Speed Champions #77248', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77248-1.jpg',
    url:'https://www.lego.com/en-in/themes/speed-champions' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Williams FW46 Speed Champions #77249', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77249-1.jpg',
    url:'https://www.lego.com/en-in/themes/speed-champions' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Haas VF-24 Speed Champions #77250', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77250-1.jpg',
    url:'https://www.lego.com/en-in/themes/speed-champions' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'McLaren MCL38 Speed Champions #77251', price:'₹2,799',
    img:'https://images.brickset.com/sets/images/77251-1.jpg',
    url:'https://www.lego.com/en-in/product/mclaren-f1-team-mcl38-race-car-77251' },
  { section:'lego', team:'LEGO', teamColor:'#FFD700',
    name:'Red Bull RB20 Technic #42206', price:'₹14,999',
    img:'https://images.brickset.com/sets/images/42206-1.jpg',
    url:'https://www.lego.com/en-in/product/oracle-red-bull-racing-rb20-f1-car-42206' },
];

function loadMerch() {
  const grid = document.getElementById('merch-grid');
  if (grid.children.length && !grid.querySelector('.skel-card')) return;

  const makeCard = (p, imgClass = '') => {
    const initials = p.team.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
    return `
      <a class="merch-product-card merch-card--${p.section}" href="${p.url}" target="_blank" rel="noopener" style="--team-color:${p.teamColor}">
        <div class="merch-product-img-wrap${imgClass ? ' ' + imgClass : ''}" style="border-bottom:2px solid ${p.teamColor}33">
          <img src="${p.img}" alt="${p.name}" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
          <div class="merch-product-img-fallback" style="background:${p.teamColor}18;color:${p.teamColor}">
            <span>${initials}</span>
          </div>
        </div>
        <div class="merch-product-body">
          <div class="merch-product-team-badge" style="color:${p.teamColor};border-color:${p.teamColor}44">${p.team}</div>
          <div class="merch-product-name">${p.name}</div>
          <div class="merch-product-footer">
            ${p.price ? `<span class="merch-product-price">${p.price}</span>` : '<span></span>'}
            <span class="merch-product-cta">Shop →</span>
          </div>
        </div>
      </a>`;
  };

  grid.innerHTML = `
    <div class="merch-section-title">Team Stores</div>
    ${MERCH_PRODUCTS.filter(p=>p.section==='teams').map(p=>makeCard(p)).join('')}
    <div class="merch-section-title">Legends</div>
    ${MERCH_PRODUCTS.filter(p=>p.section==='legacy').map(p=>makeCard(p, 'merch-img-portrait')).join('')}
    <div class="merch-section-title">LEGO Speed Champions — All 10 Teams + Technic</div>
    ${MERCH_PRODUCTS.filter(p=>p.section==='lego').map(p=>makeCard(p, 'merch-img-lego')).join('')}
  `;
}

// ---- Init ----
initSeasons();

// ---- COMPARE ----
let cmpDriverA = null, cmpDriverB = null;
let cmpAllDrivers = [];
let cmpInited = false;
const CMP_CDN = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/';

async function initCompare() {
  if (cmpInited) return;
  cmpInited = true;

  const pillsContainer = document.getElementById('cmp-season-pills');
  const yr = currentSeasonYear || new Date().getFullYear();
  let cmpActiveSeason = 'current';

  // Build season pills — current year down to 2022
  const seasons = [];
  for (let y = yr; y >= 2022; y--) seasons.push(y);
  pillsContainer.innerHTML = seasons.map(y =>
    `<button class="season-pill${y === yr ? ' active' : ''}" data-season="${y === yr ? 'current' : y}">${String(y).slice(2)}</button>`
  ).join('');

  pillsContainer.querySelectorAll('.season-pill').forEach(pill => {
    pill.addEventListener('click', async () => {
      pillsContainer.querySelectorAll('.season-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      cmpActiveSeason = pill.dataset.season;
      cmpDriverA = null; cmpDriverB = null;
      cmpSetChip('a', null); cmpSetChip('b', null);
      document.getElementById('cmp-search-a').value = '';
      document.getElementById('cmp-search-b').value = '';
      document.getElementById('cmp-drop-a').innerHTML = '';
      document.getElementById('cmp-drop-b').innerHTML = '';
      document.getElementById('compare-results').classList.add('hidden');
      document.getElementById('compare-empty').style.display = '';
      await cmpLoadDriverList(cmpActiveSeason);
    });
  });

  // Expose getter for runCompare
  window._cmpGetSeason = () => cmpActiveSeason;

  setupCmpSearch('a');
  setupCmpSearch('b');
  document.getElementById('cmp-run').addEventListener('click', runCompare);
}

async function cmpLoadDriverList(season) {
  try {
    const drivers = await apiFetch('/api/' + season + '/drivers');
    cmpAllDrivers = drivers.map(d => ({
      id: d.driverId,
      name: d.givenName + ' ' + d.familyName,
      code: d.code || d.driverId.slice(0,3).toUpperCase(),
      number: d.permanentNumber || '',
      img: CMP_CDN + d.driverId.charAt(0).toUpperCase() + '/' + d.driverId + '_2025/' + (d.code || d.driverId.slice(0,3).toUpperCase()) + '01_2025.png',
    }));
  } catch(e) { cmpAllDrivers = []; }
}

function cmpSetChip(slot, driver) {
  const chip = document.getElementById('cmp-selected-' + slot);
  if (!driver) {
    chip.innerHTML = '<span class="compare-selected-empty">Not selected</span>';
    return;
  }
  chip.innerHTML =
    '<img src="' + driver.img + '" alt="' + driver.name + '" onerror="this.style.display=&quot;none&quot;" />' +
    '<span class="compare-selected-name">' + driver.name + '</span>' +
    '<span class="cmp-drop-code" style="margin-left:auto">' + driver.code + '</span>';
}

function setupCmpSearch(slot) {
  const input = document.getElementById('cmp-search-' + slot);
  const drop  = document.getElementById('cmp-drop-' + slot);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { drop.innerHTML = ''; drop.classList.remove('open'); return; }
    const matches = cmpAllDrivers.filter(d =>
      d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    ).slice(0, 8);
    if (!matches.length) { drop.innerHTML = ''; drop.classList.remove('open'); return; }
    drop.innerHTML = matches.map(d =>
      '<div class="cmp-drop-item" data-id="' + d.id + '" data-name="' + d.name + '" data-code="' + d.code + '" data-img="' + d.img + '">' +
        '<img class="cmp-drop-avatar" src="' + d.img + '" alt="' + d.name + '" onerror="this.style.display=&quot;none&quot;" />' +
        '<div class="cmp-drop-info">' +
          '<span class="cmp-drop-name">' + d.name + '</span>' +
          '<span class="cmp-drop-code">' + d.code + (d.number ? ' · #' + d.number : '') + '</span>' +
        '</div>' +
      '</div>'
    ).join('');
    drop.classList.add('open');
  });

  drop.addEventListener('click', e => {
    const item = e.target.closest('.cmp-drop-item');
    if (!item) return;
    const driver = { id: item.dataset.id, name: item.dataset.name, code: item.dataset.code, img: item.dataset.img };
    if (slot === 'a') cmpDriverA = driver; else cmpDriverB = driver;
    cmpSetChip(slot, driver);
    input.value = driver.name;
    drop.innerHTML = ''; drop.classList.remove('open');
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !drop.contains(e.target)) {
      drop.innerHTML = ''; drop.classList.remove('open');
    }
  });
}

async function runCompare() {
  if (!cmpDriverA || !cmpDriverB) { alert('Please select both drivers.'); return; }
  const season = window._cmpGetSeason ? window._cmpGetSeason() : (currentSeasonYear || new Date().getFullYear());
  const btn = document.getElementById('cmp-run');
  btn.textContent = 'Loading…'; btn.disabled = true;
  try {
    const [racesA, racesB] = await Promise.all([
      apiFetch('/api/' + season + '/driver/' + cmpDriverA.id + '/results'),
      apiFetch('/api/' + season + '/driver/' + cmpDriverB.id + '/results'),
    ]);
    renderCmpStats(racesA, racesB);
    renderCmpCharts(racesA, racesB);
    document.getElementById('compare-results').classList.remove('hidden');
    document.getElementById('compare-empty').style.display = 'none';
  } catch(e) {
    alert('Failed to load data: ' + e.message);
  } finally {
    btn.textContent = 'Compare'; btn.disabled = false;
  }
}

function cmpCalcStats(races) {
  let wins = 0, podiums = 0, points = 0, dnfs = 0, poles = 0, totalPos = 0, finishes = 0;
  races.forEach(race => {
    const r = race.Results && race.Results[0];
    if (!r) return;
    const pos = parseInt(r.position);
    points += parseFloat(r.points || 0);
    if (pos === 1) wins++;
    if (pos <= 3) podiums++;
    if (r.grid === '1') poles++;
    if (r.status && !r.status.startsWith('Finished') && isNaN(parseInt(r.status))) dnfs++;
    if (!isNaN(pos)) { totalPos += pos; finishes++; }
  });
  return { wins, podiums, points, dnfs, poles, avgPos: finishes ? (totalPos / finishes).toFixed(1) : '—', races: races.length };
}

function renderCmpStats(racesA, racesB) {
  const sA = cmpCalcStats(racesA), sB = cmpCalcStats(racesB);
  const colorA = '#e10600', colorB = '#27F4D2';
  const metrics = [
    { label: 'Points',     a: sA.points,  b: sB.points },
    { label: 'Wins',       a: sA.wins,    b: sB.wins },
    { label: 'Podiums',    a: sA.podiums, b: sB.podiums },
    { label: 'Poles',      a: sA.poles,   b: sB.poles },
    { label: 'DNFs',       a: sA.dnfs,    b: sB.dnfs,   lower: true },
    { label: 'Avg Finish', a: sA.avgPos,  b: sB.avgPos, lower: true },
    { label: 'Races',      a: sA.races,   b: sB.races,  neutral: true },
  ];

  const rows = metrics.map(m => {
    let clsA = '', clsB = '';
    const av = parseFloat(m.a), bv = parseFloat(m.b);
    if (!m.neutral && !isNaN(av) && !isNaN(bv) && av !== bv) {
      const aWins = m.lower ? av < bv : av > bv;
      clsA = aWins ? 'cmp-win' : 'cmp-lose';
      clsB = aWins ? 'cmp-lose' : 'cmp-win';
    }
    const maxVal = Math.max(av || 0, bv || 0) || 1;
    const wA = Math.round(((av || 0) / maxVal) * 100);
    const wB = Math.round(((bv || 0) / maxVal) * 100);
    const barA = clsA === 'cmp-win' ? colorA + '55' : colorA + '22';
    const barB = clsB === 'cmp-win' ? colorB + '55' : colorB + '22';
    return (
      '<div class="cmp-stat-row">' +
        '<div class="cmp-val-a ' + clsA + '">' + m.a + '</div>' +
        '<div class="cmp-row-label">' + m.label + '</div>' +
        '<div class="cmp-val-b ' + clsB + '">' + m.b + '</div>' +
      '</div>' +
      (!m.neutral ?
        '<div class="cmp-bar-row">' +
          '<div class="cmp-bar-a-wrap"><div class="cmp-bar" style="width:' + wA + '%;background:' + barA + ';border:1px solid ' + colorA + '44"></div></div>' +
          '<div class="cmp-bar-sep"></div>' +
          '<div class="cmp-bar-b-wrap"><div class="cmp-bar" style="width:' + wB + '%;background:' + barB + ';border:1px solid ' + colorB + '44"></div></div>' +
        '</div>' : '')
    );
  }).join('');

  document.getElementById('cmp-stats').innerHTML =
    '<div class="cmp-stats-head">' +
      '<div class="cmp-head-a" style="color:' + colorA + '">' + cmpDriverA.name + '</div>' +
      '<div class="cmp-head-mid">Stat</div>' +
      '<div class="cmp-head-b" style="color:' + colorB + '">' + cmpDriverB.name + '</div>' +
    '</div>' + rows;
}

function renderCmpCharts(racesA, racesB) {
  const colorA = '#e10600', colorB = '#27F4D2';
  const allRaces = {};
  racesA.concat(racesB).forEach(r => {
    allRaces[r.round] = (r.raceName || 'R' + r.round).replace(' Grand Prix','').replace(' Prix','');
  });
  const rounds = Object.keys(allRaces).sort((a,b) => parseInt(a)-parseInt(b));
  const labels = rounds.map(r => allRaces[r]);

  const mapPoints = function(races) {
    const m = {};
    races.forEach(r => { m[r.round] = parseFloat((r.Results && r.Results[0] && r.Results[0].points) || 0); });
    let cum = 0;
    return rounds.map(r => { cum += (m[r] || 0); return cum; });
  };
  const mapPos = function(races) {
    const m = {};
    races.forEach(r => { m[r.round] = parseInt(r.Results && r.Results[0] && r.Results[0].position) || null; });
    return rounds.map(r => m[r] || null);
  };

  const dsPoints = [
    { label: cmpDriverA.name, data: mapPoints(racesA), color: colorA },
    { label: cmpDriverB.name, data: mapPoints(racesB), color: colorB },
  ];
  const dsPos = [
    { label: cmpDriverA.name, data: mapPos(racesA), color: colorA },
    { label: cmpDriverB.name, data: mapPos(racesB), color: colorB },
  ];

  renderCmpLegend('cmp-legend-points', dsPoints);
  renderCmpLegend('cmp-legend-positions', dsPos);
  drawInteractiveChart('cmp-chart-points', 'cmp-tip-points', labels, dsPoints, { fill: true, yLabel: 'pts' });
  drawInteractiveChart('cmp-chart-positions', 'cmp-tip-positions', labels, dsPos, { invertY: true, yMin: 1, yMax: 20, yLabel: 'P' });
}

function renderCmpLegend(id, datasets) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = datasets.map(ds =>
    '<div class="cmp-legend-item">' +
      '<div class="cmp-legend-dot" style="background:' + ds.color + '"></div>' +
      '<span>' + ds.label + '</span>' +
    '</div>'
  ).join('');
}

function drawInteractiveChart(canvasId, tipId, labels, datasets, opts) {
  opts = opts || {};
  const canvas = document.getElementById(canvasId);
  const tip = document.getElementById(tipId);
  if (!canvas) return;

  // Replace canvas to remove old listeners
  const fresh = canvas.cloneNode(false);
  fresh.setAttribute('height', canvas.getAttribute('height') || '240');
  canvas.parentNode.replaceChild(fresh, canvas);

  fresh.width = fresh.parentElement.clientWidth || 800;
  fresh.height = parseInt(fresh.getAttribute('height')) || 240;
  const W = fresh.width, H = fresh.height;
  const pad = { top: 16, right: 16, bottom: 36, left: 44 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const allVals = datasets.reduce(function(acc, d) { return acc.concat(d.data.filter(function(v){ return v !== null; })); }, []);
  let yMin = opts.yMin !== undefined ? opts.yMin : Math.min.apply(null, allVals.concat([0]));
  let yMax = opts.yMax !== undefined ? opts.yMax : Math.max.apply(null, allVals);
  if (yMin === yMax) yMax = yMin + 1;
  const yRange = yMax - yMin;

  const xStep = labels.length > 1 ? cW / (labels.length - 1) : cW;
  const toX = function(i) { return pad.left + i * xStep; };
  const toY = function(v) {
    if (v === null) return null;
    if (opts.invertY) return pad.top + ((v - yMin) / yRange) * cH;
    return pad.top + (1 - (v - yMin) / yRange) * cH;
  };

  function draw(hoverIdx) {
    const ctx = fresh.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * cH;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
      const val = opts.invertY
        ? Math.round(yMin + (i / 4) * yRange)
        : Math.round(yMax - (i / 4) * yRange);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px Inter,sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, pad.left - 5, y + 4);
    }

    // X labels
    const step = Math.ceil(labels.length / 10);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter,sans-serif';
    ctx.textAlign = 'center';
    labels.forEach(function(lbl, i) {
      if (i % step !== 0 && i !== labels.length - 1) return;
      ctx.fillText(lbl, toX(i), H - 6);
    });

    // Hover line
    if (hoverIdx >= 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toX(hoverIdx), pad.top);
      ctx.lineTo(toX(hoverIdx), pad.top + cH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Lines
    datasets.forEach(function(ds) {
      const pts = ds.data.map(function(v, i) { return { x: toX(i), y: toY(v), i: i }; }).filter(function(p) { return p.y !== null; });
      if (!pts.length) return;

      if (opts.fill) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pad.top + cH);
        pts.forEach(function(p) { ctx.lineTo(p.x, p.y); });
        ctx.lineTo(pts[pts.length-1].x, pad.top + cH);
        ctx.closePath();
        ctx.fillStyle = ds.color + '15';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      pts.forEach(function(p, i) { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
      ctx.stroke();

      pts.forEach(function(p) {
        const isHov = hoverIdx >= 0 && p.i === hoverIdx;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHov ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = ds.color;
        ctx.fill();
        if (isHov) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    });
  }

  draw(-1);

  fresh.addEventListener('mousemove', function(e) {
    const rect = fresh.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const idx = Math.max(0, Math.min(labels.length - 1, Math.round((mx - pad.left) / xStep)));
    draw(idx);

    const vals = datasets.map(function(ds) { return { label: ds.label, color: ds.color, val: ds.data[idx] }; });
    if (tip) {
      tip.innerHTML =
        '<div class="cmp-tooltip-race">' + labels[idx] + '</div>' +
        vals.map(function(v) {
          const display = v.val !== null
            ? (opts.invertY ? 'P' + v.val : v.val + (opts.yLabel === 'pts' ? ' pts' : ''))
            : '—';
          return '<div class="cmp-tooltip-row">' +
            '<div class="cmp-tooltip-dot" style="background:' + v.color + '"></div>' +
            '<span>' + v.label.split(' ').pop() + '</span>' +
            '<span class="cmp-tooltip-val">' + display + '</span>' +
          '</div>';
        }).join('');
      tip.classList.add('visible');
      const tx = toX(idx);
      tip.style.left = (tx > W * 0.65 ? tx - 155 : tx + 12) + 'px';
      tip.style.top = (pad.top + 8) + 'px';
    }
  });

  fresh.addEventListener('mouseleave', function() {
    draw(-1);
    if (tip) tip.classList.remove('visible');
  });
}
