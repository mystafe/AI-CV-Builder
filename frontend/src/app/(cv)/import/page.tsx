'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extract } from '@/lib/api';
import { useSession } from '@/store/session';
import ApiError from '@/components/ApiError';
import toast from 'react-hot-toast';

export default function ImportPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const setCV = useSession((s) => s.setCV);

  const onExtract = async () => {
    try {
      setError(null);
      const res = await extract(text);
      setCV(res.cv);
      router.push('/review');
    } catch (e: any) {
      setError(e);
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-40 p-2 border rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={onExtract} className="px-4 py-2 bg-blue-600 text-white rounded">
        Extract
      </button>
      <ApiError error={error} />
    </div>
  );
}
