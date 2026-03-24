# Quality Labs

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
- **Cucumber.js** — BDD with Gherkin (proof of concept)
- **TypeScript** — Strong typing and maintainability
- **GitHub Actions** — CI/CD (planned)

---

## Test coverage

This project validates both **business logic and system behavior across layers**:

- **Authentication flows** — positive and negative scenarios, token validation
- **Article lifecycle** — create, update, delete, filtering and ownership rules
- **Comments system** — CRUD operations and cross-user permissions
- **Favorites system** — state persistence and user-specific views

| Layer     | Tests                 |
| --------- | --------------------- |
| **API**   | 24                    |
| **E2E**   | 6                     |
| **BDD**   | 3 scenarios           |
| **Total** | 30 Playwright + 3 BDD |

---

## Project structure

```
quality-labs/
├── tests/
│   ├── config.ts                    # Shared URLs (single source of truth)
│   ├── api/                         # API tests (no browser, fast ~8s)
│   │   ├── health.spec.ts           # Smoke checks (tags, articles list)
│   │   ├── auth.spec.ts             # Registration, login, token validation
│   │   ├── articles.spec.ts         # Full CRUD lifecycle + filters
│   │   ├── comments.spec.ts         # Comments CRUD + cross-user permissions
│   │   └── favorites.spec.ts        # Favorite/unfavorite + state verification
│   ├── e2e/                         # E2E browser tests (~19s)
│   │   ├── auth.spec.ts             # Sign up, sign in, error states
│   │   ├── articles.spec.ts         # Create, edit, delete articles via UI
│   │   └── pages/                   # Page Object Model
│   │       ├── SignUpPage.ts         # /register form
│   │       ├── SignInPage.ts         # /login form
│   │       ├── ArticleEditorPage.ts  # /editor form
│   │       └── ArticlePage.ts        # /article/:slug view
│   └── bdd/                         # BDD with Cucumber (proof of concept)
│       ├── features/
│       │   └── authentication.feature
│       ├── step-definitions/
│       │   └── auth.steps.ts
│       └── support/
│           ├── world.ts             # Shared context (browser, page, API)
│           └── hooks.ts             # Before/After scenario hooks
├── playwright.config.ts             # Two projects: api + e2e
├── cucumber.js                      # Cucumber config
├── tsconfig.json
└── package.json
```

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

### Why seed data via API in E2E tests?

We already test the UI separately.

For E2E:

- we **set up data via API**
- we **validate behavior via UI**

This reduces test time and increases stability.

### Why BDD is just a proof of concept?

BDD adds a second abstraction layer.

It’s useful when:

- non-technical stakeholders read scenarios

For this project:

- included as proof of knowledge
- not used as primary testing strategy

## Key patterns demonstrated

| Pattern                 | Where                   | What it shows                                     |
| ----------------------- | ----------------------- | ------------------------------------------------- |
| Data isolation          | Every test file         | Unique users/data per test, zero shared state     |
| API seeding for E2E     | `e2e/articles.spec.ts`  | Create data via API, test interactions via UI     |
| localStorage auth       | `e2e/articles.spec.ts`  | Skip login UI by setting JWT directly             |
| Parent-child resources  | `api/comments.spec.ts`  | Setting up articles before testing comments       |
| State toggle testing    | `api/favorites.spec.ts` | Favorite/unfavorite and verify count changes      |
| Cross-user permissions  | `api/comments.spec.ts`  | User A creates, User B can't delete               |
| Perspective-aware state | `api/favorites.spec.ts` | Same article shows different `favorited` per user |
| Cross-layer assertions  | `e2e/articles.spec.ts`  | Delete via UI, verify gone via API                |
| Page Object Model       | `e2e/pages/`            | Centralized locators, one file per page           |

## What I learned building this

- **Data isolation is the foundation** — every other pattern depends on it. Without independent tests, nothing works reliably.
- **API tests should be the bulk of your suite** (speed + coverage)
- **E2E tests should validate critical flows, not everything**
- **BDD looks clean in theory** but adds maintenance overhead when you're the only one reading the feature files.
- **Flaky tests are almost always a data isolation problem**, not a timing problem.

## Next steps

- [ ] **Performance testing with k6** — run Conduit backend locally via Docker, then write smoke/load/stress tests
- [ ] **More E2E flows** — navigation, user profile, tags filtering
- [ ] **CI/CD with GitHub Actions** — run the full suite on every push
- [ ] **Follow/unfollow API tests** — user profile relationship testing
- [ ] **User profile update API tests** — PUT /api/user
- [ ] **QA Playground challenges** — bonus section for tricky UI automation (shadow DOM, iframes, drag-and-drop)

## Final note

This project reflects a shift from traditional QA toward Quality Engineering — where the goal is not only to find bugs, but to improve system reliability, test strategy and delivery confidence.

## Author

**Álvaro** — QA Engineer building automation skills through practice.
