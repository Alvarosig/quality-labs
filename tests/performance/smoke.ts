/**
 * Smoke Test
 *
 * Purpose: confirm the API is alive and responding correctly under minimal load.
 * Run before load/stress tests — if smoke fails, no point going further.
 *
 * 1 virtual user, 30 seconds.
 *
 * Run: k6 run tests/performance/smoke.ts
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

const BASE_URL: string = __ENV.BASE_URL || 'http://localhost:8080/api';

export const options: Options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    // 100% of requests must complete successfully
    http_req_failed: ['rate<0.01'],
    // 95% of requests must respond within 500ms
    http_req_duration: ['p(95)<500'],
  },
};

function randomUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function (): void {
  const uid = randomUid();
  const headers = { 'Content-Type': 'application/json' };

  // 1 — Register a new user
  const registerRes = http.post(
    `${BASE_URL}/users`,
    JSON.stringify({
      user: {
        email: `smoke-${uid}@quality-labs.com`,
        password: 'SecurePass123!',
        username: `qa-smoke-${uid}`.slice(0, 20),
      },
    }),
    { headers }
  );

  check(registerRes, {
    'register: status 201': (r) => r.status === 201,
    'register: has token': (r) => r.json('user.token') !== '',
  });

  const token = registerRes.json('user.token') as string;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };

  sleep(0.5);

  // 2 — Get public articles list
  const articlesRes = http.get(`${BASE_URL}/articles?limit=10`, { headers });

  check(articlesRes, {
    'articles: status 200': (r) => r.status === 200,
    'articles: returns array': (r) => Array.isArray(r.json('articles')),
  });

  sleep(0.5);

  // 3 — Create an article
  const createRes = http.post(
    `${BASE_URL}/articles`,
    JSON.stringify({
      article: {
        title: `Smoke Test ${uid}`,
        description: 'Created by k6 smoke test',
        body: 'Performance test content.',
        tagList: ['k6', 'smoke'],
      },
    }),
    { headers: authHeaders }
  );

  check(createRes, {
    'create article: status 201': (r) => r.status === 201,
    'create article: has slug': (r) => r.json('article.slug') !== '',
  });

  const slug = createRes.json('article.slug') as string;

  sleep(0.5);

  // 4 — Get the created article
  const getRes = http.get(`${BASE_URL}/articles/${slug}`, { headers });

  check(getRes, {
    'get article: status 200': (r) => r.status === 200,
    'get article: correct slug': (r) => r.json('article.slug') === slug,
  });

  sleep(1);
}
