import React, { useState } from 'react';
import { StudentProgress } from '../types';
import {
  generateCSVReport,
  syncToGoogleSheetWebhook,
  APPS_SCRIPT_TEMPLATE,
} from '../utils/storage';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code2,
  X,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progress: StudentProgress;
  onUpdateProgress: (updated: StudentProgress) => void;
}

export const GoogleSheetsIntegrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(progress.googleSheetSync.webhookUrl || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csvContent = generateCSVReport(progress);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GoogleSheets_Progreso_${progress.studentName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: '' });

    const result = await syncToGoogleSheetWebhook(webhookUrl, progress);

    const updated: StudentProgress = {
      ...progress,
      googleSheetSync: {
        ...progress.googleSheetSync,
        webhookUrl,
        lastSyncedAt: result.success ? new Date().toISOString() : progress.googleSheetSync.lastSyncedAt,
        status: result.success ? 'success' : 'error',
        errorMessage: result.success ? undefined : result.message,
      },
    };

    onUpdateProgress(updated);
    setIsSyncing(false);
    setSyncStatus({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Sincronización con Google Sheets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registra el avance del alumno y habilita el feedback personalizado del instructor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 text-sm text-slate-600 dark:text-slate-300">
          {/* Quick Option 1: CSV Export */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                Opción Rápida: Exportar Progreso a CSV
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Genera un archivo compatible al 100% que puedes arrastrar a Google Sheets o Excel.
              </p>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Descargar CSV</span>
            </button>
          </div>

          {/* Option 2: Live Webhook Sync */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Sincronización Automática en Tiempo Real (Webhook Apps Script)
              </label>
              <button
                onClick={() => setShowScriptCode(!showScriptCode)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showScriptCode ? 'Ocultar código Apps Script' : 'Ver código Apps Script'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full text-xs sm:text-sm font-mono px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500">
                Pega la URL de la aplicación web de Google Apps Script vinculada a tu hoja de cálculo.
              </p>
            </div>

            {/* Apps Script instructions Accordion */}
            {showScriptCode && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-emerald-400 font-bold">1. Código para Extensiones &gt; Apps Script:</span>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white transition"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? '¡Copiado!' : 'Copiar código'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto max-h-40 p-2 text-[11px] leading-relaxed text-slate-300">
                  {APPS_SCRIPT_TEMPLATE}
                </pre>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  2. Haz clic en "Implementar" &gt; "Nueva implementación" &gt; Tipo "Aplicación web" &gt; Acceso: "Cualquiera".
                </p>
              </div>
            )}

            {/* Sync Feedback Message */}
            {syncStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  syncStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {syncStatus.message}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <span>Crear nueva hoja en blanco (sheets.new)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={handleSaveAndSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
