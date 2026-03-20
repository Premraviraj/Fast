const fetch = require('node-fetch');

const BASE = 'https://api.jolpi.ca/ergast/f1';

async function f1get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`F1 API error: ${res.status}`);
  return res.json();
}

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

module.exports = async (req, res) => {
  const url = req.url;

  // Strip leading /api
  const path = url.replace(/^\/api/, '').split('?')[0];
  const segments = path.split('/').filter(Boolean);

  try {
    // GET /meta/season
    if (segments[0] === 'meta' && segments[1] === 'season') {
      const data = await f1get(`${BASE}/current/races.json?limit=1`);
      return res.json({ season: parseInt(data.MRData.RaceTable.season) });
    }

    // GET /circuit-svg/:circuitId
    if (segments[0] === 'circuit-svg') {
      const slug = CIRCUIT_SVG_MAP[segments[1]];
      if (!slug) return res.status(404).send('');
      const r = await fetch(`${SVG_BASE}/${slug}.svg`);
      if (!r.ok) return res.status(404).send('');
      let svg = await r.text();
      svg = svg.replace(/stroke:\s*#000[^;"]*/g, 'stroke:#e10600');
      svg = svg.replace(/stroke:\s*#fff[^;"]*/g, 'stroke:none');
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(svg);
    }

    // GET /probability/:circuitId
    if (segments[0] === 'probability') {
      const circuitId = segments[1];
      const currentYear = new Date().getFullYear();
      const histYears = [currentYear-1, currentYear-2, currentYear-3, currentYear-4, currentYear-5];

      const [historicalResults, driverStandings, constructorStandings, recentRaces] = await Promise.all([
        Promise.all(histYears.map(yr =>
          f1get(`${BASE}/${yr}/circuits/${circuitId}/results.json?limit=1`)
            .then(d => ({ year: yr, race: d.MRData.RaceTable.Races[0] || null }))
            .catch(() => ({ year: yr, race: null }))
        )),
        f1get(`${BASE}/current/driverStandings.json`).then(d => d.MRData.StandingsTable.StandingsLists[0]).catch(() => null),
        f1get(`${BASE}/current/constructorStandings.json`).then(d => d.MRData.StandingsTable.StandingsLists[0]).catch(() => null),
        f1get(`${BASE}/current/results.json?limit=2&offset=0`)
          .then(d => d.MRData.RaceTable.Races.sort((a,b) => parseInt(b.round)-parseInt(a.round)).slice(0,2))
          .catch(() => []),
      ]);

      const scores = {};
      function ensureDriver(id, name, constructor, constructorId) {
        if (!scores[id]) scores[id] = { driverId: id, name, score: 0, wins: 0, podiums: 0, constructor, constructorId, formBoost: 0, carBoost: 0 };
      }

      const histWeights = [5,4,3,2,1];
      historicalResults.forEach(({ race }, idx) => {
        if (!race?.Results) return;
        const w = histWeights[idx] || 1;
        race.Results.slice(0,10).forEach(r => {
          const id = r.Driver.driverId;
          const pos = parseInt(r.position);
          ensureDriver(id, `${r.Driver.givenName} ${r.Driver.familyName}`, r.Constructor.name, r.Constructor.constructorId);
          const pts = pos===1?10:pos===2?6:pos===3?4:pos<=6?2:1;
          scores[id].score += pts * w;
          if (pos===1) scores[id].wins++;
          if (pos<=3) scores[id].podiums++;
        });
      });

      if (driverStandings?.DriverStandings) {
        driverStandings.DriverStandings.slice(0,20).forEach((s, idx) => {
          const id = s.Driver.driverId;
          ensureDriver(id, `${s.Driver.givenName} ${s.Driver.familyName}`, s.Constructors[0]?.name||'—', s.Constructors[0]?.constructorId||'');
          scores[id].score += Math.max(0,(11-Math.min(idx+1,10)))*1.2;
          scores[id].constructor = s.Constructors[0]?.name||'—';
          scores[id].constructorId = s.Constructors[0]?.constructorId||'';
        });
      }

      const carPaceMap = {};
      if (constructorStandings?.ConstructorStandings) {
        constructorStandings.ConstructorStandings.slice(0,10).forEach((s,idx) => {
          carPaceMap[s.Constructor.constructorId] = Math.max(0,(10-idx))*0.8;
        });
      }

      [3,2].forEach((w, idx) => {
        const race = recentRaces[idx];
        if (!race?.Results) return;
        race.Results.slice(0,10).forEach(r => {
          const id = r.Driver.driverId;
          const pos = parseInt(r.position);
          ensureDriver(id, `${r.Driver.givenName} ${r.Driver.familyName}`, r.Constructor.name, r.Constructor.constructorId);
          const pts = pos===1?8:pos===2?5:pos===3?3:pos<=6?2:1;
          const fp = pts * w;
          scores[id].score += fp;
          scores[id].formBoost += fp;
        });
      });

      Object.values(scores).forEach(d => {
        const pace = carPaceMap[d.constructorId] || 0;
        d.score += pace;
        d.carBoost = pace;
      });

      const sorted = Object.values(scores).sort((a,b) => b.score-a.score).slice(0,10);
      const total = sorted.reduce((s,d) => s+d.score, 0);
      return res.json(sorted.map(d => ({
        driverId: d.driverId, name: d.name, constructor: d.constructor, constructorId: d.constructorId,
        probability: total>0 ? Math.round((d.score/total)*100) : 0,
        wins: d.wins, podiums: d.podiums,
        inForm: d.formBoost > 6, topCar: d.carBoost >= 6,
      })));
    }

    // GET /:season/races
    if (segments[1] === 'races') {
      const data = await f1get(`${BASE}/${segments[0]}/races.json?limit=30`);
      return res.json(data.MRData.RaceTable.Races);
    }

    // GET /:season/results/last
    if (segments[1] === 'results' && segments[2] === 'last') {
      const data = await f1get(`${BASE}/${segments[0]}/last/results.json`);
      return res.json(data.MRData.RaceTable.Races[0] || null);
    }

    // GET /:season/results/:round
    if (segments[1] === 'results' && segments[2]) {
      const data = await f1get(`${BASE}/${segments[0]}/${segments[2]}/results.json`);
      return res.json(data.MRData.RaceTable.Races[0] || null);
    }

    // GET /:season/standings/drivers
    if (segments[1] === 'standings' && segments[2] === 'drivers') {
      const data = await f1get(`${BASE}/${segments[0]}/driverStandings.json`);
      return res.json(data.MRData.StandingsTable.StandingsLists[0] || null);
    }

    // GET /:season/standings/constructors
    if (segments[1] === 'standings' && segments[2] === 'constructors') {
      const data = await f1get(`${BASE}/${segments[0]}/constructorStandings.json`);
      return res.json(data.MRData.StandingsTable.StandingsLists[0] || null);
    }

    // GET /:season/circuits
    if (segments[1] === 'circuits' && !segments[2]) {
      const data = await f1get(`${BASE}/${segments[0]}/circuits.json?limit=30`);
      return res.json(data.MRData.CircuitTable.Circuits);
    }

    // GET /:season/circuits/:circuitId/results
    if (segments[1] === 'circuits' && segments[3] === 'results') {
      const data = await f1get(`${BASE}/${segments[0]}/circuits/${segments[2]}/results.json?limit=1`);
      return res.json(data.MRData.RaceTable.Races[0] || null);
    }

    // GET /:season/drivers
    if (segments[1] === 'drivers' && !segments[2]) {
      const data = await f1get(`${BASE}/${segments[0]}/drivers.json?limit=30`);
      return res.json(data.MRData.DriverTable.Drivers);
    }

    // GET /:season/driver/:driverId/results
    if (segments[1] === 'driver' && segments[3] === 'results') {
      const data = await f1get(`${BASE}/${segments[0]}/drivers/${segments[2]}/results.json?limit=30`);
      return res.json(data.MRData.RaceTable.Races);
    }

    res.status(404).json({ error: 'Not found' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
