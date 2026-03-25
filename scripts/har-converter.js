/**
 * HAR Converter — strips noise from a recorded HAR file and keeps only
 * Conduit API calls, ready to feed into an AI for test generation.
 *
 * Usage:
 *   node scripts/har-converter.js                        # default paths
 *   node scripts/har-converter.js my.har out.json        # custom paths
 *
 * Workflow:
 *   1. Record a HAR during an E2E test run (see README)
 *   2. Run this script to filter + clean it
 *   3. Feed the output JSON to an AI with a prompt like:
 *      "Read this HAR and generate Playwright API tests following the
 *       conventions in tests/api/ — one describe block, helpers from
 *       helpers.ts, authHeaders for auth, one test per scenario."
 */

import { readFileSync, writeFileSync } from 'fs';

const [,, inputFile = 'output.har', outputFile = 'filtered-har.json'] = process.argv;

function convertHar(inputFilename, outputFilename) {
  const harObject = JSON.parse(readFileSync(inputFilename, 'utf8'));

  harObject.log.entries = harObject.log.entries
    .filter((entry) => {
      const url = entry.request.url;
      return (
        url.includes('conduit-api.bondaracademy.com') &&
        !url.match(/\.(jpeg|jpg|png|gif|svg|ico|css|js|woff|woff2)$/i)
      );
    })
    .map((entry) => {
      if (entry.request) {
        entry.request.headers = [];
        delete entry.request.cookies;
        delete entry.request.httpVersion;
        delete entry.request.headersSize;
        delete entry.request.bodySize;
      }

      if (entry.response) {
        entry.response.headers = [];
        delete entry.response.cookies;
        delete entry.response.httpVersion;
        delete entry.response.statusText;
        delete entry.response.headersSize;
        delete entry.response.bodySize;
        delete entry.response.redirectURL;
      }

      delete entry.cache;
      delete entry.timings;

      return entry;
    });

  writeFileSync(outputFilename, JSON.stringify(harObject, null, 2), 'utf8');
  console.log(`Done. ${harObject.log.entries.length} API entries saved to: ${outputFilename}`);
}

convertHar(inputFile, outputFile);
