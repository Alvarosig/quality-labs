/**
 * Stress Test
 *
 * Purpose: push the API beyond normal load to find its breaking point.
 * Unlike the load test, degradation is expected. The goal is to observe
 * at what point the API struggles and whether it recovers.
 *
 * Shape:
 *   0–30s   → ramp to 20 users  (normal load)
 *   30–60s  → ramp to 50 users  (above normal)
 *   60–90s  → ramp to 100 users (stress)
 *   90–120s → hold at 100 users (sustained stress)
 *   120–150s→ ramp down to 0    (recovery)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

const BASE_URL: string = __ENV.BASE_URL || 'http://localhost:8080/api';

export const options: Options = {
  stages: [
    { duration: '30s', target: 20  }, // warm up — normal load
    { duration: '30s', target: 50  }, // ramp above normal
    { duration: '30s', target: 100 }, // ramp to stress level
    { duration: '30s', target: 100 }, // hold — sustained stress
    { duration: '30s', target: 0   }, // ramp down — recovery check
  ],
  thresholds: {
    // more lenient than load — we expect some slowdown under stress
    http_req_duration: ['p(95)<2000'],
    // allow up to 5% errors under extreme load
    http_req_failed: ['rate<0.05'],
    // checks should still pass at least 95% of the time
    checks: ['rate>0.95'],
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
        email: `stress-${uid}@quality-labs.com`,
        password: 'SecurePass123!',
        username: `qa-stress-${uid}`.slice(0, 20),
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

  // Browse articles — simulates read-heavy traffic
  const articlesRes = http.get(`${BASE_URL}/articles?limit=10`, { headers });

  check(articlesRes, {
    'articles: status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // Create article — write operation under stress
  const createRes = http.post(
    `${BASE_URL}/articles`,
    JSON.stringify({
      article: {
        title: `Stress Test ${uid}`,
        description: 'Created by k6 stress test',
        body: 'Stress test content.',
        tagList: ['k6', 'stress'],
      },
    }),
    { headers: authHeaders }
  );

  check(createRes, {
    'create article: status 201': (r) => r.status === 201,
  });

  sleep(1);
}
