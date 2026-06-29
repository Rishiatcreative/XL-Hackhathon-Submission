# ProspectIQ — AI-Powered Sales Intelligence Platform

ProspectIQ is a production-grade, state-of-the-art B2B sales intelligence platform that automates lead discovery, enrichment, and qualification in real time. Paste a company URL, and the multi-agent pipeline concurrently crawls website content, gathers recent press/news events, matches ICP criteria, extracts verified decision-maker contacts, and formulates automated sales outreach playbooks.

---

## 🏗️ Architecture & Data Flow

```
                     ┌────────────────────────┐
                     │   Next.js 16 Client    │
                     └───────────┬────────────┘
                                 │ HTTP POST
                                 ▼
                     ┌────────────────────────┐
                     │    FastAPI Backend     │
                     └───────────┬────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼ (Parallel)    ▼ (Parallel)    ▼ (Parallel)
          ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
          │  Firecrawl  │ │   NewsAPI   │ │  Hunter.io  │
          │ Web Scraper │ │ Monitor API │ │ Contact API │
          └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
                 │               │               │
                 └───────────────┼───────────────┘
                                 ▼
                     ┌────────────────────────┐
                     │   Deterministic ICP    │
                     │  (Python Evaluation)   │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │   Groq LLM Fallback    │
                     │  (Playbook Generation) │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │    SQLite (WAL Mode)   │
                     └────────────────────────┘
```

---

## ⚡ Key Premium Features

### 🚀 Concurrent Agentic Discovery Pipeline
Instead of sequential operations, the FastAPI service utilizes a concurrency orchestrator running **Firecrawl, NewsAPI, and Hunter.io in parallel**. This cuts discovery latency from **30s+ down to under 10 seconds** while ensuring system resilience if an individual scraper API fails.

### 🛡️ Groq LLM Rate Limit Fallback Chain
To counter strict Token-Per-Day (TPD) rate limits on Groq's high-capacity models (e.g. `llama-3.3-70b`), the AI service features a custom fallback sequence:
1. `llama-3.3-70b-versatile` (Primary)
2. `llama-3.1-8b-instant` (Second option)
3. `mixtral-8x7b-32768` (Third option)
4. `llama3-8b-8192` (Fourth option)

### 📊 Deterministic ICP Scorer & Analytics
Matches are calculated using standard Python math routines to prevent LLM hallucination. The scoring system weights 6 parameters:
- Industry Match
- Company Size Fit
- Buying Triggers
- News Relevance
- Website Keyword Match
- Decision Makers Found

Matches are visualized with progress gauges and an interactive **Radial SVG Match Score Meter**.

### 💬 Cached RAG Assistant ("Ask ProspectIQ")
Allows immediate conversational question-answering concerning companies, news, and decision-maker roles. To optimize API costs and response times, **it queries cached database records** instead of making repeated scrapers and LLM calls.

### 📬 Actionable Sales Playbooks
Formulates structured outreach strategies:
- **Prioritization Tier**: (High, Medium, Low fit metrics)
- **Qualification Explanations**: Bulleted evidence points
- **Outreach Draft**: Pre-formatted cold email copies with clipboard copy macros
- **Exporting Options**: Custom CSV data dump downloads and print-formatted PDF sheets

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (Turbopack), React 19, TypeScript, TailwindCSS v4, Framer Motion, next-themes |
| **Backend** | FastAPI, Python 3.13, SQLAlchemy, Pydantic |
| **Integrations** | Firecrawl, Hunter.io Contacts API, NewsAPI, Groq SDK |
| **Database** | SQLite Core running in high-concurrency WAL (Write-Ahead Logging) mode |

---

## 📂 Project Structure

```
final_ver/
├── backend/                  # FastAPI Web Backend
│   ├── app.py                # Service Entry point
│   ├── config.py             # Settings configurations
│   ├── database.py           # SQL session initializers
│   ├── models/               # SQLAlchemy schema maps
│   ├── routes/               # API endpoint definitions
│   ├── services/             # Orchestrator & API clients
│   │   ├── orchestrator.py   # Concurrency scheduler
│   │   ├── ai_service.py     # Groq client fallback chains
│   │   ├── news_service.py   # News searcher
│   │   ├── hunter_service.py # Email hunter
│   │   └── apollo_service.py # Apollo contact finder
│   ├── utils/                # Loggers, retry loops, ICP gauges
│   └── requirements.txt      # Python dependencies
│
└── hack_v2/                  # Next.js Front-End
    ├── app/                  # Route layouts
    ├── components/           # Custom components
    │   ├── landing-page.tsx  # Hero spotlight storefront
    │   └── company/          # Drawer details & RAG chatbots
    ├── services/             # Axios API clients
    └── package.json          # Node dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Setup Backend Server
```bash
cd backend

# Create Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```
Fill in API credentials inside `backend/.env`:
```ini
DATABASE_URL=sqlite:///./prospects.db
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
FIRECRAWL_API_KEY=fc_your_key_here
HUNTER_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

Start the FastAPI app:
```bash
PYTHONPATH=. uvicorn app:app --reload --port 8000
```

### 2. Setup Frontend Application
```bash
cd ../hack_v2

# Install Node modules
npm install

# Build/start next app in development mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 API Endpoints

### 1. Multi-Agent Discovery Pipeline
- **Endpoint**: `POST /discover`
- **Body**:
  ```json
  {
    "company_inputs": [
      {
        "url": "https://vercel.com",
        "source": "manual"
      }
    ],
    "force_refresh": true
  }
  ```

### 2. Company Lead Query
- **Endpoint**: `GET /companies`
- **Description**: Returns all qualified lead entries, filtered by score, trigger type, or industry.

### 3. AI Chat Context Endpoint
- **Endpoint**: `POST /companies/{company_id}/chat`
- **Body**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Why does Vercel qualify as a lead?"
      }
    ]
  }
  ```
