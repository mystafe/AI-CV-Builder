'use client';
import Editor from '@monaco-editor/react';
import { useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function JsonEditor({ value, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <Editor
        height="60vh"
        defaultLanguage="json"
        value={value}
        onChange={(v) => {
          if (v === undefined) return;
          try {
            JSON.parse(v);
            setError(null);
            onChange(v);
          } catch (e: any) {
            setError(e.message);
          }
        }}
      />
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
