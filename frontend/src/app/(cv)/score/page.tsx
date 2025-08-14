'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getScore } from '@/lib/api';
import { quickFix, UserAction, FixResult } from '@/lib/fixes';
import IssueList from '@/components/IssueList';
import InlineFix from '@/components/InlineFix';
import { useSession } from '@/store/session';

export default function ScorePage() {
  const cv = useSession((s) => s.cv);
  const setCV = useSession((s) => s.setCV);
  const scores = useSession((s) => s.scores);
  const setScores = useSession((s) => s.setScores);
  const [loading, setLoading] = useState(false);
  const [resolvingIndex, setResolvingIndex] = useState<number>();
  const [inlineFix, setInlineFix] = useState<(UserAction & { index: number }) | null>(null);

  const loadScore = async () => {
    if (!cv) return;
    try {
      setLoading(true);
      const res = await getScore(cv);
      setScores(res);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async (idx: number) => {
    if (!scores.issues || !cv) return;
    const issue = scores.issues[idx];
    try {
      setResolvingIndex(idx);
      const res = await quickFix(issue, { cv, setCV, locale: 'en' });
      if ('needUser' in res && res.needUser) {
        setInlineFix({ ...res, index: idx });
      } else {
        const r = res as FixResult;
        r.ok ? toast.success('Fixed') : toast.error(r.message || 'Unable to fix');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setResolvingIndex(undefined);
    }
  };

  const handleInlineSubmit = (payload: any) => {
    if (!inlineFix) return;
    try {
      inlineFix.apply(payload);
      toast.success('Fixed');
    } catch (e: any) {
      toast.error(e.message);
    }
    setInlineFix(null);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={loadScore}
        className="px-3 py-1 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {scores.issues ? 'Re-score' : 'Score'}
      </button>
      {scores.atsScore !== undefined && <div>ATS Score: {scores.atsScore}</div>}
      {scores.roleFitScore !== undefined && <div>Role Fit Score: {scores.roleFitScore}</div>}
      {scores.issues && (
        <IssueList
          issues={scores.issues}
          onFix={handleFix}
          resolvingIndex={resolvingIndex}
        />
      )}
      {inlineFix && (
        <InlineFix
          type={inlineFix.type}
          defaultValues={inlineFix.defaults}
          onSubmit={handleInlineSubmit}
          onCancel={() => setInlineFix(null)}
        />
      )}
      {scores.fixHints && (
        <ul className="list-disc pl-5">
          {scores.fixHints.map((h, idx) => (
            <li key={idx}>{h}</li>
          ))}
        </ul>
      )}
      <div className="space-x-2">
        <button disabled className="px-3 py-1 border rounded">Export PDF</button>
        <button disabled className="px-3 py-1 border rounded">Export DOCX</button>
      </div>
    </div>
  );
}
