import { readFile } from 'node:fs/promises';

import { JSDOM } from 'jsdom';

const FIX_SCOPE = '[FIX:browser-hardening]';
const EXPECTED_DIRECTIVES = new Set([
  "default-src 'self'",
  "base-uri 'none'",
  "connect-src 'self'",
  "font-src 'self'",
  "form-action 'none'",
  "frame-src 'none'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
]);
const FORBIDDEN_SOURCE_EXPRESSIONS = ["'unsafe-inline'", "'unsafe-eval'", '*'];

function log(level, message, context = {}) {
  const write = level === 'ERROR' ? console.error : console.info;
  write(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      scope: FIX_SCOPE,
      message,
      ...context,
    }),
  );
}

try {
  const html = await readFile('dist/index.html', 'utf8');
  const document = new JSDOM(html).window.document;
  const policyElements = [...document.querySelectorAll('meta[http-equiv]')].filter(
    (element) => element.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy',
  );
  const referrerElements = [...document.querySelectorAll('meta[name]')].filter(
    (element) => element.getAttribute('name')?.toLowerCase() === 'referrer',
  );

  log('INFO', 'Production browser policy validation started', {
    contentSecurityPolicyCount: policyElements.length,
    referrerPolicyCount: referrerElements.length,
  });

  if (policyElements.length !== 1) {
    throw new Error(`Expected one CSP meta element, found ${policyElements.length}.`);
  }

  if (referrerElements.length !== 1) {
    throw new Error(`Expected one referrer meta element, found ${referrerElements.length}.`);
  }

  const contentSecurityPolicy = policyElements[0].getAttribute('content') ?? '';
  const directives = new Set(
    contentSecurityPolicy
      .split(';')
      .map((directive) => directive.trim())
      .filter(Boolean),
  );
  const missingDirectives = [...EXPECTED_DIRECTIVES].filter(
    (directive) => !directives.has(directive),
  );
  const forbiddenExpressions = FORBIDDEN_SOURCE_EXPRESSIONS.filter((expression) =>
    contentSecurityPolicy.includes(expression),
  );

  if (directives.size !== EXPECTED_DIRECTIVES.size || missingDirectives.length > 0) {
    throw new Error(
      `CSP directives differ from the hardened policy: ${JSON.stringify({ missingDirectives, directives: [...directives] })}`,
    );
  }

  if (forbiddenExpressions.length > 0) {
    throw new Error(
      `CSP contains forbidden source expressions: ${forbiddenExpressions.join(', ')}.`,
    );
  }

  const referrerPolicy = referrerElements[0].getAttribute('content');
  if (referrerPolicy !== 'strict-origin-when-cross-origin') {
    throw new Error(`Unexpected referrer policy: ${String(referrerPolicy)}.`);
  }

  log('INFO', 'Production browser policy validation passed', {
    directiveCount: directives.size,
    referrerPolicy,
  });
} catch (error) {
  log('ERROR', 'Production browser policy validation failed', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
}
