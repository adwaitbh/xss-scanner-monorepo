import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Types of XSS — xss-scanner',
};

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        Types of XSS
      </h1>

      <div className="space-y-5 text-neutral-300 leading-relaxed">
        <p>
          XSS comes in three flavours. They differ in how the payload reaches the
          victim&apos;s browser, and consequently in how difficult they are to detect
          and fix.
        </p>

        <div className="space-y-8 pt-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-amber-400 mb-3">
              Reflected XSS
            </h2>
            <p>
              The payload is part of the current request. The server processes it and
              immediately echoes it back into the response. The victim has to click a
              crafted link for the attack to fire.
            </p>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed mt-3">
{`app.get('/search', (req, res) => {
  res.send(\`<p>You searched for: \${req.query.q}</p>\`);
});`}
            </pre>
            <p className="mt-3">
              This is the type this scanner detects. It&apos;s the most common and
              easiest to find because the payload appears in the raw server response.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-red-400 mb-3">
              Stored XSS
            </h2>
            <p>
              The payload is saved on the server — in a comment, profile field, forum
              post, or message. Every user who views that content gets the payload
              served to them. No crafted link required.
            </p>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed mt-3">
{`// On save
db.comments.insert({ body: req.body.comment });

// On render — no encoding
res.send(\`<div class="comment">\${comment.body}</div>\`);`}
            </pre>
            <p className="mt-3">
              Stored XSS is more dangerous than reflected because victims don&apos;t
              need to click anything unusual. It&apos;s also more damaging in a shared
              app — an attacker can hit every user of a comment section at once.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-purple-400 mb-3">
              DOM-based XSS
            </h2>
            <p>
              The payload never touches the server. Client-side JavaScript reads from
              an attacker-controllable source (like <code>location.hash</code>) and
              passes it into a dangerous sink (like <code>innerHTML</code>) without
              sanitization.
            </p>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-md p-4 overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed mt-3">
{`const name = location.hash.slice(1);
document.getElementById('welcome').innerHTML = \`Hello, \${name}\`;`}
            </pre>
            <p className="mt-3">
              Because the payload isn&apos;t in the server response, standard
              reflection checks miss it entirely. Detecting DOM XSS requires running
              JavaScript and observing DOM mutations — much harder than the other two
              types.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-6 mt-8">
          <p className="text-sm text-neutral-500">
            This scanner detects{' '}
            <strong className="text-neutral-300">reflected XSS</strong>. Stored and
            DOM-based detection are on the roadmap.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-neutral-900 flex justify-between">
        <Link
          href="/learn/how-it-works"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          How it works
        </Link>
        <Link
          href="/learn/prevention"
          className="group inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition"
        >
          Next: Prevention
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}