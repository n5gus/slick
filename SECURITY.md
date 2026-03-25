# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within Project Slick, please do not
disclose it publicly. Instead, report it privately to the maintainers at
`security@manbearbull.capital`. Include a description of the issue, steps to
reproduce, and any relevant logs or screenshots. We will acknowledge receipt
within 48 hours and aim to issue a fix or mitigation within 7 days for
critical issues.

---

## Security Best Practices for Project Slick

### 1. Secret Management

Credentials required by Slick (wallet address, private key, Gemini API key,
database URL) are managed through a `.env` file loaded at runtime via
`pydantic-settings`.

- **Critical**: Never commit a real `.env` file to version control. The
  `.gitignore` and `.dockerignore` both exclude `.env` — verify this is
  intact before every deploy.
- **`.env.example` reference fields** (do not use real values):
  ```
  HYPERLIQUID_API_WALLET_ADDRESS=
  HYPERLIQUID_SECRET=
  GEMINI_API_KEY=
  DRY_RUN=true
  DATABASE_URL=postgresql://postgres:postgres@timescale:5432/slick_ts
  ```
- **`DRY_RUN` flag**: The `.env.example` ships with `DRY_RUN=true`. This
  must be explicitly set to `false` in production. Treat any deployment
  where `DRY_RUN` is absent or ambiguous as potentially live.
- **Recommended**: For production, migrate secrets to a dedicated secrets
  manager (e.g., Google Cloud Secret Manager, AWS Secrets Manager, or
  HashiCorp Vault) and inject them as environment variables at runtime
  rather than using a file.
- **Hardening**: Apply the Principle of Least Privilege — each service
  account or API key should only have the permissions it strictly needs.

---

### 2. API Authentication

The agent endpoints (`POST /sentinel/trigger`,
`POST /orchestrator/tasks/send`) are currently unauthenticated. Any actor
who can reach port 8000 can trigger a real leveraged trade.

- **Critical**: Protect all trade-triggering endpoints with a shared secret
  API key validated on every request (e.g., an `X-API-Key` header checked
  via a FastAPI `Depends` dependency).
- **Production**: Port 8000 should never be publicly exposed. Route all
  external traffic through an nginx reverse proxy and keep the backend
  reachable only on the internal Docker network (`slick-net`).
- **Recommended**: Add rate limiting to agent endpoints (e.g., via
  `slowapi`) to prevent trade spam or Gemini API quota exhaustion from
  repeated or abusive requests.

---

### 3. Cross-Origin Resource Sharing (CORS)

`main.py` restricts `allow_origins` to `https://slicktrader.xyz` and
localhost ports — this is correct.

- **Remaining concern**: `allow_methods=["*"]` and `allow_headers=["*"]`
  are still overly permissive.
- **Recommended**: Scope these down to only what the frontend actually uses,
  for example:
  ```python
  allow_methods=["GET", "POST"],
  allow_headers=["Content-Type", "X-API-Key"],
  ```

---

### 4. Dashboard & Frontend Access Control

The dashboard at `/dashboard` is currently public.

- **Recommended**: Add an authentication layer (e.g., NextAuth, Auth0, or
  a simple JWT-based login) to restrict access to live trading metrics,
  agent status, and equity data.
- **Network level**: Restrict direct backend access to the frontend
  container's IP, or use a VPC to isolate the backend from public traffic
  entirely.

---

### 5. Trade Execution Security

- **Wallet permissions**: The `HYPERLIQUID_API_WALLET_ADDRESS` / 
  `HYPERLIQUID_SECRET` keypair used by `hyperliquid-operator` should have
  **Trade** and **View** permissions only. Withdrawal permissions must be
  disabled.
- **`DRY_RUN` gate**: Confirm `DRY_RUN=false` is intentional before any
  production deployment. Prefer making `false` an explicit opt-in rather
  than a default.
- **Slippage and size limits**: The `hyperliquid-operator` subprocess should
  enforce strict slippage tolerances and maximum position sizes to limit
  execution risk during high volatility.
- **Auto-trader loop**: The background `background_trader()` task in
  `main.py` runs with no circuit breaker. Consider a maximum daily loss
  limit or a trade-count cap that halts the loop and pages an operator
  before resuming.

---

### 6. Input Validation & Prompt Injection

The Sentinel agent receives externally scraped browser content and passes
it to Gemini 3.1 Pro. Gemini's conviction score directly controls whether a
live trade fires. A malicious actor who can influence what the browser agent
scrapes could craft a "news headline" payload that manipulates the AI's
output — a form of prompt injection.

- **Recommended**: Validate all incoming Sentinel payloads strictly with
  Pydantic models, including explicit `max_length` constraints on any
  free-text or artifact fields.
- **Hardening**: Harden the Gemini system prompt to instruct the model to
  treat all scraped content as untrusted user input and to ignore any
  embedded instructions. The system prompt itself should not be stored
  publicly in `GEMINI.md`.
- **Treat conviction scores as signals, not commands**: Consider requiring
  multiple consecutive high-conviction signals before executing a trade,
  to reduce the impact of a single injected result.

---

### 7. Container & Infrastructure Hardening

**Docker image (Dockerfile)**

- **Run as non-root**: The current `Dockerfile` has no `USER` directive,
  meaning the process runs as root inside the container. Add a non-root
  user before the `CMD`:
  ```dockerfile
  RUN useradd --no-create-home --shell /bin/false appuser
  USER appuser
  ```
- **Pin image tags**: Base images (`ghcr.io/astral-sh/uv`, the Python base)
  use `latest` or floating tags. Pin to specific version tags or SHA
  digests to prevent silent upstream changes from introducing
  vulnerabilities.

**docker-compose.yml**

- **Database credentials**: `POSTGRES_USER: postgres` /
  `POSTGRES_PASSWORD: postgres` are hardcoded default credentials. Replace
  with strong, unique values sourced from `.env`:
  ```yaml
  POSTGRES_USER: ${DB_USER}
  POSTGRES_PASSWORD: ${DB_PASSWORD}
  ```
  Create a restricted database user with only the permissions the app
  needs (SELECT, INSERT, UPDATE on specific tables — not superuser).
- **Database port exposure**: `5432:5432` publishes the TimescaleDB port
  to the host. In production, remove this port mapping. The backend
  connects to the database via Docker's internal DNS (`timescale:5432`)
  and does not need the port exposed externally.

---

### 8. Dependency & Supply Chain Security

- **Backend**: Run `uv lock` and review the lockfile (`uv.lock`) regularly.
  The `hyperliquid-operator` is an editable local package — treat it as
  first-party code subject to the same security review.
- **Frontend**: Run `npm audit` in the `frontend/` directory regularly to
  identify vulnerable npm dependencies.
- **Dependabot**: Enable GitHub Dependabot for automated vulnerability
  alerts on both the Python and npm dependency graphs.
- **Secret scanning**: Add a GitHub Actions workflow to scan for
  accidentally committed secrets on every push and pull request:
  ```yaml
  # .github/workflows/secret-scan.yml
  name: Secret Scan
  on: [push, pull_request]
  jobs:
    gitleaks:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
          with:
            fetch-depth: 0
        - uses: gitleaks/gitleaks-action@v2
  ```

---
