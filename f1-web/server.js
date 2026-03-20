const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const BASE = 'https://api.jolpi.ca/ergast/f1';

app.use(express.static(path.join(__dirname, 'public')));

async function f1get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`F1 API error: ${res.status}`);
  return res.json();
}

// Current season metadata
app.get('/api/meta/season', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/current/races.json?limit=1`);
    const season = parseInt(data.MRData.RaceTable.season);
    res.json({ season });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Generic season param — accepts year or "current"
app.get('/api/:season/races', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/races.json?limit=30`);
    res.json(data.MRData.RaceTable.Races);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/:season/results/last', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/last/results.json`);
    res.json(data.MRData.RaceTable.Races[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/:season/results/:round', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/${req.params.round}/results.json`);
    res.json(data.MRData.RaceTable.Races[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/:season/standings/drivers', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/driverStandings.json`);
    res.json(data.MRData.StandingsTable.StandingsLists[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/:season/standings/constructors', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/constructorStandings.json`);
    res.json(data.MRData.StandingsTable.StandingsLists[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/:season/circuits', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/circuits.json?limit=30`);
    res.json(data.MRData.CircuitTable.Circuits);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/:season/drivers', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/drivers.json?limit=30`);
    res.json(data.MRData.DriverTable.Drivers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Driver race results for a season
app.get('/api/:season/driver/:driverId/results', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/drivers/${req.params.driverId}/results.json?limit=30`);
    res.json(data.MRData.RaceTable.Races);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Circuit race results for a season
app.get('/api/:season/circuits/:circuitId/results', async (req, res) => {
  try {
    const data = await f1get(`${BASE}/${req.params.season}/circuits/${req.params.circuitId}/results.json?limit=1`);
    res.json(data.MRData.RaceTable.Races[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Win probability — circuit history (5yr) + current season form (last 2 races) + constructor car pace
app.get('/api/probability/:circuitId', async (req, res) => {
  try {
    const { circuitId } = req.params;
    const currentYear = new Date().getFullYear();
    const histYears = [currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5];

    // Fetch all signals in parallel
    const [historicalResults, driverStandings, constructorStandings, recentRaces] = await Promise.all([
      // Signal 1: last 5 years at this circuit
      Promise.all(histYears.map(yr =>
        f1get(`${BASE}/${yr}/circuits/${circuitId}/results.json?limit=1`)
          .then(d => ({ year: yr, race: d.MRData.RaceTable.Races[0] || null }))
          .catch(() => ({ year: yr, race: null }))
      )),
      // Signal 2: current driver championship standings
      f1get(`${BASE}/current/driverStandings.json`)
        .then(d => d.MRData.StandingsTable.StandingsLists[0])
        .catch(() => null),
      // Signal 3: current constructor standings (car pace proxy)
      f1get(`${BASE}/current/constructorStandings.json`)
        .then(d => d.MRData.StandingsTable.StandingsLists[0])
        .catch(() => null),
      // Signal 4: last 2 completed races this season (recent form)
      f1get(`${BASE}/current/results.json?limit=2&offset=0`)
        .then(d => {
          const races = d.MRData.RaceTable.Races;
          // Sort descending by round, take last 2
          return races.sort((a, b) => parseInt(b.round) - parseInt(a.round)).slice(0, 2);
        })
        .catch(() => []),
    ]);

    const scores = {};

    function ensureDriver(id, name, constructor, constructorId) {
      if (!scores[id]) scores[id] = { driverId: id, name, score: 0, wins: 0, podiums: 0, constructor, constructorId, formBoost: 0, carBoost: 0 };
    }

    // --- Signal 1: Circuit history (weight 40% of total influence) ---
    const histWeights = [5, 4, 3, 2, 1]; // most recent year = highest weight
    historicalResults.forEach(({ race }, idx) => {
      if (!race?.Results) return;
      const w = histWeights[idx] || 1;
      race.Results.slice(0, 10).forEach(r => {
        const id = r.Driver.driverId;
        const pos = parseInt(r.position);
        ensureDriver(id, `${r.Driver.givenName} ${r.Driver.familyName}`, r.Constructor.name, r.Constructor.constructorId);
        const pts = pos === 1 ? 10 : pos === 2 ? 6 : pos === 3 ? 4 : pos <= 6 ? 2 : 1;
        scores[id].score += pts * w;
        if (pos === 1) scores[id].wins++;
        if (pos <= 3) scores[id].podiums++;
      });
    });

    // --- Signal 2: Driver championship position (season-long pace, weight ~20%) ---
    if (driverStandings?.DriverStandings) {
      driverStandings.DriverStandings.slice(0, 20).forEach((s, idx) => {
        const id = s.Driver.driverId;
        const name = `${s.Driver.givenName} ${s.Driver.familyName}`;
        const conId = s.Constructors[0]?.constructorId || '';
        const conName = s.Constructors[0]?.name || '—';
        ensureDriver(id, name, conName, conId);
        // Top 10 in standings get a bonus, scaled by position
        const bonus = Math.max(0, (11 - Math.min(idx + 1, 10))) * 1.2;
        scores[id].score += bonus;
        // Always update constructor to current season team
        scores[id].constructor = conName;
        scores[id].constructorId = conId;
      });
    }

    // --- Signal 3: Constructor standings — car performance (weight ~20%) ---
    // Build a map: constructorId -> pace bonus
    const carPaceMap = {};
    if (constructorStandings?.ConstructorStandings) {
      constructorStandings.ConstructorStandings.slice(0, 10).forEach((s, idx) => {
        // Top constructor gets +8, scaling down
        carPaceMap[s.Constructor.constructorId] = Math.max(0, (10 - idx)) * 0.8;
      });
    }

    // --- Signal 4: Recent form — last 2 races (weight ~20%, highest recency) ---
    // Weights: most recent race = 3x, second most recent = 2x
    const formWeights = [3, 2];
    recentRaces.forEach((race, idx) => {
      if (!race?.Results) return;
      const w = formWeights[idx] || 1;
      race.Results.slice(0, 10).forEach(r => {
        const id = r.Driver.driverId;
        const pos = parseInt(r.position);
        const name = `${r.Driver.givenName} ${r.Driver.familyName}`;
        ensureDriver(id, name, r.Constructor.name, r.Constructor.constructorId);
        // Form points: win=8, P2=5, P3=3, P4-P6=2, P7-P10=1
        const pts = pos === 1 ? 8 : pos === 2 ? 5 : pos === 3 ? 3 : pos <= 6 ? 2 : 1;
        const formPts = pts * w;
        scores[id].score += formPts;
        scores[id].formBoost += formPts; // track separately for display
      });
    });

    // Apply car pace bonus to all drivers based on their current constructor
    Object.values(scores).forEach(d => {
      const pace = carPaceMap[d.constructorId] || 0;
      d.score += pace;
      d.carBoost = pace;
    });

    // Sort, slice top 10, compute percentages
    const sorted = Object.values(scores).sort((a, b) => b.score - a.score).slice(0, 10);
    const total = sorted.reduce((s, d) => s + d.score, 0);
    const result = sorted.map(d => ({
      driverId: d.driverId,
      name: d.name,
      constructor: d.constructor,
      constructorId: d.constructorId,
      probability: total > 0 ? Math.round((d.score / total) * 100) : 0,
      wins: d.wins,
      podiums: d.podiums,
      inForm: d.formBoost > 6, // flag: strong recent form
      topCar: d.carBoost >= 6,  // flag: top 3 constructor
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Circuit SVG proxy — fetches from GitHub repo, recolors stroke to red
const CIRCUIT_SVG_MAP = {
  albert_park:    'melbourne-2',
  americas:       'austin-1',
  bahrain:        'bahrain-3',
  baku:           'baku-1',
  catalunya:      'catalunya-6',
  hungaroring:    'hungaroring-3',
  interlagos:     'interlagos-2',
  jeddah:         'jeddah-1',
  losail:         'lusail-1',
  marina_bay:     'marina-bay-4',
  miami:          'miami-1',
  monaco:         'monaco-6',
  monza:          'monza-7',
  red_bull_ring:  'spielberg-3',
  silverstone:    'silverstone-8',
  spa:            'spa-francorchamps-4',
  suzuka:         'suzuka-2',
  villeneuve:     'montreal-6',
  yas_marina:     'yas-marina-2',
  zandvoort:      'zandvoort-5',
  imola:          'imola-3',
  shanghai:       'shanghai-1',
  vegas:          'las-vegas-1',
  madring:        'madring-1',
  rodriguez:      'mexico-city-3',
  portimao:       'portimao-1',
  istanbul:       'istanbul-1',
  sochi:          'sochi-1',
  sepang:         'sepang-1',
  nurburgring:    'nurburgring-4',
  hockenheimring: 'hockenheimring-4',
  mugello:        'mugello-1',
  paul_ricard:    'paul-ricard-3',
  yeongam:        'yeongam-1',
};

const SVG_BASE = 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/black-outline';

app.get('/api/circuit-svg/:circuitId', async (req, res) => {
  const slug = CIRCUIT_SVG_MAP[req.params.circuitId];
  if (!slug) {
    console.log(`[circuit-svg] No mapping for: ${req.params.circuitId}`);
    return res.status(404).send('');
  }
  try {
    const r = await fetch(`${SVG_BASE}/${slug}.svg`);
    if (!r.ok) {
      console.log(`[circuit-svg] GitHub 404 for: ${slug}`);
      return res.status(404).send('');
    }
    let svg = await r.text();
    svg = svg.replace(/stroke:\s*#000[^;"]*/g, 'stroke:#e10600');
    svg = svg.replace(/stroke:\s*#fff[^;"]*/g, 'stroke:none');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svg);
  } catch (e) {
    console.log(`[circuit-svg] Error: ${e.message}`);
    res.status(500).send('');
  }
});

app.listen(PORT, () => console.log(`F1 Dashboard running at http://localhost:${PORT}`));
