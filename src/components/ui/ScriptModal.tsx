import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  Database,
  Layers,
  Sparkles,
  Search,
  X,
  FileCode,
  Zap,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GlassButton } from './GlassButton';
import { Toast, useToastNotification } from './Toast';
import { executeSQL } from '../../utils/sqlEngine';
import { CLASSMATE_SCRIPTS } from '../../data/classmateScripts';
import { SQL_PRESETS, type SqlPreset } from '../../data/sqlPresets';
import type { QueryResult } from '../../types';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseMutated?: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  onDatabaseMutated,
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'scripts'>('console');

  // Interactive Console state
  const [sqlQuery, setSqlQuery] = useState<string>(SQL_PRESETS[0].sql);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  // Academic presets & Teacher explanation guide (collapsed by default for ultra-clean layout)
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SQL_PRESETS[0].id);
  const [showDocenteGuide, setShowDocenteGuide] = useState<boolean>(false);
  const [copiedDocenteGuide, setCopiedDocenteGuide] = useState<boolean>(false);

  // Script viewer state
  const [selectedScriptId, setSelectedScriptId] = useState<string>('script-01');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const { toast, showNotification, clearToast } = useToastNotification();

  // Current active preset object
  const activePreset = SQL_PRESETS.find((p) => p.id === selectedPresetId) || SQL_PRESETS[0];

  // Execute initial query when opened
  useEffect(() => {
    if (isOpen && !queryResult) {
      handleRunQuery(SQL_PRESETS[0].sql, false);
    }
  }, [isOpen]);

  // Close modal when pressing Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunQuery = (customQuery?: string, notify = true) => {
    const q = customQuery !== undefined ? customQuery : sqlQuery;
    setIsExecuting(true);

    setTimeout(() => {
      const res = executeSQL(q);
      setQueryResult(res);
      setIsExecuting(false);

      if (notify) {
        if (res.isError) {
          showNotification('Restricción SQL activada: violación de restricción', 'warning');
        } else {
          showNotification(`Consulta ejecutada (${res.rowCount} filas)`, 'success');
        }
      }

      if (res.operation === 'INSERT' || res.operation === 'UPDATE' || res.operation === 'DELETE' || res.operation === 'EXEC') {
        if (onDatabaseMutated) onDatabaseMutated();
      }
    }, 120);
  };

  const handleSelectPreset = (preset: SqlPreset) => {
    setSelectedPresetId(preset.id);
    setSqlQuery(preset.sql);
    handleRunQuery(preset.sql, true);
  };

  const handleCopy = (text: string, isScript = false) => {
    navigator.clipboard.writeText(text);
    showNotification('Código copiado al portapapeles', 'success');
    if (isScript) {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    }
  };

  const handleCopyDocenteGuide = (preset: SqlPreset) => {
    const text = `=== EXPLICACIÓN PARA EL DOCENTE: ${preset.title} ===\n` +
      `Categoría: ${preset.category}\n` +
      `Fundamento Teórico: ${preset.theoryConcept}\n\n` +
      `Guion para Explicar al Docente:\n${preset.academicDocenteNote}\n\n` +
      `Desglose Línea por Línea:\n` +
      preset.lineByLine.map((l) => `[Línea ${l.lineNum}] ${l.code}\n-> ${l.explanation}`).join('\n\n') +
      `\n\nPreguntas Típicas del Docente y Respuestas:\n` +
      preset.teacherQuestions.map((q) => `P: ${q.question}\nR: ${q.answer}`).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedDocenteGuide(true);
    showNotification('Guion docente copiado con éxito', 'success');
    setTimeout(() => setCopiedDocenteGuide(false), 2200);
  };

  const selectedScript = CLASSMATE_SCRIPTS.find((s) => s.id === selectedScriptId) || CLASSMATE_SCRIPTS[0];

  const handleLoadScriptToConsole = (sqlSnippet: string) => {
    setSqlQuery(sqlSnippet);
    setActiveTab('console');
    handleRunQuery(sqlSnippet, true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <Toast message={toast} onClose={clearToast} />
      <div
        className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-[34px] bg-[#0a0a0a] border border-white/[0.09] shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden animate-modal-bounce"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MINIMALIST MODAL HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.08] shrink-0">
          <h3 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight">
            SQL Studio
          </h3>

          <div className="flex items-center gap-4">
            {/* View Mode Tabs */}
            <div className="flex items-center p-1.5 rounded-full bg-[#141414] border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('console')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-spring cursor-pointer ${
                  activeTab === 'console'
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Consola
              </button>
              <button
                onClick={() => setActiveTab('scripts')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-spring cursor-pointer ${
                  activeTab === 'scripts'
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Scripts
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#141414] text-[#8E8E93] hover:text-white hover:bg-white/10 transition-all duration-300 ease-spring cursor-pointer"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* TAB 1: CONSOLA SQL INTERACTIVA */}
        {activeTab === 'console' && (
          <div className="flex-1 flex flex-col min-h-0 p-6 md:p-8 space-y-5 overflow-hidden">
            {/* Quick Action Presets Chips */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
              {SQL_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-spring shrink-0 cursor-pointer border active:scale-95 ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-[#141414] text-[#8E8E93] border-white/[0.07] hover:text-white hover:bg-[#1c1c1c]'
                    }`}
                  >
                    <span>{preset.title}</span>
                  </button>
                );
              })}
            </div>

            {/* SQL EDITOR BOX */}
            <div className="relative rounded-2xl bg-black border border-white/[0.09] overflow-hidden shrink-0 flex flex-col">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={3}
                placeholder="SELECT * FROM VarianteProducto..."
                className="w-full p-5 font-mono text-base md:text-lg text-white bg-transparent resize-none focus:outline-none placeholder-[#636366] leading-relaxed"
              />

              <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.07] bg-[#0e0e0e]">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setShowDocenteGuide(!showDocenteGuide)}
                    className="text-sm font-bold text-white hover:text-[#D4D4D8] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <GraduationCap className="w-4.5 h-4.5" />
                    <span>{showDocenteGuide ? 'Ocultar Guía Docente' : 'Guía Docente'}</span>
                    {showDocenteGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleCopy(sqlQuery)}
                    className="text-sm font-semibold text-[#8E8E93] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedQuery ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedQuery ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={<Play className="w-4 h-4 fill-current" />}
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting}
                  className="rounded-full px-6 py-2.5 text-sm font-bold"
                >
                  {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
                </GlassButton>
              </div>
            </div>

            {/* ACADEMIC EXPLANATION PANEL FOR THE TEACHER */}
            {showDocenteGuide && activePreset && (
              <div className="rounded-2xl bg-[#111111] border border-white/[0.09] p-5 shrink-0 max-h-56 overflow-y-auto custom-scrollbar no-scrollbar transition-all space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2.5">
                      <span>{activePreset.title}</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                        {activePreset.category}
                      </span>
                    </h4>
                    <p className="text-xs text-[#8E8E93] mt-0.5">
                      {activePreset.theoryConcept}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyDocenteGuide(activePreset)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/15 text-xs font-bold text-white border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    {copiedDocenteGuide ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDocenteGuide ? 'Copiado' : 'Copiar Guion'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-white/[0.07] text-sm text-[#E5E5E7] leading-relaxed">
                  <span className="font-bold text-white block mb-1">Explicación para el Docente:</span>
                  <p>{activePreset.academicDocenteNote}</p>
                </div>

                <div className="space-y-2">
                  {activePreset.lineByLine.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/60 border border-white/[0.05] flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-white font-bold shrink-0">
                        L{item.lineNum}
                      </span>
                      <code className="font-mono text-white font-semibold shrink-0 max-w-xs truncate">
                        {item.code}
                      </code>
                      <span className="text-[#8E8E93]">
                        {item.explanation}
                      </span>
                    </div>
                  ))}
                </div>

                {activePreset.teacherQuestions && activePreset.teacherQuestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {activePreset.teacherQuestions.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-black/60 border border-white/[0.05] text-xs">
                        <span className="font-bold text-white block mb-1">
                          {q.question}
                        </span>
                        <p className="text-[#8E8E93] leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LIVE QUERY RESULT GRID */}
            <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-black border border-white/[0.09] overflow-hidden">
              {/* Minimalist Result Meta Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] bg-[#0e0e0e] shrink-0">
                <span className="text-sm font-bold text-white">
                  {queryResult?.isError
                    ? 'Error de sintaxis o restricción'
                    : `${queryResult?.rowCount ?? 0} filas`}
                </span>

                {queryResult?.isError || (queryResult?.affectedRows && queryResult.affectedRows > 0) ? (
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      queryResult.isError
                        ? 'bg-red-500/15 text-[#FF453A] border border-red-500/25'
                        : 'bg-white/15 text-white'
                    }`}
                  >
                    {queryResult.message}
                  </span>
                ) : (
                  queryResult && (
                    <span className="text-xs font-mono text-[#8E8E93]">
                      {queryResult.executionTimeMs} ms
                    </span>
                  )
                )}
              </div>

              {/* Table Result Display */}
              <div className="flex-1 overflow-x-auto no-scrollbar overflow-y-auto custom-scrollbar">
                {queryResult && queryResult.columns.length > 0 ? (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-[#111111] sticky top-0 z-10">
                        {queryResult.columns.map((col, idx) => (
                          <th
                            key={idx}
                            className="py-3.5 px-5 font-mono font-bold text-[#8E8E93] uppercase tracking-wider text-xs whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05] font-mono">
                      {queryResult.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="py-3.5 px-5 text-[#F5F5F7] whitespace-nowrap"
                            >
                              {cell === null ? (
                                <span className="text-[#636366] italic">NULL</span>
                              ) : typeof cell === 'boolean' ? (
                                cell ? 'TRUE' : 'FALSE'
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex items-center justify-center text-base text-[#8E8E93]">
                    {queryResult?.message || 'Ejecuta una consulta SQL'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCRIPTS UNIFICADOS (MINIMALIST & HOMOGENEOUS) */}
        {activeTab === 'scripts' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Minimalist Left Sidebar of Scripts */}
            <div className="w-full md:w-72 border-r border-white/[0.08] p-5 space-y-2.5 shrink-0 flex flex-col overflow-y-auto custom-scrollbar bg-[#0c0c0c]">
              {CLASSMATE_SCRIPTS.map((script, idx) => {
                const isSelected = script.id === selectedScriptId;
                const cleanTitle = script.title.includes('—')
                  ? script.title.split('—')[1].trim()
                  : script.title;
                return (
                  <button
                    key={script.id}
                    onClick={() => setSelectedScriptId(script.id)}
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 ease-spring cursor-pointer border active:scale-[0.98] ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-lg font-extrabold'
                        : 'bg-[#141414] border-white/[0.06] text-[#A1A1A6] hover:bg-[#1c1c1c] hover:text-white font-semibold'
                    }`}
                  >
                    <span
                      className={`text-xs font-mono block mb-1 ${
                        isSelected ? 'text-black/60' : 'text-[#8E8E93]'
                      }`}
                    >
                      0{idx + 1} • {script.category}
                    </span>
                    <span className="text-base block truncate">
                      {cleanTitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Clean Script Viewer & Single-Line Action Bar */}
            <div className="flex-1 flex flex-col min-h-0 bg-black overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-7 py-4 border-b border-white/[0.08] bg-[#0e0e0e] shrink-0">
                <h4 className="text-lg md:text-xl font-extrabold text-white font-display truncate">
                  {selectedScript.title}
                </h4>

                <div className="flex items-center gap-3 shrink-0">
                  <GlassButton
                    variant="glass"
                    size="sm"
                    icon={copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    onClick={() => handleCopy(selectedScript.code, true)}
                    className="whitespace-nowrap rounded-full px-5"
                  >
                    {copiedScript ? 'Copiado' : 'Copiar'}
                  </GlassButton>

                  <GlassButton
                    variant="primary"
                    size="sm"
                    icon={<Play className="w-4 h-4 fill-current" />}
                    onClick={() => handleLoadScriptToConsole(selectedScript.code.slice(0, 1500))}
                    className="whitespace-nowrap rounded-full px-5"
                  >
                    Consola
                  </GlassButton>
                </div>
              </div>

              {/* Code Preformatted Block without Horizontal Scrollbar */}
              <div className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar custom-scrollbar p-7">
                <pre className="font-mono text-sm text-[#D4D4D8] leading-relaxed select-text whitespace-pre">
                  <code>{selectedScript.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
