'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CopyJdButtonProps {
  jdText?: string | null;
  className?: string;
}

export function CopyJdButton({ jdText, className }: CopyJdButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!jdText) {
      toast('No Job Description text to copy', 'info');
      return;
    }

    try {
      await navigator.clipboard.writeText(jdText);
      setCopied(true);
      toast('Job description copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!jdText}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
        copied
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
      } ${className || ''}`}
      title="Copy JD text"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy JD</span>
        </>
      )}
    </button>
  );
}

