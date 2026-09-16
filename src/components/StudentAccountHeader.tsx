import React from 'react';
import { UserProfile, ClassGroup } from '../types';
import {
  GraduationCap,
  School,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

interface Props {
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenClassSelector: () => void;
  onOpenTeacherDashboard?: () => void;
  activeTab?: string;
  isLoggingIn?: boolean;
}

export const StudentAccountHeader: React.FC<Props> = ({
  user,
  onLogin,
  onLogout,
  onOpenClassSelector,
  onOpenTeacherDashboard,
  activeTab,
  isLoggingIn = false,
}) => {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-xs transition group text-xs text-slate-700 dark:text-slate-200 font-semibold"
          title="Iniciar sesión con tu cuenta de Google Education @iesdiegotorrente.es"
        >
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 48 48"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          <span className="hidden sm:inline">
            {isLoggingIn ? 'Iniciando sesión...' : 'Entrar con @iesdiegotorrente.es'}
          </span>
          <span className="sm:hidden">
            {isLoggingIn ? '...' : 'Entrar'}
          </span>
        </button>
      </div>
    );
  }

  const isTeacher = user.role === 'teacher';

  return (
    <div className="flex items-center gap-2">
      {/* Class selector button for student */}
      <button
        onClick={onOpenClassSelector}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition"
        title="Cambiar o seleccionar tu clase en IES Diego Torrente"
      >
        <School className="w-3.5 h-3.5 text-emerald-600" />
        <span className="max-w-[120px] truncate">
          {user.className || 'Elegir Clase'}
        </span>
        <ChevronDown className="w-3 h-3 text-emerald-600 opacity-60" />
      </button>

      {/* Teacher Panel Quick Access button */}
      {isTeacher && onOpenTeacherDashboard && (
        <button
          onClick={onOpenTeacherDashboard}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow-xs ${
            activeTab === 'teacher'
              ? 'bg-indigo-600 text-white shadow-indigo-500/20'
              : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
          }`}
          title="Abrir Panel Docente de Paco Soria"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Panel Docente</span>
        </button>
      )}

      {/* If logged in with personal account, show clear indicator chip */}
      {user.email?.toLowerCase().includes('@gmail.com') && (
        <span
          className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[10px] font-bold"
          title={`Conectado como ${user.email}. Para Classroom se requiere pacosoriaprofe@iesdiegotorrente.es`}
        >
          ⚠️ @gmail (Cambiar a cuenta del centro)
        </span>
      )}

      {/* User profile capsule */}
      <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-6 h-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden md:flex flex-col text-left">
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[110px]">
            {user.displayName.split(' ')[0]}
          </span>
          <span className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">
            {isTeacher ? 'Profesor' : 'Alumno'}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
