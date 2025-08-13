import { diffWords } from '@/lib/diff';
import { wordCount, WORD_LIMIT, CHAR_LIMIT, withinLimits, isSingleSentence } from '@/lib/limits';

interface Props {
  before: string;
  after: string;
}

export default function BulletDiff({ before, after }: Props) {
  const parts = diffWords(before, after);
  const wc = wordCount(after);
  const len = after.length;
  const single = isSingleSentence(after);
  const within = withinLimits(after);

  return (
    <div className="space-y-2">
      <p>
        {parts.map((p, i) => {
          if (p.type === 'insert') {
            return (
              <mark key={i} className="rounded px-1">
                {p.text}
              </mark>
            );
          }
          if (p.type === 'delete') {
            return (
              <del key={i} className="opacity-60">
                {p.text}
              </del>
            );
          }
          return (
            <span key={i} className="opacity-80">
              {p.text}
            </span>
          );
        })}
      </p>
      <div className="text-xs text-gray-600 space-x-2">
        <span>
          {wc}/{WORD_LIMIT} words
        </span>
        <span>
          {len}/{CHAR_LIMIT} chars
        </span>
        {!single && <span className="text-red-500">multiple sentences</span>}
        {!within && <span className="text-red-500">limit exceeded</span>}
      </div>
    </div>
  );
}
