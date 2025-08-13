'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';

const steps = [
  { name: 'Import', href: '/import' },
  { name: 'Review', href: '/review' },
  { name: 'Gaps', href: '/gaps' },
  { name: 'Rewrite', href: '/rewrite' },
  { name: 'Score/Export', href: '/score' }
];

export default function Stepper() {
  const pathname = usePathname();
  return (
    <nav className="flex sm:flex-row md:flex-col md:w-64 gap-2">
      {steps.map((s) => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={classNames(
              'px-3 py-2 rounded border text-sm text-center',
              active ? 'bg-blue-500 text-white' : 'bg-white'
            )}
          >
            {s.name}
          </Link>
        );
      })}
    </nav>
  );
}
