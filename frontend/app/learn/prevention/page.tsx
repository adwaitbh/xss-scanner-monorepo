import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Prevention — xss-scanner',
};

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        How to prevent XSS
      </h1>

      <div className="space-y-5 text-neutral-300 leading-relaxed">
        <p>
          Preventing XSS isn&apos;t complicated — but it requires doing the right
          thing everywhere, not just most places. A single unescaped output is enough
          for a vulnerability.
        </p>

        <div className="space-y-8 pt-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-100 mb-3">
              1. Encode output by context
            </h2>
            <p>
              The most important rule: when you insert untrusted data into a page,
              encode it for the context it&apos;s going into. HTML context needs HTML
              entities. JavaScript context needs JS escaping. URL context needs URL
              encoding.
            </p>
            <p className="text-neutral-400 mt-3">Vulnerable:</p>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed mt-2">
{`res.send(\`<div>Hello, \${name}</div>\`);`}
            </pre>
            <p className="text-neutral-400 mt-3">Safe (with escaping):</p>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed mt-2">
{`const escapeHtml = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

res.send(\`<div>Hello, \${escapeHtml(name)}</div>\`);`}
            </pre>
            <p className="mt-3">
              Most frameworks have this built in — React escapes by default, template
              engines like Jinja2 and Handlebars escape by default, and libraries like
              DOMPurify handle complex cases.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-100 mb-3">
              2. Use safe DOM APIs
            </h2>
            <p>
              On the client side, prefer APIs that don&apos;t interpret strings as
              HTML.
            </p>
            <div className="mt-3 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-3 text-red-400">
                <span className="text-neutral-600">✗</span>
                <code>el.innerHTML = userInput;</code>
              </div>
              <div className="flex items-center gap-3 text-emerald-400">
                <span className="text-neutral-600">✓</span>
                <code>el.textContent = userInput;</code>
              </div>
            </div>
            <p className="mt-3">
              <code>textContent</code> treats input as plain text — no parsing, no
              execution. It&apos;s the safest way to display user data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-100 mb-3">
              3. Content Security Policy (CSP)
            </h2>
            <p>
              CSP is a browser feature that lets you declare which sources of scripts,
              styles, and other resources are allowed to load. A strict policy blocks
              inline scripts entirely, which neutralizes most XSS payloads even if they
              reflect.
            </p>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed mt-3">
{`Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  object-src 'none';
  base-uri 'self';`}
            </pre>
            <p className="mt-3">
              CSP is defense in depth — it should not replace proper encoding. But it
              catches the payloads that slip through.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-100 mb-3">
              4. Sanitize when you must allow HTML
            </h2>
            <p>
              Sometimes you actually need to accept HTML — a comment box with bold and
              links, a rich-text editor, markdown rendering. In those cases, run the
              input through a sanitizer library that strips dangerous tags and
              attributes.
            </p>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed mt-3">
{`import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);
el.innerHTML = clean;`}
            </pre>
            <p className="mt-3">
              Don&apos;t write your own sanitizer. Use one that&apos;s been audited
              and maintained.
            </p>
          </div>
        </div>

        <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-950 mt-8">
          <p className="text-sm text-neutral-400">
            <strong className="text-neutral-200">The takeaway:</strong> always treat
            user input as untrusted. Encode on output, use safe APIs, and add CSP as a
            safety net. If you do those three things consistently, XSS is essentially
            solved.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-neutral-900 flex justify-start">
        <Link
          href="/learn/types"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Types of XSS
        </Link>
      </div>
    </div>
  );
}