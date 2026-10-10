require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { chromium } = require('playwright-core');
const { detectContext } = require('./contextDetector');
const { buildPayload } = require('./payloads');

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
const BROWSERLESS_ENDPOINT = `wss://production-sfo.browserless.io?token=${BROWSERLESS_TOKEN}`;

fastify.register(cors, {
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

const ALLOWED_HOSTS = [
  'xss-scanner-demo-app.vercel.app',
  'xss-scanner-demo.vercel.app',
  'localhost',
  '127.0.0.1',
];

async function isDnsVerified(hostname, clerkUserId) {
  return false;
}

async function isTargetAllowed(targetUrl, clerkUserId) {
  let hostname;
  try {
    hostname = new URL(targetUrl).hostname;
  } catch {
    return { allowed: false, reason: 'Invalid URL' };
  }

  if (ALLOWED_HOSTS.includes(hostname)) {
    return { allowed: true, source: 'allowlist' };
  }

  if (clerkUserId) {
    const verified = await isDnsVerified(hostname, clerkUserId);
    if (verified) return { allowed: true, source: 'dns' };
  }

  return {
    allowed: false,
    reason:
      'Only the bundled demo target is scannable on the hosted version. ' +
      'Self-host to scan your own sites.',
  };
}

async function getUserIdFromRequest(request) {
  return null;
}

function discoverParams(targetUrl, html) {
  const params = new Map();

  try {
    const u = new URL(targetUrl);
    for (const [key, value] of u.searchParams.entries()) {
      params.set(key, { name: key, source: 'query', value });
    }
  } catch {}

  const inputRegex = /<input[^>]*name=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = inputRegex.exec(html)) !== null) {
    const name = match[1];
    if (!params.has(name)) {
      params.set(name, { name, source: 'form', value: '' });
    }
  }

  if (params.size === 0) {
    params.set('q', { name: 'q', source: 'fallback', value: '' });
  }

  return Array.from(params.values());
}

async function detectParamContext(targetUrl, param, marker) {
  const contextUrl = new URL(targetUrl);
  contextUrl.searchParams.set(param.name, marker);

  try {
    const res = await fetch(contextUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 XSS-Scanner' },
      redirect: 'follow',
    });
    const html = await res.text();

    if (!html.includes(marker)) {
      return { reflected: false, context: 'unknown' };
    }

    const context = detectContext(html, marker);
    return { reflected: true, context };
  } catch (err) {
    return { reflected: false, context: 'unknown', error: err.message };
  }
}

async function testParamWithPayload(targetUrl, param, marker, context) {
  const { payload, description, triggersOnLoad } = buildPayload(context, marker);

  const testUrl = new URL(targetUrl);
  testUrl.searchParams.set(param.name, payload);

  try {
    const res = await fetch(testUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 XSS-Scanner' },
      redirect: 'follow',
    });
    const html = await res.text();
    const reflected = html.includes(marker);

    return {
      param: param.name,
      source: param.source,
      reflected,
      context,
      payload,
      payloadDescription: description,
      triggersOnLoad,
      testUrl: testUrl.toString(),
    };
  } catch (err) {
    return {
      param: param.name,
      source: param.source,
      reflected: false,
      context,
      error: err.message,
    };
  }
}

async function confirmExecution(testUrl, context) {
  let browser;
  try {
    browser = await chromium.connectOverCDP(BROWSERLESS_ENDPOINT);
    const browserContext = browser.contexts()[0] || (await browser.newContext());
    const page = await browserContext.newPage();

    let executed = false;
    page.on('dialog', async (dialog) => {
      executed = true;
      await dialog.dismiss().catch(() => {});
    });

    await page.goto(testUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    await page.waitForTimeout(1000);

    if (context === 'attribute' && !executed) {
      try {
        await page.evaluate(() => {
          document.querySelectorAll('*').forEach((el) => {
            el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          });
        });
        await page.waitForTimeout(500);
      } catch {}
    }

    if (context === 'url' && !executed) {
      try {
        await page.evaluate(() => {
          document.querySelectorAll('a[href^="javascript:"]').forEach((a) => a.click());
        });
        await page.waitForTimeout(500);
      } catch {}
    }

    await browser.close();
    return executed;
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    throw err;
  }
}

fastify.get('/', async () => {
  return { status: 'Scanner API is alive' };
});

fastify.post('/scan', async (request, reply) => {
  const { url } = request.body;
  if (!url) return reply.status(400).send({ error: 'URL is required' });

  const clerkUserId = await getUserIdFromRequest(request);

  const authResult = await isTargetAllowed(url, clerkUserId);
  if (!authResult.allowed) {
    return reply.status(403).send({
      error: 'Target not allowed',
      message: authResult.reason,
    });
  }

  try {
    const baselineRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 XSS-Scanner' },
    });
    const baselineHtml = await baselineRes.text();

    const params = discoverParams(url, baselineHtml);

    if (params.length === 0) {
      return {
        url,
        parametersTested: 0,
        findings: [],
        message: 'No parameters found to test.',
      };
    }

    const marker = 'xss_test_' + Date.now();
    const results = [];

    for (const param of params) {
      const { reflected, context } = await detectParamContext(url, param, marker);

      if (!reflected) {
        results.push({
          param: param.name,
          source: param.source,
          reflected: false,
          context: 'none',
        });
        continue;
      }

      const result = await testParamWithPayload(url, param, marker, context);
      results.push(result);
    }

    const findings = [];
    let browserUsed = false;

    for (const r of results) {
      if (!r.reflected) continue;

      let executed = false;
      let confirmError = null;

      if (!browserUsed) {
        try {
          executed = await confirmExecution(r.testUrl, r.context);
          browserUsed = true;
        } catch (err) {
          confirmError = err.message;
        }
      }

      findings.push({
        parameter: r.param,
        source: r.source,
        reflected: true,
        executed,
        context: r.context,
        payload: r.payload,
        payloadDescription: r.payloadDescription,
        testUrl: r.testUrl,
        error: confirmError,
      });
    }

    const summary =
      findings.length === 0
        ? `Tested ${results.length} parameter(s). No reflection detected.`
        : findings.some((f) => f.executed)
        ? `Confirmed XSS in ${findings.filter((f) => f.executed).length} parameter(s).`
        : `Reflected but not executed in ${findings.length} parameter(s).`;

    return {
      url,
      parametersTested: results.length,
      parameters: results.map((r) => ({
        name: r.param,
        source: r.source,
        reflected: r.reflected,
        context: r.context,
      })),
      findings,
      marker,
      authorization: authResult.source,
      message: summary,
    };
  } catch (err) {
    return reply.status(500).send({ error: 'Scan failed: ' + err.message });
  }
});

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();