# XSS Scanner

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)

A context-aware reflected XSS scanner with headless browser confirmation.

**Live demo:** https://xss-scannerweb.vercel.app

![Screenshot](./screenshot.png)

## What it does

The scanner takes a URL, discovers injectable parameters, detects the HTML context where input lands (body, attribute, script, URL), injects a context-appropriate payload, and confirms execution in a real headless browser.

It distinguishes between three states:

- **Clean** — no reflection detected
- **Reflected but not executed** — the payload appears in the HTML but the browser doesn't run it (likely encoded or CSP-blocked)
- **Confirmed XSS** — the payload reflects *and* executes in a real browser

That third distinction is what makes this different from naive scanners that flag every reflection as a vulnerability.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  Next.js UI     │ ──────► │  Fastify API    │
│  (Vercel)       │         │  (Render)       │
└─────────────────┘         └────────┬────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                   ┌────────────┐        ┌────────────┐
                   │  Target    │        │ Browserless│
                   │  (fetch)   │        │ (Chromium) │
                   └────────────┘        └────────────┘
```

## Features

- **Parameter discovery** — extracts query params and form inputs from the target
- **Context detection** — identifies whether input lands in HTML body, attribute, script, or URL context
- **Context-aware payloads** — picks the right payload per context (img onerror, event handler, script break, javascript: scheme)
- **Execution confirmation** — uses Browserless headless Chromium to verify the payload actually fires
- **Authentication** — Clerk (GitHub OAuth) on the frontend
- **Authorization modal** — user confirms they have permission before each scan
- **Allowlist** — hosted version only scans the bundled demo target
- **Learn section** — XSS fundamentals, prevention, and types

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, Clerk, lucide-react |
| Backend | Fastify, Node.js |
| Browser automation | Playwright + Browserless |
| Deployment | Vercel (frontend), Render (backend) |

## Repo structure

```
xss-scanner/
├── backend/          Fastify API + scanning logic
├── frontend/         Next.js dashboard
├── demo-target/      Vulnerable + safe demo endpoints
├── LICENSE
├── README.md
└── .gitignore
```

## Running locally

### Backend

```bash
cd backend
npm install
# create .env with BROWSERLESS_TOKEN=your_token
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

### Demo target

```bash
cd demo-target
npx serve
```

Two endpoints:
- `http://localhost:3000/api/echo?query=hello` — vulnerable
- `http://localhost:3000/api/safe?query=hello` — safe

## Deployment

- **Frontend** deploys to Vercel with Root Directory `frontend/`
- **Backend** deploys to Render with Root Directory `backend/`
- **Demo target** deploys to Vercel with Root Directory `demo-target/`

## Limitations

- Detects **reflected XSS** only — not stored or DOM-based
- Single payload per context (a real scanner would try many)
- No crawler — tests the given URL plus form inputs on that page
- No authentication flow for scanning behind a login

## What's next

- [ ] DNS TXT verification so signed-in users can scan their own domains
- [ ] Crawler — discover links and forms across a site
- [ ] Larger payload library per context
- [ ] Stored XSS detection via form submission
- [ ] Automated tests (Vitest)

## Legal

Only scan systems you own or have explicit permission to test. Unauthorized scanning is illegal in most jurisdictions.

## License

MIT