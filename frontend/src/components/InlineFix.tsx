import { useState } from 'react';
import { isEmail, isPhone } from '@/lib/validators';

interface Payload {
  summary?: string;
  email?: string;
  phone?: string;
  keyword?: string;
  bucket?: 'primary' | 'secondary' | 'tools';
}

interface Props {
  type: 'summary' | 'contact' | 'keyword';
  onSubmit: (payload: Payload) => void;
  onCancel: () => void;
  defaultValues?: Payload & { bucket?: string };
}

export default function InlineFix({ type, onSubmit, onCancel, defaultValues }: Props) {
  const [form, setForm] = useState<Payload>(defaultValues || {});

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <div className="p-3 border rounded space-y-2">
      {type === 'summary' && (
        <div className="space-y-2">
          <textarea
            className="w-full border p-1 text-sm"
            rows={3}
            defaultValue={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded" onClick={handleSubmit}>
              Save
            </button>
            <button className="px-2 py-1 border text-xs rounded" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {type === 'contact' && (
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-1 text-sm"
            defaultValue={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full border p-1 text-sm"
            defaultValue={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
              onClick={() => {
                if (form.email && !isEmail(form.email)) return;
                if (form.phone && !isPhone(form.phone)) return;
                handleSubmit();
              }}
            >
              Save
            </button>
            <button className="px-2 py-1 border text-xs rounded" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {type === 'keyword' && (
        <div className="space-y-2">
          <input
            className="w-full border p-1 text-sm"
            placeholder="Keyword"
            defaultValue={form.keyword}
            onChange={(e) => setForm({ ...form, keyword: e.target.value })}
          />
          <select
            className="w-full border p-1 text-sm"
            defaultValue={form.bucket}
            onChange={(e) => setForm({ ...form, bucket: e.target.value as any })}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="tools">Tools</option>
          </select>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
              onClick={handleSubmit}
            >
              Add
            </button>
            <button className="px-2 py-1 border text-xs rounded" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
