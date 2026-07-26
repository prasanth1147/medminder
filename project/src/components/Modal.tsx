import { createPortal } from 'react-dom';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, onClose, title, subtitle, icon, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-teal-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-cardHover animate-slide-up"
      >
        <div className="flex items-start gap-3 p-5 sm:p-6 pb-4">
          {icon && (
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-teal-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-teal-600">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-teal-500 transition hover:bg-teal-50 hover:text-teal-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 sm:px-6 pb-2">{children}</div>

        {footer && <div className="sticky bottom-0 mt-2 flex items-center justify-end gap-2 bg-white/90 px-5 py-4 sm:px-6 backdrop-blur border-t border-teal-100">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
