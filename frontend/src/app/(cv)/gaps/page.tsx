'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getGaps, getNextQuestions } from '@/lib/api';
import { useSession } from '@/store/session';
import { setByPath } from '@/lib/path';

export default function GapsPage() {
  const cv = useSession((s) => s.cv);
  const gaps = useSession((s) => s.gaps);
  const setGaps = useSession((s) => s.setGaps);
  const questions = useSession((s) => s.questions);
  const setQuestions = useSession((s) => s.setQuestions);
  const answers = useSession((s) => s.answers);
  const setAnswer = useSession((s) => s.setAnswer);
  const setCV = useSession((s) => s.setCV);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loadGaps = async () => {
    if (!cv) return;
    try {
      setLoading(true);
      const res = await getGaps(cv);
      setGaps(res.gaps as any);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await getNextQuestions(gaps, Object.keys(answers));
      setQuestions(res.questions as any);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const apply = () => {
    if (!cv) return;
    const next = structuredClone(cv);
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (q.path && ans !== undefined) {
        setByPath(next as any, q.path, ans);
      }
    });
    setCV(next);
  };

  const nextStep = () => {
    apply();
    router.push('/rewrite');
  };

  return (
    <div className="space-y-4">
      <div className="space-x-2">
        <button onClick={loadGaps} className="px-3 py-1 bg-blue-500 text-white rounded" disabled={loading}>
          Load Gaps
        </button>
        <button onClick={loadQuestions} className="px-3 py-1 bg-green-500 text-white rounded">
          Next 3 Questions
        </button>
      </div>
      <ul className="list-disc pl-5">
        {gaps.map((g, i) => (
          <li key={i}>{g.message || g.text}</li>
        ))}
      </ul>
      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q.id} className="space-y-1">
            <label className="block text-sm font-medium">{q.label}</label>
            {q.type === 'number' ? (
              <input
                type="number"
                className="border p-1 rounded"
                value={answers[q.id] as any || ''}
                onChange={(e) => setAnswer(q.id, Number(e.target.value))}
              />
            ) : (
              <input
                type="text"
                className="border p-1 rounded"
                value={answers[q.id] as any || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="space-x-2">
        <button onClick={apply} className="px-3 py-1 bg-gray-200 rounded">Apply Answers</button>
        <button onClick={nextStep} className="px-3 py-1 bg-blue-600 text-white rounded">Next</button>
      </div>
    </div>
  );
}
