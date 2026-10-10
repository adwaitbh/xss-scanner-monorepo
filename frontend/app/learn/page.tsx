import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Learn XSS — xss-scanner',
  description: 'A practical guide to Cross-Site Scripting.',
};

const topics = [
  {
    href: '/learn/what-is-xss',
    title: 'What is XSS?',
    description: 'A plain-English introduction to Cross-Site Scripting.',
  },
  {
    href: '/learn/how-it-works',
    title: 'How it works',
    description: 'Reflection vs execution — why detection is harder than it looks.',
  },
  {
    href: '/learn/types',
    title: 'Types of XSS',
    description: 'Reflected, stored, and DOM-based.',
  },
  {
    href: '/learn/prevention',
    title: 'Prevention',
    description: 'Four practical techniques that stop XSS.',
  },
];

export default function LearnOverview() {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <BookOpen className="w-3.5 h-3.5" />
        <span>Learn</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight mb-3">
        Cross-Site Scripting
      </h1>
      <p className="text-neutral-400 mb-10 leading-relaxed">
        A practical guide to the most common web vulnerability.
      </p>

      <div className="space-y-2">
        {topics.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group block border border-neutral-900 hover:border-neutral-800 rounded-lg p-4 transition bg-neutral-950/50 hover:bg-neutral-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium text-neutral-100 mb-1">
                  {t.title}
                </div>
                <div className="text-sm text-neutral-500">{t.description}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 shrink-0 mt-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}