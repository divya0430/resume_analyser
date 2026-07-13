# Aarti TalentForge — Django Backend

This adds a real Django + Django REST Framework backend to your existing
**Aarti TalentForge** frontend. Your HTML/CSS/JS UI is untouched in layout,
styling and behaviour — the only change is *where the candidate pool lives*:
it used to sit only in the browser's `localStorage`; it now lives in a
proper database behind a REST API, so the whole HR team can share one pool
from any machine.

Everything else — the 14 department profiles, the 8‑dimension scoring
engine, PDF parsing, JD matching, bulk scanning, blind screening, side‑by‑
side comparison, analytics, the printable PDF scorecard — is exactly the
same JavaScript as before and still runs 100% in the browser. Only the
"save/load/update/delete a candidate" calls now talk to Django instead of
`localStorage`.

## What was added

```
aarti_backend/          Django project (settings, urls)
candidates/              Django app
  models.py               Candidate model (mirrors the JS candidate object)
  serializers.py           REST serializer — camelCase JSON so the frontend
                            needs zero shape changes (matchedAll, stageAt…)
  views.py                 CandidateViewSet: list/create/update/delete +
                            /bulk/, /clear/, /export_csv/
  urls.py                  Router -> /api/candidates/...
  admin.py                 Candidate visible in Django admin
frontend/
  templates/index.html     Your original index.html, with the CSS/JS
                            <link>/<script> tags switched to Django's
                            {% static %} tag. Nothing else changed.
  static/css/styles.css    Untouched
  static/js/app.js         Same file, with ONLY the persistence layer
                            changed: loadCandidates()/saveCandidates()
                            (localStorage) were replaced with fetch() calls
                            to /api/candidates/. All rendering, scoring,
                            parsing and UI logic is byte-for-byte the same.
  static/js/cloud.js        Untouched (still unused/optional, as before)
requirements.txt
manage.py
```

## Data model

The `Candidate` model stores exactly what `buildCandidate()` in app.js
already produces: name, dept, score, verdict, skills, matchedAll, gaps,
years, edu, position, email, phone, source, notes, date, stage, stageAt,
selectedAt.

## API endpoints

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/candidates/` | List all candidates (optional `?dept=`, `?minScore=`, `?stage=`, `?q=`) |
| POST | `/api/candidates/` | Add one candidate. Returns `409` + the existing record if the email is already used; resend with `"force": true` to save anyway (same as the old "Add anyway as duplicate?" confirm dialog) |
| PATCH | `/api/candidates/<id>/` | Partial update (used for the Stage dropdown, notes, etc.) |
| DELETE | `/api/candidates/<id>/` | Remove one candidate |
| POST | `/api/candidates/bulk/` | Body `{"candidates":[...]}` — used by the Bulk Scan tab's "Add all"; silently skips duplicate emails |
| DELETE | `/api/candidates/clear/` | Wipe the whole pool |
| GET | `/api/candidates/export_csv/` | Server-side CSV export (the frontend also still has its own client-side export button, which still works standalone) |

Everything returns/accepts JSON with the same camelCase keys your JS
already uses, so `app.js` didn't need any data-mapping code.

## Run it locally

```bash
cd aarti_talentforge_backend      # (or wherever you unzip this)
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser  # optional, for /admin/
python manage.py runserver
```

Open **http://127.0.0.1:8000/** — that's your whole app: Django serves the
original `index.html`, its CSS/JS, and the API, all from one server. No
separate frontend server, no CORS setup needed.

`/admin/` gives you a ready-made Django admin screen to view/edit
candidates directly in the database if you ever need to.

## Notes on what deliberately did NOT change

- **Scoring stays client-side.** The 14 department profiles and the 8‑
  dimension scoring engine are still plain JavaScript in `app.js`, exactly
  as before — that's inherent to the app being an instant, no-upload
  resume scanner. Django's job here is candidate *persistence*, not
  re-scoring resumes server-side.
- **No login screen was added.** Your original frontend has no auth UI, and
  adding one would mean changing the frontend, which you asked me not to
  do. The API currently has `AllowAny` permissions — fine for an internal
  tool on a trusted network, but before exposing this outside your LAN/VPN
  you'll want to add authentication (Django's session auth + a login page,
  or DRF's `TokenAuthentication`) — happy to add that next if you want it.
- **SQLite by default** (`db.sqlite3`), so it runs with zero setup. Swap
  `DATABASES` in `aarti_backend/settings.py` for Postgres/MySQL whenever
  you're ready for production — no other code needs to change.
- **PDF text extraction stays client-side** via pdf.js, same as before —
  resumes are never uploaded to the server, only the extracted
  name/email/phone/skills/score get saved once you click Save/Add.

## Deploying frontend and backend separately (optional)

If you ever want to host the frontend on GitHub Pages again and just point
it at a Django API hosted elsewhere, change one line in
`frontend/static/js/app.js`:

```js
const API_BASE = '/api/candidates/';
```

to your deployed API's full URL, e.g.:

```js
const API_BASE = 'https://your-api-domain.com/api/candidates/';
```

`django-cors-headers` is already installed and configured permissively for
this scenario.
