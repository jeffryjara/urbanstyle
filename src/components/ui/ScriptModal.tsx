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

  // Academic presets & Teacher explanation guide
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SQL_PRESETS[0].id);
  const [showDocenteGuide, setShowDocenteGuide] = useState<boolean>(true);
  const [copiedDocenteGuide, setCopiedDocenteGuide] = useState<boolean>(false);

  // Script viewer state
  const [selectedScriptId, setSelectedScriptId] = useState<string>('script-01');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Current active preset object
  const activePreset = SQL_PRESETS.find((p) => p.id === selectedPresetId) || SQL_PRESETS[0];

  // Execute initial query when opened
  useEffect(() => {
    if (isOpen && !queryResult) {
      handleRunQuery(SQL_PRESETS[0].sql);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunQuery = (customQuery?: string) => {
    const q = customQuery !== undefined ? customQuery : sqlQuery;
    setIsExecuting(true);

    setTimeout(() => {
      const res = executeSQL(q);
      setQueryResult(res);
      setIsExecuting(false);

      if (res.operation === 'INSERT' || res.operation === 'UPDATE' || res.operation === 'DELETE' || res.operation === 'EXEC') {
        if (onDatabaseMutated) onDatabaseMutated();
      }
    }, 120);
  };

  const handleSelectPreset = (preset: SqlPreset) => {
    setSelectedPresetId(preset.id);
    setSqlQuery(preset.sql);
    handleRunQuery(preset.sql);
  };

  const handleCopy = (text: string, isScript = false) => {
    navigator.clipboard.writeText(text);
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
    setTimeout(() => setCopiedDocenteGuide(false), 2200);
  };

  const selectedScript = CLASSMATE_SCRIPTS.find((s) => s.id === selectedScriptId) || CLASSMATE_SCRIPTS[0];

  const handleLoadScriptToConsole = (sqlSnippet: string) => {
    setSqlQuery(sqlSnippet);
    setActiveTab('console');
    handleRunQuery(sqlSnippet);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-3xl bg-[#0b0c13]/98 border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-apple-emerald/15 border border-apple-emerald/30 flex items-center justify-center text-apple-emerald shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold font-display text-white tracking-tight">
                  Urban Style — SQL & Analytics Studio
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-apple-emerald/15 text-apple-emerald border border-apple-emerald/25">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                Motor relacional reactivo en vivo & repositorio completo de scripts SQL y PySpark
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'console'
                    ? 'bg-apple-blue text-white shadow-sm'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Consola SQL en Vivo</span>
              </button>
              <button
                onClick={() => setActiveTab('scripts')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'scripts'
                    ? 'bg-apple-blue text-white shadow-sm'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Scripts del Proyecto</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: CONSOLA SQL INTERACTIVA CON GUÍA DOCENTE */}
        {activeTab === 'console' && (
          <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5 space-y-3.5 overflow-hidden">
            {/* 11 Quick Action Presets Chips with Category Badges (No Scrollbar) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
              <span className="text-[11px] font-mono text-[#86868B] uppercase shrink-0 mr-1 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-apple-blue" />
                Presets Académicos:
              </span>

              {SQL_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-apple-blue text-white border-apple-blue shadow-apple-glow'
                        : preset.badgeColor === 'emerald'
                        ? 'bg-apple-emerald/10 text-apple-emerald border-apple-emerald/25 hover:bg-apple-emerald/20'
                        : preset.badgeColor === 'red'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        : preset.badgeColor === 'purple'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
                        : preset.badgeColor === 'amber'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                        : 'bg-white/[0.04] text-[#F5F5F7] border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{preset.title}</span>
                  </button>
                );
              })}
            </div>

            {/* SQL EDITOR BOX */}
            <div className="relative rounded-2xl bg-[#06070a] border border-white/10 overflow-hidden shrink-0 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[11px] font-mono text-[#86868B] ml-2">
                    UrbanStylosDB & UrbanStylosDW (T-SQL Session)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(sqlQuery)}
                    className="p-1 rounded text-[#86868B] hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Copiar consulta"
                  >
                    {copiedQuery ? <Check className="w-3.5 h-3.5 text-apple-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuery ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => setSqlQuery('')}
                    className="p-1 rounded text-[#86868B] hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Limpiar consulta"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                rows={3}
                placeholder="Escribe tu consulta SQL aquí (ej: SELECT * FROM VarianteProducto)..."
                className="w-full p-3.5 font-mono text-sm text-apple-emerald bg-transparent resize-none focus:outline-none placeholder-[#636366] leading-relaxed selection:bg-apple-blue/30"
              />

              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#86868B]">
                    Atajo: <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">Ctrl + Enter</kbd> para ejecutar
                  </span>

                  {/* Toggle Academic Guide Button */}
                  <button
                    onClick={() => setShowDocenteGuide(!showDocenteGuide)}
                    className="text-xs font-semibold text-apple-blue hover:text-apple-blueLight flex items-center gap-1.5 cursor-pointer ml-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{showDocenteGuide ? 'Ocultar Explicación para el Docente' : 'Ver Explicación para el Docente'}</span>
                    {showDocenteGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <GlassButton
                  variant="emerald"
                  size="sm"
                  icon={<Play className="w-3.5 h-3.5 fill-current" />}
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting}
                >
                  {isExecuting ? 'Ejecutando...' : 'Ejecutar Consulta'}
                </GlassButton>
              </div>
            </div>

            {/* ACADEMIC EXPLANATION PANEL FOR THE TEACHER (LINE-BY-LINE & Q&A) */}
            {showDocenteGuide && activePreset && (
              <div className="rounded-2xl bg-white/[0.025] border border-white/10 p-4 shrink-0 max-h-48 overflow-y-auto custom-scrollbar no-scrollbar transition-all space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Fundamento Académico: {activePreset.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-apple-blue/20 text-apple-blueLight border border-apple-blue/30">
                          {activePreset.category}
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#A1A1A6]">
                        {activePreset.theoryConcept}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyDocenteGuide(activePreset)}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#F5F5F7] border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copiar todo el guion para exponer al profesor"
                  >
                    {copiedDocenteGuide ? <Check className="w-3.5 h-3.5 text-apple-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDocenteGuide ? 'Guion Copiado' : 'Copiar Guion para Exposición'}</span>
                  </button>
                </div>

                {/* What to tell the professor directly */}
                <div className="p-3 rounded-xl bg-apple-blue/5 border border-apple-blue/15 text-xs text-white leading-relaxed">
                  <span className="font-bold text-apple-blueLight block mb-1">🗣️ Qué decirle al Docente:</span>
                  <p className="text-[#E5E5EA]">{activePreset.academicDocenteNote}</p>
                </div>

                {/* Line by line breakdown */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block mb-1.5">
                    📋 Desglose Línea por Línea:
                  </span>
                  <div className="space-y-1.5">
                    {activePreset.lineByLine.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-start gap-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white shrink-0">
                          Línea {item.lineNum}
                        </span>
                        <code className="font-mono text-apple-emerald shrink-0 max-w-xs truncate">
                          {item.code}
                        </code>
                        <span className="text-[#A1A1A6] text-xs">
                          {item.explanation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Q&A */}
                {activePreset.teacherQuestions && activePreset.teacherQuestions.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block mb-1.5">
                      ❓ Preguntas Clave que puede hacer el Docente:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activePreset.teacherQuestions.map((q, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                          <span className="font-bold text-white block mb-1">
                            {q.question}
                          </span>
                          <p className="text-[#86868B] text-[11px] leading-relaxed">
                            {q.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LIVE QUERY RESULT GRID */}
            <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-[#06070a] border border-white/10 overflow-hidden">
              {/* Result Meta Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {queryResult?.isError ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-apple-emerald" />
                    )}
                    <span className="text-xs font-semibold text-white">
                      {queryResult?.isError ? 'Error en ejecución' : 'Resultado de Consulta'}
                    </span>
                  </div>

                  {queryResult && (
                    <span className="text-xs text-[#86868B]">
                      {queryResult.rowCount} fila(s) • {queryResult.executionTimeMs} ms
                    </span>
                  )}
                </div>

                {queryResult?.message && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      queryResult.isError
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-apple-emerald/10 text-apple-emerald border border-apple-emerald/20'
                    }`}
                  >
                    {queryResult.message}
                  </span>
                )}
              </div>

              {/* Real-time sync notification badge */}
              {queryResult?.affectedRows && queryResult.affectedRows > 0 && (
                <div className="px-4 py-2 bg-apple-blue/10 border-b border-apple-blue/20 flex items-center justify-between text-xs text-apple-blueLight shrink-0">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-apple-blue" />
                    <strong>Sincronización en tiempo real:</strong> Los cambios en la base de datos se reflejaron instantáneamente en la Terminal POS, Inventario y Dashboard.
                  </span>
                </div>
              )}

              {/* Table Result Display (no-scrollbar on horizontal axis, sleek custom-scrollbar on vertical) */}
              <div className="flex-1 overflow-x-auto no-scrollbar overflow-y-auto custom-scrollbar">
                {queryResult && queryResult.columns.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03] sticky top-0 z-10 backdrop-blur-md">
                        {queryResult.columns.map((col, idx) => (
                          <th
                            key={idx}
                            className="py-2.5 px-4 font-mono font-semibold text-[#A1A1A6] uppercase tracking-wider text-[11px] whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {queryResult.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-white/[0.04] transition-colors"
                        >
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="py-2.5 px-4 text-[#F5F5F7] whitespace-nowrap"
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
                  <div className="h-full flex items-center justify-center text-xs text-[#86868B]">
                    Ejecuta una consulta SQL para ver la tabla de resultados.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCRIPTS UNIFICADOS */}
        {activeTab === 'scripts' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Sidebar List of Scripts */}
            <div className="w-full md:w-80 border-r border-white/10 p-4 space-y-3 shrink-0 flex flex-col overflow-y-auto custom-scrollbar bg-black/20">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#86868B]">
                Módulos de Código
              </span>

              <div className="space-y-2">
                {CLASSMATE_SCRIPTS.map((script) => {
                  const isSelected = script.id === selectedScriptId;
                  return (
                    <button
                      key={script.id}
                      onClick={() => setSelectedScriptId(script.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-apple-blue/15 border-apple-blue/30 text-white'
                          : 'bg-white/[0.02] border-white/5 text-[#A1A1A6] hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white">
                          {script.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {script.title}
                      </h4>
                      <p className="text-xs text-[#86868B] line-clamp-2 mt-1 leading-relaxed">
                        {script.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Script Viewer & Action Bar */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#06070a] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">
                    {selectedScript.title}
                  </h4>
                  <p className="text-xs text-[#86868B]">
                    {selectedScript.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    icon={copiedScript ? <Check className="w-3.5 h-3.5 text-apple-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    onClick={() => handleCopy(selectedScript.code, true)}
                  >
                    {copiedScript ? 'Copiado al portapapeles' : 'Copiar Código'}
                  </GlassButton>

                  <GlassButton
                    variant="primary"
                    size="sm"
                    icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    onClick={() => handleLoadScriptToConsole(selectedScript.code.slice(0, 1500))}
                  >
                    Cargar en Consola
                  </GlassButton>
                </div>
              </div>

              {/* Code Preformatted Block */}
              <div className="flex-1 overflow-auto p-5 custom-scrollbar">
                <pre className="font-mono text-xs text-[#E5E5EA] leading-relaxed select-text whitespace-pre">
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
