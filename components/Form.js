"use client";
export function Field({ label, children }) {
  return (<div className="mb-4"><label className="block text-sm text-foreground/70 mb-1.5">{label}</label>{children}</div>);
}
export function Input(props) {
  return <input {...props} className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-navy transition-colors" />;
}
export function Select(props) {
  return <select {...props} className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-navy transition-colors" />;
}
export function PrimaryButton({ children, ...props }) {
  return (
    <button {...props} className="rounded-lg bg-navy text-white text-sm font-medium px-4 py-2.5 hover:bg-navy-light transition-colors disabled:opacity-60">
      {children}
    </button>
  );
}
