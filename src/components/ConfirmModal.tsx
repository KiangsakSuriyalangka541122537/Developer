import React from 'react';
import { AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  showCancel = true,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const icons = {
    danger: <XCircle className="size-12 text-rose-500" />,
    warning: <AlertCircle className="size-12 text-amber-500" />,
    success: <CheckCircle2 className="size-12 text-emerald-500" />,
    info: <AlertCircle className="size-12 text-blue-500" />
  };

  const buttonColors = {
    danger: 'bg-rose-600 hover:bg-rose-700',
    warning: 'bg-amber-500 hover:bg-amber-600',
    success: 'bg-emerald-600 hover:bg-emerald-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-4 bg-slate-50 p-3 rounded-full">
            {icons[type]}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 font-medium">{message}</p>
        </div>
        <div className="px-6 py-4 bg-slate-50 flex gap-3">
          {showCancel && (
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all border border-slate-200 bg-white"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold transition-all shadow-md ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
