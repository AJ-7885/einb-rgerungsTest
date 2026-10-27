import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Network status" className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 text-slate-950 px-3.5 py-2 text-xs font-semibold shadow-xl border border-amber-400">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — All questions and audio works without internet!</span>
    </aside>
  );
};
