"use client";
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl border border-border w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-lg">{title}</p>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
