'use client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { rewriteBullet } from '@/lib/api';
import { useSession } from '@/store/session';

export default function RewritePage() {
  const cv = useSession((s) => s.cv);
  const applyRewrite = useSession((s) => s.applyRewrite);
  const router = useRouter();

  const onRewrite = async (path: string, text: string) => {
    try {
      const res = await rewriteBullet(path, text);
      applyRewrite(path, res.after);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {cv?.experience?.map((exp, i) => (
        <div key={i} className="p-2 border rounded">
          <h3 className="font-medium">{exp.role} @ {exp.company}</h3>
          <ul className="list-disc pl-5">
            {exp.bullets?.map((b, j) => (
              <li key={j} className="flex gap-2">
                <span className="flex-1">{b.text}</span>
                <button
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                  onClick={() => onRewrite(`experience[${i}].bullets[${j}].text`, b.text)}
                >
                  Rewrite
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={() => router.push('/score')} className="px-3 py-1 bg-blue-600 text-white rounded">
        Next
      </button>
    </div>
  );
}
