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
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/[0.09] rounded-[34px] p-7 md:p-9 shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden text-[#F5F5F7] animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] relative z-10">
          <h3 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
            Cliente
          </h3>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#141414] text-[#8E8E93] hover:text-white hover:bg-white/10 transition-all duration-300 ease-spring cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 pt-6 relative z-10">
          {/* Document Type Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[#141414] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setDocType('Boleta');
                if (doc.length === 11) {
                  setDoc('00000000');
                  setName('Consumidor Final');
                }
              }}
              className={`py-3 px-4 rounded-xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer ${
                docType === 'Boleta'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Boleta (DNI)
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
              className={`py-3 px-4 rounded-xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer ${
                docType === 'Factura'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Factura (RUC)
            </button>
          </div>

          {/* Document Number Input */}
          <div>
            <label className="text-sm font-semibold text-[#8E8E93] block mb-2">
              {docType === 'Factura' ? 'RUC (11 dígitos)' : 'DNI (8 dígitos)'}
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
              className="w-full px-5 py-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] text-lg font-mono text-white placeholder-[#636366] focus:outline-none focus:border-white/40 transition-all duration-300 ease-spring"
            />
          </div>

          {/* Client Name Input */}
          <div>
            <label className="text-sm font-semibold text-[#8E8E93] block mb-2">
              {docType === 'Factura' ? 'Razón Social' : 'Nombre'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={docType === 'Factura' ? 'Empresa S.A.C.' : 'Consumidor Final'}
              className="w-full px-5 py-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] text-lg text-white placeholder-[#636366] focus:outline-none focus:border-white/40 transition-all duration-300 ease-spring"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-sm font-semibold text-[#8E8E93] block mb-2.5">
              Frecuentes
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_CUSTOMERS.map((preset) => (
                <button
                  key={preset.doc}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-3.5 rounded-2xl border transition-all duration-300 ease-spring cursor-pointer ${
                    doc === preset.doc
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-[#141414] border-white/[0.06] text-[#A1A1A6] hover:bg-[#1c1c1c] hover:text-white'
                  }`}
                >
                  <div className="font-bold truncate text-sm">{preset.name}</div>
                  <div className={`text-xs mt-1 font-mono ${doc === preset.doc ? 'text-black/70' : 'text-[#8E8E93]'}`}>
                    {preset.doc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-[#FF453A]">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-3">
            <GlassButton
              type="button"
              variant="glass"
              size="md"
              onClick={onClose}
              className="w-full"
            >
              Cancelar
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
            >
              Guardar
            </GlassButton>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
};
