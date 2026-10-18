# HealthSync AI

HealthSync AI is a healthcare companion with a Next.js frontend and a Flask API. It can analyze uploaded medical reports with Google Gemini, generate diet and exercise suggestions, answer health questions, search for doctors, and keep a health profile and analysis history.

AI output is informational and is not a diagnosis or a substitute for care from a qualified clinician.

## Project layout

- `frontend/` — Next.js 14, React, TypeScript, Tailwind CSS, and Framer Motion.
- `backend/` — Flask API, SQLAlchemy, SQLite, and Google Gemini integration.
- `backend/templates/` and `backend/static/` — legacy Flask-rendered pages and assets.

## Requirements

- Python 3.8 or newer
- Node.js 18.17 or newer
- A Google Gemini API key for AI features

## Configure the backend

In PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `GEMINI_API_KEY`. Generate a strong Flask session key with:

```powershell
py -c "import secrets; print(secrets.token_hex(32))"
```

Put the generated value in `SECRET_KEY`. To create an administrator on first startup, also set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`; the password must be at least 12 characters. No default administrator account is created. If an existing database still has the old `admin123` password, set a new `ADMIN_PASSWORD` of at least 12 characters before starting the app; startup will replace that legacy password.

Start the API from the `backend/` directory:

```powershell
py app.py
```

The Flask API listens on `http://localhost:5000` by default.

## Configure the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend listens on `http://localhost:3000`. It uses `http://localhost:5000` as the API by default. If your backend runs elsewhere, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to its base URL.

## Data handling

The backend stores account details, health profiles, and analysis history in SQLite. Uploaded reports are sent to Google Gemini for analysis. Review the data handling and retention settings of your own deployment before using real patient information.

## Main API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET / POST | `/api/profile` | Read or update the signed-in user's profile |
| GET | `/api/history` | Read the signed-in user's analysis history |
| POST | `/api/analyze` | Analyze a report |
| POST | `/api/diet-plan` | Generate a diet plan |
| POST | `/api/exercise-plan` | Generate an exercise plan |
| POST | `/api/chat` | Ask the health assistant |
| POST | `/api/doctors` | Search for doctor recommendations |
| GET | `/api/users` | List users (administrator only) |
| DELETE | `/api/users/<id>` | Delete a user (administrator only) |
