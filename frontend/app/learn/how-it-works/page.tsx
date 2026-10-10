import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'How it works — xss-scanner',
};

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight mb-6">How it works</h1>

      <div className="space-y-5 text-neutral-300 leading-relaxed">
        <p>
          Detecting XSS correctly is harder than it looks. Most naive scanners produce
          false positives because they confuse two different concepts:{' '}
          <strong>reflection</strong> and <strong>execution</strong>.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-neutral-100 pt-4">
          Reflection
        </h2>

        <p>
          When you inject a payload into a parameter, the server processes the request
          and sends back HTML. If your payload string appears somewhere in that HTML,
          it&apos;s <em>reflected</em>.
        </p>

        <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed">
{`const marker = 'xss_test_' + Date.now();
const testUrl = new URL(target);
testUrl.searchParams.set('q', \`<img src=x onerror=alert('\${marker}')>\`);

const html = await fetch(testUrl).then(r => r.text());
const reflected = html.includes(marker);`}
        </pre>

        <p>
          This works because we use a unique marker. If the marker shows up in the
          response, the input is being reflected somewhere.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-neutral-100 pt-4">
          The problem with reflection-only detection
        </h2>

        <p>A lot of the web reflects input safely. Consider these scenarios:</p>

        <ul className="list-disc list-inside space-y-2 text-neutral-400">
          <li>
            The server HTML-encodes the input: <code>&lt;img&gt;</code> becomes{' '}
            <code>&amp;lt;img&amp;gt;</code>
          </li>
          <li>The input lands inside an attribute value, not as HTML</li>
          <li>
            The input is inserted via <code>innerHTML</code> but browsers refuse to
            execute <code>&lt;script&gt;</code> tags inserted that way
          </li>
          <li>A Content Security Policy blocks inline script execution</li>
        </ul>

        <p>
          In all of these cases, the payload string <em>is</em> in the response — but
          it won&apos;t run. Reflection-only scanners mark these as vulnerable.
          That&apos;s a false positive.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-neutral-100 pt-4">
          Execution
        </h2>

        <p>
          To know if XSS is real, you have to load the page in an actual browser and
          see if the JavaScript runs. That&apos;s what this scanner does — for every
          reflected payload, it opens a headless Chromium instance (via Browserless),
          navigates to the payload URL, and listens for the alert dialog.
        </p>

        <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed">
{`const browser = await chromium.connectOverCDP(BROWSERLESS_ENDPOINT);
const page = await browser.newPage();

let executed = false;
page.on('dialog', async (dialog) => {
  executed = true;
  await dialog.dismiss();
});

await page.goto(testUrl);`}
        </pre>

        <p>
          If a dialog fires, the payload executed. If not, it was reflected but safely
          contained.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-neutral-100 pt-4">
          The three result states
        </h2>

        <p>
          Combining both checks gives a clear picture of what&apos;s actually happening:
        </p>

        <div className="space-y-3">
          <div className="border-l-2 border-emerald-700 pl-4 py-1">
            <div className="font-medium text-emerald-400 mb-1">Clean</div>
            <p className="text-sm text-neutral-400">
              No reflection detected. The input never comes back in the response.
            </p>
          </div>
          <div className="border-l-2 border-amber-700 pl-4 py-1">
            <div className="font-medium text-amber-400 mb-1">
              Reflected, not executed
            </div>
            <p className="text-sm text-neutral-400">
              The payload appears in the HTML, but the browser doesn&apos;t run it —
              usually because it&apos;s encoded or the context is safe.
            </p>
          </div>
          <div className="border-l-2 border-red-700 pl-4 py-1">
            <div className="font-medium text-red-400 mb-1">Confirmed XSS</div>
            <p className="text-sm text-neutral-400">
              The payload reflected <em>and</em> executed in a real browser. This is an
              actual vulnerability.
            </p>
          </div>
        </div>

        <p>
          That third state is the only one that matters for reporting a vulnerability.
        </p>
      </div>

      <div className="mt-12 pt-6 border-t border-neutral-900 flex justify-between">
        <Link
          href="/learn/what-is-xss"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          What is XSS?
        </Link>
        <Link
          href="/learn/types"
          className="group inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition"
        >
          Next: Types of XSS
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}