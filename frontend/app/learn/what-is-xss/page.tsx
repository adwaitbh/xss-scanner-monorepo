import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'What is XSS? — xss-scanner',
};

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight mb-6">What is XSS?</h1>

      <div className="space-y-5 text-neutral-300 leading-relaxed">
        <p>
          Cross-Site Scripting (XSS) is a vulnerability that lets an attacker inject
          JavaScript into a page that other users will view. When their browser loads
          the page, the injected code runs in the context of your site — with access to
          cookies, session tokens, and everything else the page can reach.
        </p>

        <p>
          It&apos;s been in the OWASP Top 10 for over a decade. Despite that, it&apos;s
          still found in production applications regularly — usually because
          developers trust user input.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-neutral-100 pt-4">
          Why it matters
        </h2>

        <p>
          When an attacker can run JavaScript in your users&apos; browsers, they can:
        </p>

        <ul className="list-disc list-inside space-y-2 text-neutral-400">
          <li>Steal session cookies and impersonate the victim</li>
          <li>Read anything on the page — emails, messages, financial data</li>
          <li>Make requests as the victim (change passwords, transfer funds)</li>
          <li>Inject fake login forms to harvest credentials</li>
          <li>Redirect users to malicious sites</li>
        </ul>

        <p>
          All of this happens invisibly. The victim just sees a normal-looking page.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-neutral-100 pt-4">
          A simple example
        </h2>

        <p>
          Imagine a search page that reads the <code>q</code> parameter from the URL
          and displays it back in the page.
        </p>

        <p className="text-neutral-400">Vulnerable code:</p>

        <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed">
{`const q = new URLSearchParams(location.search).get('q');
document.getElementById('output').innerHTML = q;`}
        </pre>

        <p>If someone visits a URL like:</p>

        <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed">
{`https://example.com/search?q=<img src=x onerror=alert(1)>`}
        </pre>

        <p>
          The browser parses the query as HTML, sees the <code>onerror</code> handler,
          and runs the JavaScript. That&apos;s the vulnerability.
        </p>
      </div>

      <div className="mt-12 pt-6 border-t border-neutral-900 flex justify-end">
        <Link
          href="/learn/how-it-works"
          className="group inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition"
        >
          Next: How it works
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}