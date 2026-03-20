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
    return `<button class="season-pill${isCurrent ? ' active' : ''}" data-season="${season}">${yr}</button>`;
  }).join('');

  // Wire up pill clicks
  container.querySelectorAll('.season-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.season-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSeason = pill.dataset.season;
      const activeView = document.querySelector('.nav-btn.active')?.dataset.view || 'home';
      clearView(activeView);
      loadView(activeView);
      updateSeasonLabels();
    });
  });

  updateSeasonLabels();
  loadHome();
}

// Per-season cache
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
};
function driverPhoto(id) { return DRIVER_PHOTOS[id] || null; }

// ---- Utils ----
function loader(on) {
  document.getElementById('loader').classList.toggle('hidden', !on);
  const bar = document.getElementById('progress-bar');
  if (on) {
    bar.style.width = '60%';
    bar.classList.remove('done');
  } else {
    bar.style.width = '100%';
    setTimeout(() => bar.classList.add('done'), 300);
    setTimeout(() => { bar.style.width = '0%'; bar.classList.remove('done'); }, 620);
  }
}
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
  const el = id => { const e = document.getElementById(id); if (e) e.textContent = e.textContent.replace(/20\d\d/, yr); };
  document.getElementById('hero-title').innerHTML = `${yr} Formula 1<br><span class="red">World Championship</span>`;
  document.getElementById('races-title').textContent = `${yr} Race Schedule`;
  document.getElementById('standings-title').textContent = `${yr} Standings`;
  document.getElementById('drivers-title').textContent = `${yr} Drivers`;
  document.getElementById('circuits-title').textContent = `${yr} Circuits`;
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
  if (view === 'home') {
    document.getElementById('home-cards').innerHTML = '';
    document.getElementById('last-race').innerHTML = '';
  }
}

// ---- Navigation ----
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    loadView(view);
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
  if (document.getElementById('races-grid').children.length) return;
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
  if (document.querySelector('#driver-standings-table tbody').children.length) return;
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
  if (document.getElementById('drivers-grid').children.length) return;
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

// ---- CIRCUITS ----
async function loadCircuits() {
  if (document.getElementById('circuits-grid').children.length) return;
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

// ---- Init ----
initSeasons();
