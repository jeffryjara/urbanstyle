import React, { useState, useEffect } from 'react';
import { UserCheck, X, Building, Check, Sparkles } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { GlassButton } from './GlassButton';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentDoc: string;
  currentDocType: 'Boleta' | 'Factura';
  onSave: (name: string, doc: string, docType: 'Boleta' | 'Factura') => void;
}

const PRESET_CUSTOMERS = [
  {
    name: 'Consumidor Final',
    doc: '00000000',
    type: 'Boleta' as const,
    label: 'Público General',
  },
  {
    name: 'Inversiones Deportivas S.A.C.',
    doc: '20608941231',
    type: 'Factura' as const,
    label: 'Cliente Corporativo B2B',
  },
  {
    name: 'Calzados Lima S.R.L.',
    doc: '20485910243',
    type: 'Factura' as const,
    label: 'Distribuidor Autorizado',
  },
  {
    name: 'Carlos Mendoza Ramos',
    doc: '47893012',
    type: 'Boleta' as const,
    label: 'Cliente Habitual (DNI)',
  },
];

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentDoc,
  currentDocType,
  onSave,
}) => {
  const [docType, setDocType] = useState<'Boleta' | 'Factura'>(currentDocType);
  const [name, setName] = useState(currentName);
  const [doc, setDoc] = useState(currentDoc);
  const [error, setError] = useState<string | null>(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setDocType(currentDocType);
      setName(currentName);
      setDoc(currentDoc);
      setError(null);
    }
  }, [isOpen, currentName, currentDoc, currentDocType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDoc = doc.trim();

    if (!trimmedName) {
      setError('Por favor ingrese el nombre o razón social');
      return;
    }

    if (!trimmedDoc) {
      setError('Por favor ingrese el número de documento');
      return;
    }

    if (docType === 'Factura' && trimmedDoc.length !== 11) {
      setError('El RUC para Factura debe tener exactamente 11 dígitos');
      return;
    }

    if (docType === 'Boleta' && trimmedDoc.length !== 8 && trimmedDoc !== '00000000') {
      setError('El DNI debe tener 8 dígitos o 00000000 para Consumidor Final');
      return;
    }

    onSave(trimmedName, trimmedDoc, docType);
    onClose();
  };

  const handleSelectPreset = (preset: typeof PRESET_CUSTOMERS[0]) => {
    setDocType(preset.type);
    setName(preset.name);
    setDoc(preset.doc);
    setError(null);
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-[#F5F5F7] animate-scale-in">
        {/* Soft background ambient blur */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-apple-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-apple-purple/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Datos del Cliente / Adquirente
              </h3>
              <p className="text-xs md:text-sm text-[#86868B]">
                Emisión oficial SUNAT (Boleta o Factura Electrónica)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-4 relative z-10">
          {/* Document Type Selector Segment */}
          <div>
            <label className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block mb-1.5">
              Tipo de Comprobante
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setDocType('Boleta');
                  if (doc.length === 11) {
                    setDoc('00000000');
                    setName('Consumidor Final');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  docType === 'Boleta'
                    ? 'bg-apple-blue text-white shadow-apple-glow font-semibold'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <span>Boleta (DNI)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocType('Factura');
                  if (doc === '00000000' || doc.length === 8) {
                    setDoc('20608941231');
                    setName('Inversiones Deportivas S.A.C.');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  docType === 'Factura'
                    ? 'bg-apple-blue text-white shadow-apple-glow font-semibold'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Factura (RUC)</span>
              </button>
            </div>
          </div>

          {/* Document Number Input */}
          <div>
            <label className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block mb-1.5">
              {docType === 'Factura' ? 'RUC de la Empresa (11 dígitos)' : 'DNI del Cliente (8 dígitos)'}
            </label>
            <input
              type="text"
              value={doc}
              onChange={(e) => {
                setDoc(e.target.value.replace(/[^0-9]/g, ''));
                setError(null);
              }}
              maxLength={docType === 'Factura' ? 11 : 8}
              placeholder={docType === 'Factura' ? '20608941231' : '00000000'}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-base font-mono text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
            />
          </div>

          {/* Client Name Input */}
          <div>
            <label className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block mb-1.5">
              {docType === 'Factura' ? 'Razón Social' : 'Nombre Completo / Razón Social'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={docType === 'Factura' ? 'Empresa S.A.C.' : 'Consumidor Final'}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-base text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-apple-blueLight" />
              <span>Sugerencias Frecuentes</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_CUSTOMERS.map((preset) => (
                <button
                  key={preset.doc}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-3 rounded-2xl border text-sm transition-all cursor-pointer ${
                    doc === preset.doc
                      ? 'bg-apple-blue/15 border-apple-blue/40 text-white'
                      : 'bg-white/[0.02] border-white/5 text-[#A1A1A6] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-white truncate text-sm">{preset.name}</div>
                  <div className="text-xs text-[#86868B] mt-1 font-mono">
                    {preset.type}: {preset.doc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-[#FF453A] animate-shake">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3">
            <GlassButton
              type="button"
              variant="glass"
              size="md"
              onClick={onClose}
              className="text-sm font-semibold"
            >
              Cancelar
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              icon={<Check className="w-4 h-4" />}
              className="text-sm font-semibold"
            >
              Guardar Datos
            </GlassButton>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
};
