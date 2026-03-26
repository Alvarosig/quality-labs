# Quality Labs – Test Architecture & Quality Engineering Lab

[![CI](https://github.com/Alvarosig/quality-labs/actions/workflows/ci.yml/badge.svg)](https://github.com/Alvarosig/quality-labs/actions/workflows/ci.yml)

Engineering-focused test automation project demonstrating **API testing**, **E2E testing**, and **BDD strategies** applied to a real-world application.

This project goes beyond writing tests — it focuses on building **reliable, scalable and maintainable test systems**, using patterns commonly found in production environments.

---

## Why this project exists

Modern test automation is not just about validating features — it's about ensuring **reliability, speed and confidence in delivery**.

This project explores real-world QA engineering practices such as:

- deterministic test execution through **data isolation**
- **API-driven setup** for faster and more stable tests
- separation between API and E2E layers
- **cross-layer validation strategies**
- maintainable test architecture using **Page Object Model**

The goal is to simulate how high-quality test suites are structured in real production systems.

---

## What makes this project different

Unlike basic automation projects, this focuses on:

- **Data isolation** — each test runs independently, eliminating flaky behavior
- **API-first strategy** — most validations happen at the API layer for speed and reliability
- **Cross-layer validation** — UI actions are validated via API
- **Test architecture** — structured layers and Page Object Model
- **Real-world patterns** — practices used in professional QA environments

---

## Target application

|              | URL                                       |
| ------------ | ----------------------------------------- |
| **Frontend** | https://conduit.bondaracademy.com         |
| **API**      | https://conduit-api.bondaracademy.com/api |

---

## Tech stack

- **Playwright** — E2E browser tests + API tests
- **k6** — Performance testing (smoke, load, stress)
- **Cucumber.js** — BDD with Gherkin (proof of concept)
- **TypeScript** — Strong typing and maintainability
- **Docker** — Self-contained Conduit API for CI (Go/Gin + SQLite, hosted on ghcr.io)
- **GitHub Actions** — Tiered CI pipeline (API on every push, E2E + performance nightly)

---

## Test coverage

This project validates both **business logic and system behavior across layers**:

- **Authentication flows** — positive and negative scenarios, token validation
- **Article lifecycle** — create, update, delete, filtering and ownership rules
- **Comments system** — CRUD operations and cross-user permissions
- **Favorites system** — state persistence and user-specific views
- **Follow/Unfollow system** — relationship state and user-specific perspective
- **User profile update** — field persistence and round-trip validation
- **Performance** — smoke baseline, load stability, stress ceiling with findings

| Layer           | Tests                          |
| --------------- | ------------------------------ |
| **API**         | 36                             |
| **E2E**         | 6                              |
| **Performance** | 3 (smoke, load, stress)        |
| **BDD**         | 3 scenarios                    |
| **Total**       | 42 Playwright + 3 k6 + 3 BDD  |

---

## Project structure

```
quality-labs/
├── tests/
│   ├── config.ts                    # Shared URLs (single source of truth)
│   ├── api/                         # API tests (no browser, fast ~8s)
│   │   ├── helpers.ts               # Shared helpers: createUser, createArticle, authHeaders
│   │   ├── health.spec.ts           # Smoke checks (tags, articles list)
│   │   ├── auth.spec.ts             # Registration, login, token validation
│   │   ├── articles.spec.ts         # Full CRUD lifecycle + filters
│   │   ├── comments.spec.ts         # Comments CRUD + cross-user permissions
│   │   ├── favorites.spec.ts        # Favorite/unfavorite + state verification
│   │   ├── follow.spec.ts           # Follow/unfollow + perspective-aware state
│   │   └── profile.spec.ts          # PUT /api/user field updates + persistence
│   ├── e2e/                         # E2E browser tests (~19s)
│   │   ├── auth.spec.ts             # Sign up, sign in, error states
│   │   ├── articles.spec.ts         # Create, edit, delete articles via UI
│   │   └── pages/                   # Page Object Model
│   │       ├── SignUpPage.ts         # /register form
│   │       ├── SignInPage.ts         # /login form
│   │       ├── ArticleEditorPage.ts  # /editor form
│   │       └── ArticlePage.ts        # /article/:slug view
│   ├── performance/                 # k6 performance tests
│   │   ├── smoke.ts                 # Smoke: 1 VU, 30s — confirms API is alive
│   │   ├── load.ts                  # Load: 20 VUs, 2min — stability baseline
│   │   └── stress.ts                # Stress: ramp to 100 VUs — finds the ceiling
│   └── bdd/                         # BDD with Cucumber (proof of concept)
│       ├── features/
│       │   └── authentication.feature
│       ├── step-definitions/
│       │   └── auth.steps.ts
│       └── support/
│           ├── world.ts             # Shared context (browser, page, API)
│           └── hooks.ts             # Before/After scenario hooks
├── docker/
│   └── conduit-api.Dockerfile       # Multi-stage Alpine build for CI (Go/Gin + SQLite)
├── .github/
│   └── workflows/
│       └── ci.yml                   # Parallel api + e2e jobs, browser cache, Docker pull
├── playwright.config.ts             # Two projects: api + e2e
├── cucumber.js                      # Cucumber config
├── tsconfig.json
└── package.json
```

## HAR-driven API test generation

This project uses a workflow inspired by [Artem Bondar's article](https://bondaracademy.com/blog/generate-api-tests-with-ai-playwright) to generate API tests from real browser traffic — no need to read API docs manually.

**How it works:**

1. Run the E2E suite with HAR recording enabled — the browser captures every network request made during the tests
2. Run the converter script — strips noise (assets, headers, cookies) and keeps only the Conduit API calls (~400 lines from ~3000)
3. Feed the cleaned file to an AI with a short prompt — the HAR contains the real request/response shapes, so the AI generates accurate tests with no hallucination

```bash
# Step 1 — record HAR during E2E run
npx playwright test --project=e2e:har

# Step 2 — clean it down to API calls only
npm run har:convert

# Step 3 — feed filtered-har.json to an AI with this prompt:
# "Read this HAR and generate Playwright API tests following the
#  conventions in tests/api/ — one describe block, helpers from
#  helpers.ts, authHeaders for auth, one test per scenario."
```

The `output.har` and `filtered-har.json` files are gitignored — they are generated artifacts, not source files.

---

## How to run

```bash
# Install dependencies
npm install
npx playwright install chromium

# Run all Playwright tests (API + E2E)
npm test

# Run only API tests (fast feedback)
npm run test:api

# Run only E2E tests (browser)
npm run test:e2e

# Run BDD scenarios
npm run test:bdd

# Open HTML report
npm run report
```

## Architecture decisions

### Why separate API and E2E tests?

API tests run without a browser and provide fast feedback (~8s).
E2E tests validate real user flows in the browser.
This separation improves speed, clarity and maintainability.

### Why Page Object Model?

Without abstraction, UI changes break multiple tests.

With POM:

- locators are centralized
- maintenance is simplified
- tests become easier to read and scale

### Why create a user per test?

Parallel tests require isolation.

Shared data causes flaky behavior.
Each test generates its own user → no shared state → deterministic execution.

### Why plain helpers instead of Playwright fixtures?

Playwright offers a [custom fixtures](https://playwright.dev/docs/test-fixtures) API that can inject pre-built state directly into the `test` function signature. It is a powerful pattern — but it adds indirection that isn't justified here.

Plain helper functions were chosen because:

- **Transparency** — `const { token } = await createUser(request)` is explicit. Fixtures hide setup behind the `test` signature, which makes it harder to trace what state a test depends on.
- **Simplicity** — helpers are just functions. No fixture declaration, no `extend`, no merging configs. Less framework knowledge required to read and maintain them.
- **Flexibility** — some tests need one user, others need two or three. Fixtures work best when every test needs the same setup; helpers compose freely per test.
- **Right scope** — fixtures shine when setup is shared across files or requires browser-level lifecycle hooks. Here, setup is lightweight (HTTP calls) and per-test. A helper file is the right level of abstraction.

If the suite grows to the point where many tests across different files need identical pre-built state (e.g. an authenticated session with articles already created), migrating to fixtures would make sense then.

### Why seed data via API in E2E tests?

We already test the UI separately.

For E2E:

- we **set up data via API**
- we **validate behavior via UI**

This reduces test time and increases stability.

### Why run the API in Docker for CI and not locally?

The Conduit API (`conduit-api.bondaracademy.com`) is a shared public instance with no SLA. Running tests against it in CI introduces two risks: rate limiting from GitHub Actions shared IP ranges, and false negatives when the server is simply down.

The solution is to run a self-contained Conduit API container in CI, built from the [gothinkster/golang-gin-realworld-example-app](https://github.com/gothinkster/golang-gin-realworld-example-app) backend — a Go/Gin implementation that uses SQLite with no external database dependency.

The Docker image is:

- Built once manually and pushed to `ghcr.io/alvarosig/conduit-api:latest`
- Pulled by CI on every run using the built-in `GITHUB_TOKEN` — no secrets to manage
- A multi-stage Alpine build: ~30-50MB compressed, pulls in seconds on GitHub's infrastructure

Locally, tests keep hitting the hosted API as a fallback. `tests/config.ts` reads `API_URL` from the environment — CI sets it to `http://localhost:8080`, local runs don't set it so the hosted URL is used automatically.

E2E tests intentionally keep hitting the hosted frontend (`conduit.bondaracademy.com`) — pairing a different frontend implementation locally would risk locator mismatches and require rewriting all Page Objects for no real gain.

### Why Alpine for the API image and not a Node-based image?

The Go/Gin backend compiles to a single binary with no runtime dependencies beyond SQLite. Alpine (~5MB base) is the right fit: the final image is tiny and fast to pull.

Playwright and Chromium require Debian-based system libraries (`libnss`, `libglib`, `libatk`, etc.) that Alpine doesn't ship. The E2E and API test jobs use `ubuntu-latest` + `actions/setup-node` — the standard and officially recommended environment for Playwright.

### Why is CI tiered by trigger?

Not all tests are equal in cost, speed, and purpose. Running everything on every push would be slow, expensive, and noisy.

| Trigger | Jobs | Reasoning |
|---|---|---|
| Push / PR | API only | Fast feedback in seconds — catches most bugs before merge |
| Nightly (6am UTC) | API + E2E + Smoke + Load | Full confidence check while nobody is actively working |
| Manual (`workflow_dispatch`) | All including Stress | Pre-release validation or on-demand investigation |

This mirrors how professional teams structure CI: **fast gates on every change, deep validation on a schedule**.

### Why k6 for performance testing?

k6 scripts are written in TypeScript — no new language to learn. It runs as a standalone binary (not Node.js), has a clean CLI output with built-in threshold assertions, and integrates naturally into GitHub Actions via `grafana/setup-k6-action`.

Performance tests target the local Docker container, never the hosted API — load-testing someone else's server is bad practice regardless of the environment.

The three test types in order of usage:
- **Smoke** — 1 VU, 30s. Confirms the API responds before running heavier tests.
- **Load** — 20 VUs, 2min. p(95) = 52ms, 0% errors. Establishes the performance baseline.
- **Stress** — ramps to 100 VUs. p(95) = 1.23s, 1% errors. Revealed SQLite write contention above 50 concurrent users — expected limitation of the backend, not the test suite.

### Why BDD is just a proof of concept?

BDD adds a second abstraction layer.

It’s useful when:

- non-technical stakeholders read scenarios

For this project:

- included as proof of knowledge
- not used as primary testing strategy

## Key patterns demonstrated

| Pattern                 | Where                   | What it shows                                      |
| ----------------------- | ----------------------- | -------------------------------------------------- |
| Shared test helpers     | `api/helpers.ts`        | Reusable setup functions without fixture overhead  |
| Data isolation          | Every test file         | Unique users/data per test, zero shared state      |
| API seeding for E2E     | `e2e/articles.spec.ts`  | Create data via API, test interactions via UI      |
| localStorage auth       | `e2e/articles.spec.ts`  | Skip login UI by setting JWT directly              |
| Parent-child resources  | `api/comments.spec.ts`  | Setting up articles before testing comments        |
| State toggle testing    | `api/favorites.spec.ts` | Favorite/unfavorite and verify count changes       |
| Cross-user permissions  | `api/comments.spec.ts`  | User A creates, User B can't delete                |
| Perspective-aware state | `api/favorites.spec.ts` | Same article shows different `favorited` per user  |
| Cross-layer assertions  | `e2e/articles.spec.ts`  | Delete via UI, verify gone via API                 |
| Page Object Model       | `e2e/pages/`            | Centralized locators, one file per page            |
| Dockerized API for CI   | `docker/`, `ci.yml`     | Self-contained test environment, no external deps  |
| Env-based API URL       | `tests/config.ts`       | Same tests run locally (hosted) and in CI (Docker) |
| Tiered CI pipeline      | `ci.yml`                | API on every push, E2E + perf nightly or on demand |
| k6 smoke baseline       | `performance/smoke.ts`  | Threshold assertions on response time + error rate |

## What I learned building this

- **Data isolation is the foundation** — every other pattern depends on it. Without independent tests, nothing works reliably.
- **API tests should be the bulk of your suite** (speed + coverage)
- **E2E tests should validate critical flows, not everything**
- **BDD looks clean in theory** but adds maintenance overhead when you're the only one reading the feature files.
- **Flaky tests are almost always a data isolation problem**, not a timing problem.
- **Performance testing requires owning the environment** — never load-test someone else's server.
- **Tiered CI is a discipline, not a configuration** — fast feedback on every push, deep validation on a schedule.

## Deliberate scope decisions

These are things that were **intentionally not included** — with reasons.

### Why no unit tests?

Unit tests belong to the team that owns the source code. This project tests the **Conduit API as a consumer** — the same position a QA engineer holds in a real team. Writing unit tests for third-party code would be testing the wrong thing at the wrong layer.

The API tests here are effectively **integration tests**: they make real HTTP calls against a real running server and validate behavior end-to-end. That is the correct responsibility boundary for a QA engineer who doesn't own the implementation.

### Why no contract tests?

Contract testing (e.g. with Pact) verifies that the API contract between a provider and consumer doesn't break silently. It's a powerful pattern — but it requires both sides of the contract to be under your control or your organization's control.

Since Conduit is a third-party application, there is no provider team to publish a pact to. Contract testing is listed as a future direction below — it becomes relevant when testing internal microservices where both producer and consumer are owned by the same team.

---

## Next steps

- [x] **Performance testing with k6** — smoke test running, load/stress tests planned
- [x] **CI/CD with GitHub Actions** — tiered pipeline: API on every push, E2E + perf nightly
- [x] **Follow/unfollow API tests** — user profile relationship testing
- [x] **User profile update API tests** — PUT /api/user
- [x] **Load and stress tests** — 20 VUs baseline + 100 VUs stress, SQLite ceiling identified
- [ ] **More E2E flows** — navigation, user profile, tags filtering
- [ ] **Observability** — export k6 metrics to Grafana for visual performance dashboards
- [ ] **Contract testing with Pact** — relevant when testing internal microservices with owned provider/consumer
- [ ] **Jenkins integration** — CI orchestration for enterprise environments or self-hosted runners
- [ ] **QA Playground challenges** — bonus section for tricky UI automation (shadow DOM, iframes, drag-and-drop)

---

## Final note

This project reflects a shift from traditional QA toward Quality Engineering — where the goal is not only to find bugs, but to improve system reliability, test strategy and delivery confidence.

## Author

**Álvaro** — QA Engineer building automation skills through practice.
