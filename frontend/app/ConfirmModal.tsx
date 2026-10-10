'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type Props = {
  targetUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ targetUrl, onConfirm, onCancel }: Props) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md border border-neutral-800 bg-neutral-950 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Authorization required</span>
          </div>
          <button
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-200 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-300 leading-relaxed">
            You are about to test:
          </p>
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 break-all">
            {targetUrl}
          </div>

          <p className="text-sm text-neutral-400 leading-relaxed">
            By proceeding, you confirm that you <strong className="text-neutral-200">own this target</strong>{' '}
            or have <strong className="text-neutral-200">explicit written permission</strong> to test it.
            Unauthorized scanning is illegal in most jurisdictions and may be logged.
          </p>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-neutral-300 group-hover:text-neutral-200">
              I confirm I have permission to test this target.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-900 bg-neutral-950">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!agreed}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Proceed with scan
          </button>
        </div>
      </div>
    </div>
  );
}