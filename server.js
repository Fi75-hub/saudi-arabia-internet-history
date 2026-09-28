// Express server for the project
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
// Lightweight CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// Serve static assets
app.use(express.static(__dirname));

// In-memory datasets
const memoryContribs = [];

// Infrastructure dataset for Saudi Arabia
const infrastructure = [
  {
    "category": "Backbone & IXPs",
    "year": 1993,
    "title": "Academic research backbone",
    "details": "First academic backbone connecting universities and government research units; groundwork for later public access."
  },
  {
    "category": "Public Access",
    "year": 1999,
    "title": "Public internet access launches",
    "details": "Commercial ISPs provide dial‑up access; national coordination improves routing and peering."
  },
  {
    "category": "International Gateways",
    "year": 2001,
    "title": "Submarine cable capacity expands",
    "details": "SEA‑ME‑WE systems and regional cables increase international bandwidth and resilience."
  },
  {
    "category": "Datacenters",
    "year": 2005,
    "title": "Local data hosting grows",
    "details": "Early colocation rooms consolidate into purpose‑built facilities with redundant power and cooling."
  },
  {
    "category": "Mobile",
    "year": 2008,
    "title": "3G coverage nationwide",
    "details": "Mobile broadband becomes mainstream; USB modems and smartphones accelerate usage."
  },
  {
    "category": "Fiber Access",
    "year": 2010,
    "title": "FTTx pilots in major cities",
    "details": "City‑level fiber rollouts begin for business districts and dense residential zones."
  },
  {
    "category": "IXPs",
    "year": 2012,
    "title": "Carrier‑neutral peering strengthens",
    "details": "Regional internet exchange points reduce tromboning and improve domestic latency."
  },
  {
    "category": "Backbone",
    "year": 2015,
    "title": "DWDM upgrades across backbone",
    "details": "Backbone refreshed with higher‑capacity optical gear; improved availability SLAs."
  },
  {
    "category": "Content Delivery",
    "year": 2017,
    "title": "CDN edge nodes expand",
    "details": "Global CDNs deploy more PoPs; video streaming performance improves noticeably."
  },
  {
    "category": "Mobile",
    "year": 2019,
    "title": "5G launches in dense areas",
    "details": "Mid‑band and early mmWave deployments enable low‑latency consumer and enterprise use‑cases."
  },
  {
    "category": "Cloud & DC",
    "year": 2021,
    "title": "Regional cloud zones announced",
    "details": "Cloud providers announce local regions; data residency and latency improve for enterprises."
  },
  {
    "category": "Security",
    "year": 2022,
    "title": "National DDoS mitigation footprint",
    "details": "Operators implement upstream scrubbing; coordinated incident response matures."
  },
  {
    "category": "Municipal Fiber",
    "year": 2023,
    "title": "Smart‑city backhaul",
    "details": "Municipal fiber supports sensors, cameras, and public Wi‑Fi in transit hubs."
  },
  {
    "category": "Edge Compute",
    "year": 2024,
    "title": "MEC trials with operators",
    "details": "Edge compute pilots near RAN sites for AR/VR, gaming, and industrial telemetry."
  },
  {
    "category": "Sustainability",
    "year": 2025,
    "title": "Efficient DC cooling & PUE targets",
    "details": "Modern facilities adopt containment and free‑air cooling; greener power contracts."
  }
];

// Health/status
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    datasets: {
      infrastructure: infrastructure.length,
      contributions: memoryContribs.length
    }
  });
});

app.get('/api/ping', (req,res)=>res.json({ok:true}));

// Infrastructure API
app.get('/api/infrastructure', (req, res) => {
  // Return as an array of records
  res.json(infrastructure);
});

// Contributions
app.post('/api/contribute', (req, res) => {
  const body = req.body || {};
  const year = Number(body.year);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const details = typeof body.details === 'string' ? body.details.trim() : '';

  if (!Number.isFinite(year) || !title) {
    return res.status(400).json({ error: 'Invalid payload. Expect {year:number, title:string, details?:string}' });
  }
  const item = { year, title, details, createdAt: new Date().toISOString() };
  memoryContribs.push(item);
  return res.status(201).json(item);
});

app.get('/api/contributions', (req, res) => {
  res.json(memoryContribs);
});

// Root → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
