'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import BulletList from '@/components/BulletList';
import RewritePanel from '@/components/RewritePanel';
import { useSession } from '@/store/session';

interface BulletItem {
  path: string;
  text: string;
}

export default function RewritePage() {
  const cv = useSession((s) => s.cv);
  const applyRewrite = useSession((s) => s.applyRewrite);
  const [selected, setSelected] = useState<string>();

  const bullets: BulletItem[] = [];
  cv?.experience?.forEach((exp, i) => {
    exp.bullets?.forEach((b, j) => {
      bullets.push({ path: `experience[${i}].bullets[${j}].text`, text: b.text });
    });
  });

  const selectedBullet = bullets.find((b) => b.path === selected);

  const onApply = (after: string) => {
    if (!selected) return;
    applyRewrite(selected, after);
    toast.success('Bullet updated');
  };

  return (
    <div className="md:grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <BulletList
          bullets={bullets}
          selectedPath={selected}
          onSelect={setSelected}
          onRewrite={(p) => setSelected(p)}
        />
      </div>
      <div className="md:col-span-2">
        {selectedBullet ? (
          <RewritePanel path={selectedBullet.path} before={selectedBullet.text} onApply={onApply} />
        ) : (
          <p className="text-sm opacity-70">Select a bullet to rewrite.</p>
        )}
      </div>
    </div>
  );
}
