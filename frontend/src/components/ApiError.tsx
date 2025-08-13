'use client';

export default function ApiError({ error }: { error: Error | null }) {
  if (!error) return null;
  return <div className="text-sm text-red-600 mt-2">{error.message}</div>;
}
