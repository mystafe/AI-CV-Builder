'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import BulletDiff from './BulletDiff';
import { rewriteBullet } from '@/lib/api';
import { withinLimits, isSingleSentence } from '@/lib/limits';

interface Props {
  path: string;
  before: string;
  locale?: 'tr' | 'en';
  targetRole?: string;
  jobDescription?: string;
  onApply: (after: string) => void;
}

export default function RewritePanel({ path, before, locale, targetRole, jobDescription, onApply }: Props) {
  const [generatedAfter, setGeneratedAfter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await rewriteBullet({ before, userFacts: [], targetRole, jobDescription, locale });
      setGeneratedAfter(res.after);
    } catch (e: any) {
      toast.error(e.message || 'Rewrite failed');
    } finally {
      setLoading(false);
    }
  };

  const canApply =
    generatedAfter !== null && withinLimits(generatedAfter) && isSingleSentence(generatedAfter);

  const apply = () => {
    if (generatedAfter && canApply) {
      onApply(generatedAfter);
    }
  };

  const revert = () => {
    setGeneratedAfter(null);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canApply) {
        e.preventDefault();
        apply();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canApply, generatedAfter]);

  return (
    <div className="space-y-4 p-4 border rounded-2xl shadow-sm">
      {!generatedAfter ? (
        <div>
          <div className="text-sm opacity-70 mb-2">Original</div>
          <p className="text-sm">{before}</p>
        </div>
      ) : (
        <BulletDiff before={before} after={generatedAfter} />
      )}
      <div className="flex gap-2">
        {!generatedAfter ? (
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={generate}
            disabled={loading}
          >
            {loading ? '...' : 'Generate'}
          </button>
        ) : (
          <>
            <button
              className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
              onClick={apply}
              disabled={!canApply}
            >
              Apply
            </button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={revert}>
              Revert
            </button>
          </>
        )}
      </div>
    </div>
  );
}
