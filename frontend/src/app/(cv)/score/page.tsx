'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getScore } from '@/lib/api';
import { useSession } from '@/store/session';

export default function ScorePage() {
  const cv = useSession((s) => s.cv);
  const scores = useSession((s) => s.scores);
  const setScores = useSession((s) => s.setScores);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-4">
      <button onClick={loadScore} className="px-3 py-1 bg-blue-500 text-white rounded" disabled={loading}>
        Score
      </button>
      {scores.atsScore !== undefined && <div>ATS Score: {scores.atsScore}</div>}
      {scores.roleFitScore !== undefined && <div>Role Fit Score: {scores.roleFitScore}</div>}
      {scores.issues && (
        <ul className="list-disc pl-5">
          {scores.issues.map((i, idx) => (
            <li key={idx}>{i.message}</li>
          ))}
        </ul>
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
