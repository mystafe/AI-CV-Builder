import Stepper from '@/components/Stepper';
import { Toaster } from 'react-hot-toast';

export default function CVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <aside className="p-4 md:w-64">
        <Stepper />
      </aside>
      <main className="flex-1 p-4">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
