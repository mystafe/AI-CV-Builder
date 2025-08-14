import classNames from 'classnames';

export interface IssueItem { path?: string; message: string }
interface Props {
  issues: IssueItem[];
  onFix?: (idx: number) => void;
  resolvingIndex?: number;
}

export default function IssueList({ issues, onFix, resolvingIndex }: Props) {
  return (
    <ul className="space-y-2">
      {issues.map((i, idx) => (
        <li key={idx} className="p-2 border rounded flex items-center justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm">{i.message}</p>
            {i.path && <span className="text-xs text-gray-500">{i.path}</span>}
          </div>
          {onFix && (
            <button
              className={classNames(
                'px-2 py-1 text-xs bg-green-600 text-white rounded flex items-center justify-center',
                resolvingIndex === idx && 'opacity-50'
              )}
              onClick={() => onFix(idx)}
              disabled={resolvingIndex === idx}
            >
              {resolvingIndex === idx ? (
                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'Fix'
              )}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
