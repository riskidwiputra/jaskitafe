"use client";

import { useMemo, useState, useRef, useEffect } from "react";

export default function BarangPicker({ barangTersedia, selected, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItems = useMemo(() => barangTersedia.filter((b) => selected.includes(b.ID)), [barangTersedia, selected]);

  const results = useMemo(() => {
    const belumDipilih = barangTersedia.filter((b) => !selected.includes(b.ID));
    if (!query) return belumDipilih.slice(0, 8);
    const q = query.toLowerCase();
    return belumDipilih.filter((b) => b.nama_barang?.toLowerCase().includes(q) || b.kode_barang?.toLowerCase().includes(q)).slice(0, 8);
  }, [barangTersedia, selected, query]);

  function add(id) {
    onChange([...selected, id]);
    setQuery("");
  }
  function remove(id) {
    onChange(selected.filter((x) => x !== id));
  }

  return (
    <div ref={wrapperRef} className="relative">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedItems.map((b) => (
            <span key={b.ID} className="inline-flex items-center gap-1.5 bg-navy/10 text-navy text-xs px-2.5 py-1 rounded-md">
              {b.nama_barang} · {b.ukuran}
              <button type="button" onClick={() => remove(b.ID)} className="hover:text-danger">&times;</button>
            </span>
          ))}
        </div>
      )}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Cari nama atau kode barang..."
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-navy"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-muted px-3.5 py-2.5">Tidak ada barang tersedia yang cocok.</p>
          ) : results.map((b) => (
            <button type="button" key={b.ID} onClick={() => add(b.ID)} className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-background flex items-center justify-between">
              <span>{b.nama_barang} · {b.ukuran}</span>
              <span className="text-xs text-muted">{b.kode_barang}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
