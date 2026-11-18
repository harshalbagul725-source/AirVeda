# AirVeda

[![Live Demo](https://img.shields.io/badge/Live%20Demo-airveda.vercel.app-22c55e?style=for-the-badge)](https://airveda.vercel.app)
[![Frontend CI](https://img.shields.io/github/actions/workflow/status/harshalbagul725-source/AirVeda/ci.yml?branch=main&label=CI&style=for-the-badge)](https://github.com/harshalbagul725-source/AirVeda/actions)
[![License](https://img.shields.io/badge/License-Not%20selected-lightgrey?style=for-the-badge)](#license)

**AirVeda is an AI-assisted urban air-quality and wellness assistant for planning everyday activities around atmospheric conditions.**

It combines modelled weather and air-quality data with CPCB NAQI and US EPA PM2.5 calculations, pollution guidance, daily routine planning, indoor-air checklists, and transport emissions estimates.

> [!IMPORTANT]
> AirVeda uses modelled atmospheric estimates, not ground-monitor measurements. It does not provide synthetic replacement readings when live data is unavailable and is not a medical device or source of diagnoses.

## Live application

- **Website:** https://airveda.vercel.app
- **API health:** https://airveda.vercel.app/api/health
- **Local API documentation:** http://localhost:8000/docs

## Features

- Current pollutant concentrations and weather for selected cities
- CPCB NAQI and separate US EPA PM2.5 AQI calculations
- City search and optional browser geolocation
- Hourly modelled trends with chart data tables
- AI-assisted pollution questions with a transparent expert-rule fallback
- Personalized daily routine recommendations
- Indoor-air ventilation advice and checklist
- Illustrative transport CO₂ and cost estimates
- Accessible controls, keyboard focus states, and reduced-motion support

## Screenshots

![AirVeda dashboard](docs/screenshots/airveda-dashboard.png)

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Visualization | Recharts, Lucide React |
| Backend | Python 3.12, FastAPI, Pydantic |
| Data | Open-Meteo Air Quality, Weather, and Geocoding APIs |
| AI | Google Gemini API with server-side configuration |
| Testing | Vitest, React Testing Library, Pytest |
| Deployment | Vercel, Vercel Functions |

## Architecture

```text
Browser
  |
  |  React application
  v
app/frontend/dist
  |
  |  same-origin /api/*
  v
api/index.py
  |
  v
app/backend/app
  |-- Air-quality and weather services
  |-- AQI calculators
  |-- AI and routine planners
  '-- Community and indoor-air endpoints
```

The browser never receives the Gemini API key. The backend validates requests, restricts CORS, applies rate limits, caches short-lived provider responses, and reports unavailable provider data instead of fabricating readings.

## Project structure

```text
.
|-- api/                  # Vercel FastAPI entrypoint
|-- app/
|   |-- backend/          # FastAPI application and Pytest suite
|   `-- frontend/         # React, TypeScript, and Vite application
|-- docs/                 # Documentation assets
|-- vercel.json           # Build, routing, and function configuration
|-- requirements.txt      # Root deployment dependencies
`-- .github/workflows/    # Continuous integration
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- Python 3.11 or newer
- Internet access for Open-Meteo data

### Run the backend

```powershell
cd app/backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Optionally set `GEMINI_API_KEY` in `app/backend/.env` to enable Gemini responses. Without a key, AirVeda uses the built-in expert fallback engine.

### Run the frontend

Open a second terminal:

```powershell
cd app/frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` requests to http://localhost:8000.

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `GEMINI_API_KEY` | Optional server-side Gemini API key | Empty |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.0-flash` |
| `ENVIRONMENT` | Runtime environment name | `development` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Local Vite origins |
| `CACHE_TTL_SECONDS` | Provider response cache duration | `900` |
| `AI_RATE_LIMIT` | AI endpoint request limit | `30/minute` |
| `API_RATE_LIMIT` | General endpoint request limit | `120/minute` |

Never expose secret values through `VITE_*` variables or frontend source code.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Service status |
| `GET` | `/api/aqi/current?city=Nagpur` | Current modelled air quality and weather |
| `GET` | `/api/aqi/historical?city=Nagpur` | Available hourly modelled trend |
| `GET` | `/api/aqi/cities?q=Nag` | City geocoding search |
| `GET` | `/api/aqi/methodology` | AQI formulas and source notes |
| `POST` | `/api/ai/chat` | Contextual pollution guidance |
| `GET` | `/api/ai/suggested-questions` | Suggested chat prompts |
| `POST` | `/api/planner/generate` | Personalized routine recommendations |
| `POST` | `/api/calculator/eco-impact` | Illustrative transport emissions estimate |
| `GET` | `/api/indoor/checklist` | Indoor-air checklist |
| `GET` | `/api/indoor/ventilation-advice` | AQI-based ventilation advice |
| `GET` | `/api/community/challenges` | Self-guided community actions |

Unavailable or incomplete provider data is returned as an error rather than replaced with fabricated readings.

## Testing

```powershell
# Frontend
cd app/frontend
npm ci
npm test
npm run build

# Backend
cd app/backend
.\.venv\Scripts\Activate.ps1
python -m pytest
```

## Deployment

The project is deployed as one Vercel project:

1. Import the GitHub repository in Vercel.
2. Keep the repository root as the project Root Directory.
3. Configure server environment variables in **Vercel → Project Settings → Environment Variables**.
4. Deploy `main`.

The checked-in [vercel.json](vercel.json) builds `app/frontend`, serves `app/frontend/dist`, exposes FastAPI through `api/index.py`, and routes `/api/*` to the Python function.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and follow the existing testing and data-provenance standards.

## Security

Please review [SECURITY.md](SECURITY.md). Do not commit `.env` files, API keys, personal location data, or credentials.

## Roadmap

- Verified ground-monitor integrations with provider and observation metadata
- Additional air-quality authorities and standards
- Documented end-to-end browser tests
- Privacy-preserving community features with consent and verified data sources

## License

No license has been selected yet. A license file will be added after the repository owner confirms a license.
