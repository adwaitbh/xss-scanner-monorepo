'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Terminal,
  Loader2,
  ExternalLink,
  Bug,
} from 'lucide-react';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import ConfirmModal from './ConfirmModal';

const API_URL = 'https://xss-scanner-1s52.onrender.com';
const DEMO_VULNERABLE = 'https://xss-scanner-demo-app.vercel.app/api/echo?query=hello';
const DEMO_SAFE = 'https://xss-scanner-demo-app.vercel.app/api/safe?query=hello';

type Parameter = {
  name: string;
  source: string;
  reflected: boolean;
  context?: string;
};

type Finding = {
  parameter: string;
  source: string;
  reflected: boolean;
  executed: boolean;
  context?: string;
  payload?: string;
  payloadDescription?: string;
  testUrl: string;
  error?: string | null;
};

type ScanResult = {
  url: string;
  parametersTested: number;
  parameters: Parameter[];
  findings: Finding[];
  marker: string;
  authorization?: string;
  message: string;
};

type LogLine = {
  time: string;
  text: string;
  type?: 'info' | 'success' | 'error' | 'warn';
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (text: string, type: LogLine['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs((prev) => [...prev, { time, text, type }]);
  };

  const runScan = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setLogs([]);

    addLog(`Initializing scan for ${url}`);
    addLog('Discovering parameters (query + form inputs)...');

    try {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data: ScanResult & { error?: string; message?: string } = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            data.message ||
              'This target is not allowed. Only the demo target is scannable on the hosted version.'
          );
        }
        throw new Error(data.error || 'Scan failed');
      }

      addLog(`Found ${data.parametersTested} parameter(s) to test`);

      const reflected = data.parameters.filter((p) => p.reflected);
      if (reflected.length === 0) {
        addLog('No reflection detected in any parameter', 'success');
      } else {
        addLog(`${reflected.length} parameter(s) reflected the payload`, 'warn');

        for (const p of reflected) {
          if (p.context && p.context !== 'unknown') {
            addLog(`  → ${p.name}: context=${p.context}`, 'info');
          }
        }

        addLog('Launching headless browser for execution confirmation...');

        const executed = data.findings.filter((f) => f.executed);
        if (executed.length > 0) {
          addLog(`Confirmed XSS in ${executed.length} parameter(s)`, 'error');
        } else {
          addLog('Reflection found but no execution confirmed', 'warn');
        }
      }

      addLog('Scan complete', 'success');
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      addLog(msg, 'error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    if (!url || loading) return;

    const consent = sessionStorage.getItem('scan_consent');
    if (consent === 'true') {
      runScan();
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <nav className="border-b border-neutral-900 bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-semibold tracking-tight">xss-scanner</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-neutral-100">Scanner</span>
              <Link
                href="/learn"
                className="text-neutral-400 hover:text-neutral-100 transition"
              >
                Learn
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/adwaitbh/xss-scanner-monorepo"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-400 hover:text-neutral-100 flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm px-3 py-1.5 bg-neutral-100 text-neutral-900 rounded font-medium hover:bg-white transition">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Reflected XSS Scanner
          </h1>
          <p className="text-neutral-500 text-sm">
            Discovers parameters, detects injection context, and confirms execution in a real browser.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 text-sm font-mono">
                $
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && url && !loading && handleScan()}
                placeholder="https://target.example.com/page?id=1"
                className="w-full pl-8 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md font-mono text-sm focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={loading || !url}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 min-w-[110px] justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scanning
                </>
              ) : (
                'Scan'
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="text-neutral-600">Try the demo target:</span>
            <button
              type="button"
              onClick={() => setUrl(DEMO_VULNERABLE)}
              className="text-red-400 hover:text-red-300 underline-offset-2 hover:underline transition"
            >
              vulnerable
            </button>
            <span className="text-neutral-700">·</span>
            <button
              type="button"
              onClick={() => setUrl(DEMO_SAFE)}
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline transition"
            >
              safe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-neutral-900 rounded-lg bg-neutral-950 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-900">
              <Terminal className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs text-neutral-500 font-mono">scan.log</span>
            </div>
            <div
              ref={logRef}
              className="p-4 h-[520px] overflow-y-auto font-mono text-xs leading-relaxed"
            >
              {logs.length === 0 && (
                <div className="text-neutral-700">Waiting for scan...</div>
              )}
              {logs.map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-neutral-600 shrink-0">{line.time}</span>
                  <span
                    className={
                      line.type === 'error'
                        ? 'text-red-400'
                        : line.type === 'success'
                        ? 'text-emerald-400'
                        : line.type === 'warn'
                        ? 'text-amber-400'
                        : 'text-neutral-300'
                    }
                  >
                    {line.text}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <span className="text-neutral-600 shrink-0">...</span>
                  <span className="text-neutral-500 animate-pulse">working</span>
                </div>
              )}
            </div>
          </div>

          <div className="border border-neutral-900 rounded-lg bg-neutral-950 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-neutral-900">
              <span className="text-xs text-neutral-500 font-mono">findings</span>
            </div>
            <div className="p-5 h-[520px] overflow-y-auto">
              {!result && !error && (
                <div className="text-neutral-700 text-sm text-center py-16">
                  No scan yet
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-400 mb-1">Scan failed</div>
                    <div className="text-sm text-neutral-400 font-mono break-all">
                      {error}
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-5">
                  <SummaryBanner result={result} />

                  <div className="space-y-2">
                    <div className="text-xs text-neutral-500 font-mono mb-2">
                      Tested parameters ({result.parametersTested})
                    </div>
                    {result.parameters.map((p, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-2 rounded border text-xs font-mono ${
                          p.reflected
                            ? 'border-amber-800 bg-amber-950/30'
                            : 'border-neutral-900 bg-neutral-950'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-neutral-300">{p.name}</span>
                          <span className="text-neutral-600">({p.source})</span>
                          {p.context &&
                            p.context !== 'none' &&
                            p.context !== 'unknown' && (
                              <span className="text-[10px] text-neutral-500 border border-neutral-800 px-1.5 py-0.5 rounded">
                                {p.context}
                              </span>
                            )}
                        </div>
                        <span
                          className={
                            p.reflected ? 'text-amber-400' : 'text-neutral-600'
                          }
                        >
                          {p.reflected ? 'REFLECTED' : 'clean'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {result.findings.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs text-neutral-500 font-mono">
                        Confirmed findings ({result.findings.length})
                      </div>
                      {result.findings.map((f, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded border ${
                            f.executed
                              ? 'border-red-800 bg-red-950/40'
                              : 'border-amber-800 bg-amber-950/30'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-4">
                            {f.executed ? (
                              <Bug className="w-5 h-5 text-red-500 shrink-0" />
                            ) : (
                              <ShieldQuestion className="w-5 h-5 text-amber-500 shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-semibold text-sm">
                                  {f.executed
                                    ? 'Confirmed XSS'
                                    : 'Reflected (not executed)'}
                                </div>
                                {f.context &&
                                  f.context !== 'none' &&
                                  f.context !== 'unknown' && (
                                    <span className="text-[10px] text-neutral-400 border border-neutral-700 px-1.5 py-0.5 rounded font-mono">
                                      {f.context}
                                    </span>
                                  )}
                              </div>
                              <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                                parameter: {f.parameter}
                              </div>
                            </div>
                          </div>

                          {f.payload && (
                            <div className="border-t border-neutral-900/70 pt-3 space-y-2">
                              <div>
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                  Payload used
                                </div>
                                <div className="text-xs font-mono text-neutral-300 bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 break-all">
                                  {f.payload}
                                </div>
                              </div>
                              {f.payloadDescription && (
                                <div className="text-[10px] text-neutral-500">
                                  {f.payloadDescription}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs font-mono text-neutral-600 break-all border-t border-neutral-900/70 pt-3 mt-3">
                            {f.testUrl}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-neutral-600 leading-relaxed">
          <p className="mb-1">
            Discovers query and form parameters, detects injection context, injects context-appropriate payloads, and confirms execution in a headless browser.
          </p>
          <p>Only scan systems you own or have explicit permission to test.</p>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          targetUrl={url}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            sessionStorage.setItem('scan_consent', 'true');
            setShowConfirm(false);
            runScan();
          }}
        />
      )}
    </main>
  );
}

function SummaryBanner({ result }: { result: ScanResult }) {
  const executedCount = result.findings.filter((f) => f.executed).length;
  const reflectedCount = result.findings.length;

  let color = 'border-emerald-800 bg-emerald-950/30';
  let icon = <ShieldCheck className="w-5 h-5 text-emerald-500" />;
  let title = 'No vulnerability detected';

  if (executedCount > 0) {
    color = 'border-red-800 bg-red-950/40';
    icon = <ShieldAlert className="w-5 h-5 text-red-500" />;
    title = `Confirmed XSS in ${executedCount} parameter(s)`;
  } else if (reflectedCount > 0) {
    color = 'border-amber-800 bg-amber-950/30';
    icon = <ShieldQuestion className="w-5 h-5 text-amber-500" />;
    title = `Reflected in ${reflectedCount} parameter(s), not executed`;
  }

  return (
    <div className={`p-4 rounded border ${color} flex items-start gap-3`}>
      {icon}
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-neutral-400 mt-1">{result.message}</div>
      </div>
    </div>
  );
}