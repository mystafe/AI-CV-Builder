'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JsonEditor from '@/components/JsonEditor';
import { useSession } from '@/store/session';
import toast from 'react-hot-toast';

export default function ReviewPage() {
  const cv = useSession((s) => s.cv);
  const setCV = useSession((s) => s.setCV);
  const router = useRouter();
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(JSON.stringify(cv ?? {}, null, 2));
  }, [cv]);

  const save = () => {
    try {
      const parsed = JSON.parse(value);
      setCV(parsed);
      router.push('/gaps');
    } catch {
      toast.error('Invalid JSON');
    }
  };

  return (
    <div className="space-y-4">
      <JsonEditor value={value} onChange={setValue} />
      <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">
        Validate &amp; Save
      </button>
    </div>
  );
}
