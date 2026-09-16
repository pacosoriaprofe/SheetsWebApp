import React, { useState } from 'react';
import { VisualDiagram } from '../types';
import {
  Table2,
  Lock,
  Layers,
  Sparkles,
  Zap,
  MousePointerClick,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  diagram: VisualDiagram;
}

export const ChapterVisualContext: React.FC<Props> = ({ diagram }) => {
  const [activeCellCoord, setActiveCellCoord] = useState<string>('C4');
  const [activeRefType, setActiveRefType] = useState<'relative' | 'absolute' | 'mixedRow' | 'mixedCol'>('absolute');
  const [demoFilter, setDemoFilter] = useState<'todos' | 'aprobados' | 'reprobados'>('todos');

  switch (diagram.type) {
    case 'grid-coordinates':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Table2 className="w-4 h-4 text-emerald-600" />
                {diagram.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold border border-slate-200 dark:border-slate-700">
              <span>Celda Seleccionada:</span>
              <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-xs">{activeCellCoord}</span>
            </div>
          </div>

          {/* Interactive Formula Bar */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="text-slate-400 font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">fx</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold">=SUM(C2:{activeCellCoord})</span>
          </div>

          {/* Spreadsheet visual grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[340px] border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 text-xs font-mono">
              <div className="grid grid-cols-5 bg-slate-100 dark:bg-slate-800 text-center font-bold text-slate-600 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700">
                <div className="p-1.5 border-r border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800/80 text-slate-400">#</div>
                <div className="p-1.5 border-r border-slate-300 dark:border-slate-700">A (Producto)</div>
                <div className="p-1.5 border-r border-slate-300 dark:border-slate-700">B (Precio)</div>
                <div className="p-1.5 border-r border-slate-300 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold">C (Unidades)</div>
                <div className="p-1.5">D (Total)</div>
              </div>

              {[
                { r: 1, a: 'Portátil', b: '850 €', c: '12', d: '10.200 €' },
                { r: 2, a: 'Ratón USB', b: '25 €', c: '40', d: '1.000 €' },
                { r: 3, a: 'Teclado Mec.', b: '75 €', c: '18', d: '1.350 €' },
                { r: 4, a: 'Monitor 27"', b: '240 €', c: '8', d: '1.920 €' },
              ].map((row) => (
                <div key={row.r} className="grid grid-cols-5 border-b border-slate-200 dark:border-slate-800 text-center items-center">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800/60 text-slate-500 font-semibold border-r border-slate-200 dark:border-slate-800">{row.r}</div>
                  <div className="p-1.5 border-r border-slate-200 dark:border-slate-800 text-left px-2 truncate">{row.a}</div>
                  <div className="p-1.5 border-r border-slate-200 dark:border-slate-800 text-right px-2">{row.b}</div>
                  <div
                    onClick={() => setActiveCellCoord(`C${row.r}`)}
                    className={`p-1.5 border-r border-slate-200 dark:border-slate-800 cursor-pointer transition relative ${
                      activeCellCoord === `C${row.r}`
                        ? 'bg-blue-50 dark:bg-blue-950/80 ring-2 ring-blue-500 font-bold text-blue-700 dark:text-blue-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {row.c}
                    {activeCellCoord === `C${row.r}` && (
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-600 border border-white rounded-xs" title="Controlador de relleno (Fill handle)" />
                    )}
                  </div>
                  <div className="p-1.5 text-right px-2">{row.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>💡 <strong>Tip visual:</strong> Haz clic en cualquier celda de la columna C para ver el cuadro azul y el controlador de relleno.</span>
          </div>
        </div>
      );

    case 'formula-anatomy':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {diagram.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-center overflow-x-auto">
            <div className="inline-flex items-center text-lg sm:text-2xl font-bold tracking-wide">
              <span className="text-amber-400 px-1 hover:bg-slate-800 rounded transition" title="Signo igual obligatorio">=</span >
              <span className="text-emerald-400 px-1 hover:bg-slate-800 rounded transition" title="Nombre de función">AVERAGE</span>
              <span className="text-slate-400">(</span>
              <span className="text-sky-300 px-1 hover:bg-slate-800 rounded transition" title="Rango de argumento: desde D1 hasta D9">D1:D9</span>
              <span className="text-slate-400">)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-900 rounded font-mono text-xs">=</span>
                Signo Igual
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Indica a Google Sheets que no es texto común sino una instrucción a calcular.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-emerald-200 dark:bg-emerald-900 rounded font-mono text-xs">AVERAGE</span>
                Nombre Función
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Determina la operación matemática. En español equivale a PROMEDIO.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
              <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-sky-200 dark:bg-sky-900 rounded font-mono text-xs">(D1:D9)</span>
                Argumentos
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Los datos que alimentan el cálculo. Delimitados con dos puntos (:) para rangos.</p>
            </div>
          </div>
        </div>
      );

    case 'cell-references':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              {diagram.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'relative', label: 'Relativa (A1)', formula: '=A1*2' },
              { id: 'absolute', label: 'Absoluta ($A$1)', formula: '=$A$1*2' },
              { id: 'mixedRow', label: 'Fila Fija (A$1)', formula: '=A$1*2' },
              { id: 'mixedCol', label: 'Columna Fija ($A1)', formula: '=$A1*2' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveRefType(t.id as unknown as typeof activeRefType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeRefType === t.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 text-xs">
            {activeRefType === 'relative' && (
              <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
                <p className="font-semibold text-purple-800 dark:text-purple-300">Modo Relativo: A1</p>
                <p>Al copiar hacia abajo (fila 2), se convierte en <strong>A2</strong>. Al copiar una columna a la derecha, se convierte en <strong>B1</strong>.</p>
                <span className="inline-block text-[11px] text-purple-600 dark:text-purple-400 font-mono">Útil para: Totales de línea donde cada fila calcula su propio producto.</span>
              </div>
            )}
            {activeRefType === 'absolute' && (
              <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
                <p className="font-semibold text-purple-800 dark:text-purple-300">Modo Absoluto: $A$1 (Atajo F4)</p>
                <p>Bloquea tanto la columna A como la fila 1. Al arrastrar la fórmula a cualquier parte del libro, <strong>$A$1 permanece inmutable</strong>.</p>
                <span className="inline-block text-[11px] text-purple-600 dark:text-purple-400 font-mono">Útil para: Celdas con tasas fijas de impuestos, divisas o descuentos globales.</span>
              </div>
            )}
            {activeRefType === 'mixedRow' && (
              <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
                <p className="font-semibold text-purple-800 dark:text-purple-300">Mixta con Fila Fija: A$1</p>
                <p>La fila 1 queda fija con el $, pero la letra de columna A se adaptará a B, C, D al arrastrar horizontalmente.</p>
              </div>
            )}
            {activeRefType === 'mixedCol' && (
              <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
                <p className="font-semibold text-purple-800 dark:text-purple-300">Mixta con Columna Fija: $A1</p>
                <p>La columna A queda anclada, pero el número de fila aumentará a 2, 3, 4 al arrastrar hacia abajo.</p>
              </div>
            )}
          </div>
        </div>
      );

    case 'conditional-format':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {diagram.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setDemoFilter('todos')}
                className={`px-2 py-1 text-xs rounded ${demoFilter === 'todos' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setDemoFilter('reprobados')}
                className={`px-2 py-1 text-xs rounded ${demoFilter === 'reprobados' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                &lt; 70% (Rojo)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { name: 'Ana Morales', score: 92, status: 'Sobresaliente' },
              { name: 'Carlos Díaz', score: 64, status: 'Reprobado' },
              { name: 'Lucía Ortiz', score: 85, status: 'Aprobado' },
              { name: 'Mario Cano', score: 58, status: 'Reprobado' },
            ]
              .filter((st) => demoFilter === 'todos' || (demoFilter === 'reprobados' && st.score < 70))
              .map((st, i) => {
                const isFail = st.score < 70;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border transition ${
                      isFail
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    <div className="font-bold">{st.name}</div>
                    <div className="text-xl font-black mt-1">{st.score}%</div>
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-1 inline-block opacity-80">
                      {st.status}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      );

    case 'pivot-table':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              {diagram.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-950">
              <span className="font-bold text-slate-500 block mb-2 uppercase text-[10px]">1. Datos Planos de Origen (2D)</span>
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th>Vendedor</th>
                    <th>Mes</th>
                    <th>Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr><td>David</td><td>Ene</td><td>1.200 €</td></tr>
                  <tr><td>Laura</td><td>Ene</td><td>2.100 €</td></tr>
                  <tr><td>David</td><td>Feb</td><td>1.450 €</td></tr>
                  <tr><td>Laura</td><td>Feb</td><td>1.900 €</td></tr>
                </tbody>
              </table>
            </div>

            <div className="border border-indigo-200 dark:border-indigo-800/60 rounded-lg p-3 bg-indigo-50/40 dark:bg-indigo-950/30">
              <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-2 uppercase text-[10px]">2. Matriz Resumida Pivotada (3D)</span>
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300">
                    <th>Filas \\ Cols</th>
                    <th>Ene</th>
                    <th>Feb</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 dark:divide-indigo-900/40">
                  <tr><td className="font-bold">David</td><td>1.200 €</td><td>1.450 €</td><td className="font-bold">2.650 €</td></tr>
                  <tr><td className="font-bold">Laura</td><td>2.100 €</td><td>1.900 €</td><td className="font-bold">4.000 €</td></tr>
                  <tr className="font-black text-indigo-900 dark:text-indigo-200">
                    <td>Total Gral</td><td>3.300 €</td><td>3.350 €</td><td>6.650 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'macro-flow':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {diagram.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center w-full">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">1. Grabación</span>
              <p className="text-[11px] text-slate-500">Extensiones &gt; Macros &gt; Grabar macro (Absoluta o Relativa)</p>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="flex-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-center w-full">
              <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">2. Código Apps Script</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">function miMacro() &#123; ... &#125;</p>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="flex-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center w-full">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">3. Ejecución Instantánea</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">Atajo Ctrl+Alt+Shift+1 o botón asignado</p>
            </div>
          </div>
        </div>
      );

    case 'shortcuts-palette':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-emerald-600" />
              {diagram.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {[
              { desc: 'Pegar solo valores', pc: 'Ctrl + Shift + V', mac: '⌘ + Shift + V' },
              { desc: 'Rotar $ (Absoluto/Relativo)', pc: 'F4', mac: 'Fn + F4' },
              { desc: 'Insertar fecha actual', pc: 'Ctrl + ;', mac: '⌘ + ;' },
              { desc: 'Rellenar abajo (Fill Down)', pc: 'Ctrl + D', mac: '⌘ + D' },
              { desc: 'Ver todas las fórmulas', pc: 'Ctrl + ~', mac: 'Ctrl + ~' },
              { desc: 'Salto de línea en fórmula', pc: 'Alt + Enter', mac: 'Option + Enter' },
            ].map((sc, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {sc.pc}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      );

    case 'troubleshooting-matrix':
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              {diagram.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{diagram.caption}</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-2">
              <span className="font-bold text-rose-700 dark:text-rose-400 shrink-0">Bloqueo / Crash:</span>
              <span className="text-slate-700 dark:text-slate-300">Crea una copia de emergencia (Archivo &gt; Crear una copia). El clon regenera índices corruptos y vuelve a funcionar.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-2">
              <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">"Still Loading":</span>
              <span className="text-slate-700 dark:text-slate-300">Borra cookies y archivos temporales del navegador en chrome://settings/clearBrowserData.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">Hojas muy lentas:</span>
              <span className="text-slate-700 dark:text-slate-300">Elimina filas vacías sobrantes y utiliza =IMPORTRANGE para vincular datos sin sobrecargar un solo archivo.</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-xs text-slate-500">
          <CheckCircle className="w-4 h-4 text-emerald-500 inline mr-2" />
          {diagram.caption}
        </div>
      );
  }
};
