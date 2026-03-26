/**
 * Load Test
 *
 * Purpose: validate API stability under realistic concurrent traffic.
 * Establishes a performance baseline — if future changes cause degradation,
 * this test catches it.
 *
 * Shape:
 *   0–30s   → ramp from 0 to 20 virtual users
 *   30–90s  → hold at 20 virtual users
 *   90–120s → ramp down to 0
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

const BASE_URL: string = __ENV.BASE_URL || 'http://localhost:8080/api';

export const options: Options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up to 20 users
    { duration: '60s', target: 20 }, // hold at 20 users
    { duration: '30s', target: 0 },  // ramp down
  ],
  thresholds: {
    // 95% of requests must respond within 800ms under load
    http_req_duration: ['p(95)<800'],
    // error rate must stay below 1%
    http_req_failed: ['rate<0.01'],
    // all checks must pass at least 99% of the time
    checks: ['rate>0.99'],
  },
};

function randomUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function (): void {
  const uid = randomUid();
  const headers = { 'Content-Type': 'application/json' };

  const registerRes = http.post(
    `${BASE_URL}/users`,
    JSON.stringify({
      user: {
        email: `load-${uid}@quality-labs.com`,
        password: 'SecurePass123!',
        username: `qa-load-${uid}`.slice(0, 20),
      },
    }),
    { headers }
  );

  check(registerRes, {
    'register: status 201': (r) => r.status === 201,
  });

  const token = registerRes.json('user.token') as string;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };

  sleep(0.5);

  // Browse public articles, most common real-world request
  const articlesRes = http.get(`${BASE_URL}/articles?limit=10`, { headers });

  check(articlesRes, {
    'articles: status 200': (r) => r.status === 200,
    'articles: returns array': (r) => Array.isArray(r.json('articles')),
  });

  sleep(0.5);

  const createRes = http.post(
    `${BASE_URL}/articles`,
    JSON.stringify({
      article: {
        title: `Load Test ${uid}`,
        description: 'Created by k6 load test',
        body: 'Load test content.',
        tagList: ['k6', 'load'],
      },
    }),
    { headers: authHeaders }
  );

  check(createRes, {
    'create article: status 201': (r) => r.status === 201,
  });

  const slug = createRes.json('article.slug') as string;

  sleep(0.5);

  const getRes = http.get(`${BASE_URL}/articles/${slug}`, { headers });

  check(getRes, {
    'get article: status 200': (r) => r.status === 200,
  });

  sleep(1);
}
