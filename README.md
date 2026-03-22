# Quality Labs

A QA portfolio project showcasing **API testing**, **E2E testing**, and **BDD** against the [Conduit (RealWorld)](https://github.com/gothinkster/realworld) application — a Medium.com clone with full CRUD, authentication, comments, favorites, and user profiles.

## Why this project exists

I'm building this to practice and demonstrate real-world test automation skills. The goal is not just writing tests, but understanding **why** they're structured the way they are — data isolation, Page Object Model, API seeding for E2E, cross-layer assertions, and resource relationship testing.

## Target application

|              | URL                                       |
| ------------ | ----------------------------------------- |
| **Frontend** | https://conduit.bondaracademy.com         |
| **API**      | https://conduit-api.bondaracademy.com/api |

## Tech stack

- **Playwright** — E2E browser tests + API tests (single framework, two projects)
- **Cucumber.js** — BDD with Gherkin (proof of concept)
- **TypeScript** — All test code
- **GitHub Actions** — CI/CD (planned)

## Test coverage

| Layer     | Tests                 | What's covered                                                                                                                                                                            |
| --------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API**   | 24                    | Auth (register, login, token, 401, duplicates), Articles CRUD + filters, Comments (create, list, delete, cross-user permissions), Favorites (toggle, multi-user count, state persistence) |
| **E2E**   | 6                     | Sign up, Sign in, error handling, Article create/edit/delete via UI                                                                                                                       |
| **BDD**   | 3 scenarios           | Authentication flows as Gherkin specs (proof of concept)                                                                                                                                  |
| **Total** | 30 Playwright + 3 BDD |

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

### Why two Playwright projects?

API tests don't need a browser — they're pure HTTP calls via Playwright's `request` context. E2E tests launch Chromium. Separating them means `npm run test:api` gives fast feedback (~8s for 24 tests), while `npm run test:e2e` validates the actual UI.

### Why Page Object Model?

If 10 tests reference `page.getByPlaceholder('Email')` and the placeholder changes, you fix 10 files. With a POM, you fix one. Each page object maps to one real page in the app — `SignUpPage` for `/register`, `SignInPage` for `/login`, etc.

### Why create a user per test?

Tests run in parallel. If Test A and Test B share a user, one might delete data the other needs — causing flaky failures that aren't real bugs. Each test creates its own unique user with `Date.now()` + random string, uses it, and never touches another test's data.

### Why seed data via API in E2E tests?

The login E2E test creates its user via API (`request.post('/api/users')`), not through the registration UI. Why? Because we already tested registration in a separate test. For the login test, we just need a user to **exist** — the fastest way is the API. This is a standard pattern: **set up via API, test via UI**.

### Why BDD is just a proof of concept?

In practice, BDD adds a second layer of code (feature files + step definitions) that does the same thing as Playwright specs. It makes sense when product owners actively read and write Gherkin scenarios. For a personal project, the overhead isn't worth it — but having it proves I know how to set it up.

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
- **API tests should be the bulk of your suite** — they're 10x faster and catch most bugs. E2E tests are for validating critical user flows, not for testing every edge case.
- **The "set up via API, test via UI" pattern** saves massive time. I didn't know this was standard practice in companies before this project.
- **BDD looks clean in theory** but adds maintenance overhead when you're the only one reading the feature files.
- **Flaky tests are almost always a data isolation problem**, not a timing problem.

## Next steps

- [ ] **Performance testing with k6** — run Conduit backend locally via Docker, then write smoke/load/stress tests
- [ ] **More E2E flows** — navigation, user profile, tags filtering
- [ ] **CI/CD with GitHub Actions** — run the full suite on every push
- [ ] **Follow/unfollow API tests** — user profile relationship testing
- [ ] **User profile update API tests** — PUT /api/user
- [ ] **QA Playground challenges** — bonus section for tricky UI automation (shadow DOM, iframes, drag-and-drop)

## Author

**Álvaro** — QA Engineer building automation skills through practice.
