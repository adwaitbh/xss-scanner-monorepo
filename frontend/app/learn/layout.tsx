import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';

const sections = [
  { href: '/learn', label: 'Overview' },
  { href: '/learn/what-is-xss', label: 'What is XSS?' },
  { href: '/learn/how-it-works', label: 'How it works' },
  { href: '/learn/types', label: 'Types of XSS' },
  { href: '/learn/prevention', label: 'Prevention' },
];

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <nav className="border-b border-neutral-900 bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-semibold tracking-tight">xss-scanner</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-neutral-400 hover:text-neutral-100 transition"
              >
                Scanner
              </Link>
              <span className="text-neutral-100">Learn</span>
            </div>
          </div>
          <a
            href="https://github.com/adwaitbh/xss-scanner"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-400 hover:text-neutral-100 flex items-center gap-1"
          >
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <div className="text-xs text-neutral-600 uppercase tracking-wider mb-3 px-3">
              Learn
            </div>
            <nav className="space-y-0.5">
              {sections.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="block px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/60 rounded transition"
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="flex-1 min-w-0 max-w-2xl">{children}</article>
      </div>
    </div>
  );
}