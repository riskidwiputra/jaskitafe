"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import { Field, Input, Select, PrimaryButton } from "@/components/Form";
import { KATEGORI_PENGELUARAN } from "@/lib/constants";
import { getPengeluaran, createPengeluaran, updatePengeluaran, deletePengeluaran } from "@/lib/api";

const EMPTY = { tanggal: "", kategori: KATEGORI_PENGELUARAN[0], jumlah: "", keterangan: "", dikeluarkanOleh: "" };

export default function PengeluaranPage() {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [filterDikeluarkanOleh, setFilterDikeluarkanOleh] = useState("");

  async function load() {
    setLoading(true);
    try { const res = await getPengeluaran(); setPengeluaran(res.data || []); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openTambah() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(p) {
    setEditing(p);
    setForm({ tanggal: p.tanggal ? p.tanggal.slice(0, 10) : "", kategori: p.kategori || KATEGORI_PENGELUARAN[0], jumlah: String(p.jumlah || ""), keterangan: p.keterangan || "", dikeluarkanOleh: p.dikeluarkan_oleh || "" });
    setOpen(true);
  }

  async function handleDelete(p) {
    if (!confirm("Hapus pengeluaran ini?")) return;
    try { await deletePengeluaran(p.ID); load(); } catch (err) { alert(err.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { tanggal: new Date(form.tanggal).toISOString(), kategori: form.kategori, jumlah: Number(form.jumlah), keterangan: form.keterangan, dikeluarkan_oleh: form.dikeluarkanOleh };
      if (editing) await updatePengeluaran(editing.ID, payload); else await createPengeluaran(payload);
      setOpen(false); load();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  const dikeluarkanOlehCount = useMemo(() => { const m = {}; pengeluaran.forEach((p) => { const k = p.dikeluarkan_oleh || "(kosong)"; m[k] = (m[k] || 0) + 1; }); return m; }, [pengeluaran]);
  const daftarDikeluarkanOleh = Object.keys(dikeluarkanOlehCount).sort();

  const filtered = useMemo(() => pengeluaran.filter((p) => {
    if (filterDikeluarkanOleh && (p.dikeluarkan_oleh || "(kosong)") !== filterDikeluarkanOleh) return false;
    if (tanggalDari && p.tanggal && new Date(p.tanggal) < new Date(tanggalDari)) return false;
    if (tanggalSampai && p.tanggal && new Date(p.tanggal) > new Date(tanggalSampai + "T23:59:59")) return false;
    return true;
  }), [pengeluaran, tanggalDari, tanggalSampai, filterDikeluarkanOleh]);

  const totalModalFiltered = filtered.filter((p) => p.kategori === "Modal").reduce((sum, p) => sum + (p.jumlah || 0), 0);
  const totalOperasionalFiltered = filtered.filter((p) => p.kategori !== "Modal").reduce((sum, p) => sum + (p.jumlah || 0), 0);
  const adaFilterAktif = tanggalDari || tanggalSampai || filterDikeluarkanOleh;

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl">Pengeluaran</h1><p className="text-sm text-muted mt-1">Kategori &quot;Modal&quot; nambah Total Modal di dashboard, kategori lain jadi biaya operasional</p></div>
        <PrimaryButton onClick={openTambah}>+ Tambah pengeluaran</PrimaryButton>
      </div>
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div><label className="block text-xs text-muted mb-1">Tanggal dari</label><input type="date" value={tanggalDari} onChange={(e) => setTanggalDari(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy" /></div>
        <div><label className="block text-xs text-muted mb-1">Sampai</label><input type="date" value={tanggalSampai} onChange={(e) => setTanggalSampai(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy" /></div>
        <div><label className="block text-xs text-muted mb-1">Dikeluarkan oleh</label><select value={filterDikeluarkanOleh} onChange={(e) => setFilterDikeluarkanOleh(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy"><option value="">Semua ({pengeluaran.length})</option>{daftarDikeluarkanOleh.map((d) => <option key={d} value={d}>{d} ({dikeluarkanOlehCount[d]})</option>)}</select></div>
        {adaFilterAktif && <button onClick={() => { setTanggalDari(""); setTanggalSampai(""); setFilterDikeluarkanOleh(""); }} className="text-sm text-muted hover:text-danger underline mb-0.5">Reset filter</button>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5 max-w-md">
        <div className="bg-surface border border-border rounded-2xl p-5"><p className="text-sm text-muted mb-1">Modal {adaFilterAktif ? "(sesuai filter)" : "(semua data)"}</p><p className="font-display text-xl">Rp{totalModalFiltered.toLocaleString("id-ID")}</p></div>
        <div className="bg-surface border border-border rounded-2xl p-5"><p className="text-sm text-muted mb-1">Operasional {adaFilterAktif ? "(sesuai filter)" : "(semua data)"}</p><p className="font-display text-xl">Rp{totalOperasionalFiltered.toLocaleString("id-ID")}</p></div>
      </div>
      {loading && <p className="text-sm text-muted">Memuat...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && !error && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted bg-background/50 border-b border-border"><th className="font-normal px-5 py-3">Tanggal</th><th className="font-normal px-5 py-3">Kategori</th><th className="font-normal px-5 py-3">Jumlah</th><th className="font-normal px-5 py-3">Dikeluarkan oleh</th><th className="font-normal px-5 py-3">Keterangan</th><th className="font-normal px-5 py-3"></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className="px-5 py-6 text-center text-muted">Tidak ada pengeluaran yang cocok.</td></tr> : filtered.map((p) => (
                <tr key={p.ID} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{new Date(p.tanggal).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-md ${p.kategori === "Modal" ? "bg-navy/10 text-navy" : "bg-warning/10 text-warning"}`}>{p.kategori}</span></td>
                  <td className="px-5 py-3">Rp{(p.jumlah || 0).toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3">{p.dikeluarkan_oleh || "\u2014"}</td>
                  <td className="px-5 py-3 text-muted">{p.keterangan || "\u2014"}</td>
                  <td className="px-5 py-3"><div className="flex items-center justify-end gap-3"><button onClick={() => openEdit(p)} className="text-xs text-navy hover:underline">Edit</button><button onClick={() => handleDelete(p)} className="text-xs text-danger hover:underline">Hapus</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit pengeluaran" : "Tambah pengeluaran"}>
        <form onSubmit={handleSubmit}>
          <Field label="Tanggal"><Input required type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></Field>
          <Field label="Kategori"><Select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>{KATEGORI_PENGELUARAN.map((k) => <option key={k} value={k}>{k}</option>)}</Select>{form.kategori === "Modal" && <p className="text-xs text-navy mt-1.5">Kategori ini akan menambah Total Modal di dashboard.</p>}</Field>
          <Field label="Jumlah (Rp)"><Input required type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} placeholder="50000" /></Field>
          <Field label="Dikeluarkan oleh"><Input value={form.dikeluarkanOleh} onChange={(e) => setForm({ ...form, dikeluarkanOleh: e.target.value })} placeholder="Putra" /></Field>
          <Field label="Keterangan (opsional)"><Input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></Field>
          <PrimaryButton type="submit" disabled={saving} className="w-full">{saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan pengeluaran"}</PrimaryButton>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}
