"use client";
export default function PhotoInput({ label, value, onChange }) {
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }
  return (
    <div>
      <label className="block text-sm text-foreground/70 mb-1.5">{label}</label>
      {value ? (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none">&times;</button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-dashed border-border cursor-pointer hover:bg-background text-muted">
          <span className="text-xl leading-none">+</span>
          <span className="text-[11px] mt-1">Ambil foto</span>
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </label>
      )}
    </div>
  );
}
