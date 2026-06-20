<div align="center">

# 🌿 CarbonTrack

**Track your carbon footprint. Reduce your impact. Reward your choices.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-GPL_v3-blue?style=for-the-badge)](./LICENSE)

</div>

---

## 📄 Description — The "Why"

Climate change is one of the most pressing challenges facing humanity, yet for most individuals, their personal contribution to carbon emissions remains invisible and abstract. **How much CO₂ did your morning commute produce? How does switching from a meat-based diet to a vegetarian one actually compare?** Without tangible answers, people lack the motivation and the data to make meaningful changes to their daily habits.

**CarbonTrack** solves this problem by providing a personal sustainability command center. It is a full-stack web application that empowers users to:

1.  **Log** everyday activities — commuting, eating, energy usage, shopping — and instantly see their carbon footprint calculated in real-time using scientifically-backed emission factors.
2.  **Analyze** their environmental impact over time through interactive charts, trend lines, and filterable data ledgers, turning raw numbers into actionable insights.
3.  **Get Rewarded** for making sustainable choices through a gamified "EcoPoints" wallet system, achievement badges, and challenge completions that make going green genuinely fun.

### What Makes CarbonTrack Different?

| Feature | Description |
|---|---|
| **Real-Time Impact Estimation** | See your CO₂ impact *before* you even submit an activity, calculated live as you fill out the form. |
| **Maps Integration** | Implemented a demo application integration of maps. Still under development |
| **Gamified Rewards Wallet** | Earn EcoPoints for low-carbon choices. View your transaction history, discover "Green Nodes" on an interactive heatmap, and track your rewards growth over time. |
| **Adaptive Theming Engine** | A professionally designed Light & Dark mode system built on semantic CSS variables. Every pixel — including native browser date pickers — adapts flawlessly to the user's preference. |
| **Smart Date Filtering** | The Activity Ledger date filters automatically prevent future date selection and intelligently handle reversed date ranges. |
| **One-Click CSV Export** | Download your entire activity history as a CSV file for external analysis, tax records, or sustainability audits. |

---

## 📑 Table of Contents

- [Description — The "Why"](#-description--the-why)
- [Prerequisites & Setup](#-prerequisites--setup)
  - [System Requirements](#system-requirements)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Backend Setup](#step-2-backend-setup)
  - [Step 3: Frontend Setup](#step-3-frontend-setup)
- [Usage](#-usage)
  - [Getting Started as a New User](#getting-started-as-a-new-user)
  - [Logging a Carbon Activity](#logging-a-carbon-activity)
  - [Filtering & Exporting Data](#filtering--exporting-data)
  - [Exploring Insights & Badges](#exploring-insights--badges)
  - [Managing Your Green Wallet](#managing-your-green-wallet)
  - [Customizing Appearance](#customizing-appearance)
  - [API Endpoints](#api-endpoints)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Support & Contact](#-support--contact)

---

## ⚙️ Prerequisites & Setup

This section provides everything needed to get CarbonTrack running on your local machine for development or evaluation.

### System Requirements

Before you begin, ensure you have the following software installed on your system:

| Requirement | Minimum Version | Purpose |
|---|---|---|
| **Node.js** | v18.0.0+ | JavaScript runtime for the React frontend |
| **npm** | v9.0.0+ | Package manager (ships with Node.js) |
| **Python** | 3.10.0+ | Runtime for the FastAPI backend |
| **pip** | Latest | Python package installer |
| **Git** | Latest | Version control |
| **PostgreSQL** *(or Supabase)* | 14+ | Production database |

### Step 1: Clone the Repository

```bash
git clone https://github.com/Prayas04/carbonfootprint_v1.git
cd carbonfootprint_v1
```

### Step 2: Backend Setup

The backend is a Python FastAPI application located in the `backend/` directory.

**2a. Create and activate a virtual environment:**

```bash
cd backend

# Create the virtual environment
python -m venv .venv

# Activate it
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# On Windows (CMD):
.venv\Scripts\activate.bat

# On macOS / Linux:
source .venv/bin/activate
```

**2b. Install Python dependencies:**

```bash
pip install -r requirements.txt
```

**2c. Configure environment variables:**

Create a `.env` file inside the `backend/` directory. This file stores sensitive configuration that should **never** be committed to version control.

```env
# ─── Database ───────────────────────────────────────────────
# For local development and production with PostgreSQL:
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname

# ─── Authentication ────────────────────────────────────────
# Generate a strong secret: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ─── CORS ──────────────────────────────────────────────────
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**2d. Start the backend development server:**

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You should see output confirming the server is running:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

> **Tip:** The `--reload` flag enables hot-reloading — the server will automatically restart whenever you save a Python file.

### Step 3: Frontend Setup

Open a **new terminal window** (keep the backend running in the previous one) and navigate to the frontend:

**3a. Install Node.js dependencies:**

```bash
cd frontend
npm install
```

**3b. Start the Vite development server:**

```bash
npm run dev
```

The terminal will display your local URL:
```
  VITE v8.0.12  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

> **Note:** The Vite development server is pre-configured (in `vite.config.js`) to **proxy** all `/api` requests to `http://127.0.0.1:8000`. This means you don't need to worry about CORS or separate API base URLs during local development — everything works seamlessly out of the box.

**3c. Open your browser** and navigate to `http://localhost:5173`. You're ready to go! 🎉

---

## 📖 Usage

This section walks through every feature of the application with clear, step-by-step instructions.

### Getting Started as a New User

1. Open `http://localhost:5173` in your browser. You will be redirected to the **Login** page.
2. If you don't have an account, click **"Sign Up"** to create one. Enter your name, email, and a password.
3. After signing up, you are automatically logged in and redirected to the **Dashboard**.

### Logging a Carbon Activity

This is the core action in CarbonTrack — recording something you did so the platform can calculate its environmental impact.

1. Click the **"+ Log Activity"** button in the left sidebar (desktop) or the floating action button (mobile).
2. A modal dialog opens with the following steps:
   - **Select a Category:** Choose from `Transit`, `Diet`, `Energy`, or `Shopping`.
   - **Select a Type:** Each category has specific sub-types. For example, Transit includes `Walk`, `Bike`, `Transit`, `Train`, `Carpool`, `Car`, and `Flight`.
   - **Enter Metrics:** Input the quantity (e.g., distance in km, number of meals, kWh of electricity).
   - **For Transit:** You can optionally enter an **Origin** and **Destination**. If both are provided, a **live Google Maps route preview** is rendered directly inside the modal.
3. An **Estimated Impact** panel at the bottom of the modal shows the calculated CO₂ footprint in real-time as you fill out the form.
4. Click **"Save Activity"** to log the entry to the database.

### Filtering & Exporting Data

The **Activity Ledger** (accessible via the sidebar → "Activity Log") is a powerful data table for reviewing your history.

- **Date Range Filter:** Click the calendar inputs to select a start and end date. The filter is bidirectional — it works correctly regardless of which date you pick first. Future dates are automatically disabled.
- **Category Filter:** Use the dropdown to filter by any specific activity type (e.g., "🚆 Train", "🌱 Vegan").
- **CSV Export:** Click the **"Export"** button in the top toolbar to download a `.csv` file of all currently displayed activities. This file includes timestamps, modes, origins, destinations, distances, durations, and CO₂ impact values.
- **Pagination:** Navigate through pages of results using the pagination controls at the bottom of the table.

### Exploring Insights & Badges

The **Insights** page provides a bird's-eye view of your sustainability journey:

- **Trend Analysis:** View your daily, weekly, and monthly carbon emission trends rendered as interactive line and bar charts.
- **Achievement Badges:** As you accumulate eco-friendly activities, you automatically unlock gamification badges such as "Transit Hero", "Green Eater", and "Zero Waste Champion." Each badge has progress tracking.
- **Carbon Equivalences:** The app translates your raw CO₂ numbers into relatable, real-world comparisons — for example, "Your savings this month are equivalent to planting 12 trees."

### Managing Your Green Wallet

The **Green Rewards** page is your personal sustainability wallet:

- **EcoPoints Balance:** View your total accumulated EcoPoints earned through low-carbon activities.
- **Growth Chart:** A sparkline chart visualizes your EcoPoints growth trend over the past month.
- **Transaction History:** A detailed ledger of every EcoPoints credit, including the activity that earned it, the date, and the point value.
- **Geofenced Green Nodes:** An interactive map section displays nearby sustainable infrastructure (EV charging stations, recycling centers, bike-share docks) as a visual heatmap.

### Customizing Appearance

CarbonTrack supports a fully adaptive **Light Mode** and **Dark Mode**:

1. Click **"Settings"** in the left sidebar (or the profile icon on any page header).
2. In the Settings modal, navigate to the **"Preferences"** tab.
3. Toggle the **Theme** switch to instantly swap between Light and Dark mode.
4. Your preference is saved to `localStorage` and persists across browser sessions.
5. The theme applies globally — all pages, modals, charts, buttons, and even native browser elements (like date picker icons) respond immediately.

### API Endpoints

When the backend server is running, FastAPI auto-generates comprehensive, interactive API documentation:

| Documentation | URL | Description |
|---|---|---|
| **Swagger UI** | `http://127.0.0.1:8000/docs` | Interactive API explorer with "Try it out" functionality |
| **ReDoc** | `http://127.0.0.1:8000/redoc` | Clean, readable API reference documentation |
| **Health Check** | `http://127.0.0.1:8000/api/health` | Returns service status, name, and version |

**Key API Routes:**

```
POST   /api/auth/register     → Create a new user account
POST   /api/auth/login         → Authenticate and receive a JWT access token

GET    /api/dashboard/summary  → Retrieve dashboard metrics and sparkline data

GET    /api/activity/metrics   → Get aggregated activity statistics
GET    /api/activity/events    → List activities (supports pagination, date, mode filters)
POST   /api/activity/events    → Log a new carbon activity
PUT    /api/activity/events/:id → Update an existing activity
DELETE /api/activity/events/:id → Delete an activity

GET    /api/wallet/summary     → Retrieve EcoPoints balance and transaction history

GET    /api/insights/summary   → Get insights, badges, and trend data
```

---

## 🗂️ Project Structure

```
carbonfootprint_v1/
├── backend/                          # FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                   # Application entry point & router registration
│   │   ├── config.py                 # Environment variable management (Pydantic Settings)
│   │   ├── database.py               # Async SQLAlchemy engine & session factory
│   │   ├── seed.py                   # Database seeding script for demo data
│   │   ├── models/                   # SQLAlchemy ORM model definitions
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── routers/                  # API route handlers
│   │   │   ├── auth.py               #   Authentication (register, login, JWT)
│   │   │   ├── dashboard.py          #   Dashboard summary metrics
│   │   │   ├── activity.py           #   Activity CRUD operations
│   │   │   ├── wallet.py             #   EcoPoints wallet & transactions
│   │   │   └── insights.py           #   Insights, badges, and trends
│   │   ├── services/                 # Business logic layer
│   │   └── middleware/               # Custom middleware (CORS, auth guards)
│   ├── requirements.txt              # Python dependency manifest
│   └── .env                          # Environment variables (not committed)
│
├── frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── main.jsx                  # Application bootstrap (ThemeProvider wrapper)
│   │   ├── App.jsx                   # Route definitions & ProtectedRoute guard
│   │   ├── index.css                 # Global CSS — semantic theme variables (Light/Dark)
│   │   ├── api/                      # API client modules
│   │   │   ├── client.js             #   Axios-like HTTP client with JWT interceptors
│   │   │   ├── auth.js               #   Auth API calls (login, register)
│   │   │   ├── dashboard.js          #   Dashboard data fetcher
│   │   │   ├── activity.js           #   Activity CRUD API calls
│   │   │   ├── wallet.js             #   Wallet data fetcher
│   │   │   └── insights.js           #   Insights data fetcher
│   │   ├── context/                  # React Context providers
│   │   │   ├── AuthContext.jsx       #   JWT auth state & login/logout methods
│   │   │   ├── ThemeContext.jsx       #   Light/Dark mode state & localStorage persistence
│   │   │   └── DialogContext.jsx     #   Global modal system (alert, confirm, prompt)
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Layout.jsx            #   App shell — sidebar, mobile nav, FAB
│   │   │   ├── LogActivityModal.jsx  #   Activity logging form with Maps preview
│   │   │   └── SettingsModal.jsx     #   Settings panel with theme toggle
│   │   └── pages/                    # Page-level components
│   │       ├── Login.jsx             #   Authentication page (login + sign up)
│   │       ├── Dashboard.jsx         #   Main dashboard with metrics & charts
│   │       ├── ActivityLedger.jsx    #   Filterable, paginated activity history
│   │       ├── Insights.jsx          #   Trends, badges, and equivalences
│   │       └── Wallet.jsx            #   EcoPoints wallet & green node map
│   ├── package.json                  # Node.js dependency manifest
│   └── vite.config.js                # Vite configuration (API proxy, build settings)
│
├── vercel.json                       # Vercel deployment configuration
├── requirements.txt                  # Root-level Python dependencies (for Vercel)
├── LICENSE                           # GNU General Public License v3
└── README.md                         # This file
```

---

## 🤝 Contributing

Contributions are welcome and encouraged! Whether you're fixing a bug, improving documentation, or proposing a new feature, here's how to get started:

### Reporting Bugs

1. Search existing [Issues](../../issues) to check if the bug has already been reported.
2. If not, open a new issue with:
   - A clear, descriptive title.
   - Steps to reproduce the behavior.
   - Expected vs. actual behavior.
   - Screenshots or console logs if applicable.
   - Your environment details (OS, browser, Node/Python versions).

### Submitting Changes

1. **Fork** the repository.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes.** Follow these conventions:
   - **Python (Backend):** Follow PEP 8. Use type hints on all function signatures.
   - **JavaScript (Frontend):** Follow standard ESLint rules. Use functional components with hooks.
   - **CSS:** All new styles must use the semantic CSS variables defined in `index.css` (e.g., `bg-surface-container`, `text-on-surface`). Do **not** use hardcoded hex color values.
   - **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) format:
     ```
     feat: add monthly emissions comparison chart
     fix: resolve date picker not filtering results
     docs: update API endpoint documentation
     ```
4. **Test your changes** locally by running both servers and verifying in the browser.
5. **Push** to your fork and open a **Pull Request** against `main`.

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

You are free to use, modify, and distribute this software, provided that any derivative works are also distributed under the same license. For full terms, see the [LICENSE](./LICENSE) file.

---

## 💬 Support & Contact

Have questions, suggestions, or need help getting started? Here's how to reach us:

| Channel | Link |
|---|---|
| **GitHub Issues** | [Open an Issue](../../issues) — for bug reports and feature requests |
| **GitHub Discussions** | [Start a Discussion](../../discussions) — for questions and ideas |
| **Feedback Form** | Available directly inside the app via the **Feedback** button in the sidebar |
| **Email** | Contact the maintainer at the email listed on their [GitHub profile](https://github.com/Prayas04) |

---

<div align="center">
  <sub>Built with 💚 for a more sustainable future.</sub>
</div>
