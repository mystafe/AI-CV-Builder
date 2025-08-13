import classNames from 'classnames';

interface BulletItem {
  path: string;
  text: string;
}

interface Props {
  bullets: BulletItem[];
  selectedPath?: string;
  onSelect: (path: string) => void;
  onRewrite: (path: string) => void;
}

export default function BulletList({ bullets, selectedPath, onSelect, onRewrite }: Props) {
  return (
    <ul className="space-y-2">
      {bullets.map((b) => (
        <li
          key={b.path}
          className={classNames(
            'p-2 rounded border flex gap-2 items-start',
            selectedPath === b.path && 'bg-blue-50'
          )}
        >
          <div className="flex-1 cursor-pointer" onClick={() => onSelect(b.path)}>
            <p className="truncate text-sm">{b.text}</p>
            <span className="text-xs text-gray-500">{b.path}</span>
          </div>
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
            onClick={() => onRewrite(b.path)}
          >
            Rewrite
          </button>
        </li>
      ))}
    </ul>
  );
}
