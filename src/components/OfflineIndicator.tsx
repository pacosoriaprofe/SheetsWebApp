import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-amber-500 text-slate-950 px-4 py-2.5 shadow-xl font-medium text-xs sm:text-sm border border-amber-400 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-50"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900"></span>
        </span>
        <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
        <span><strong>Modo Offline Activo</strong> — Todo el contenido, ejercicios y quizzes están disponibles sin internet.</span>
      </div>
      <span className="hidden md:inline-flex items-center gap-1 text-xs opacity-90">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Guardado local activo
      </span>
    </div>
  );
};
