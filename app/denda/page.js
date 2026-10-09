"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import { Field, Input, Select, PrimaryButton } from "@/components/Form";
import { getDenda, createDenda, updateDenda, deleteDenda, getTransaksi } from "@/lib/api";

const EMPTY = { transaksiId: "", jumlah: "", alasan: "" };

export default function DendaPage() {
  const [denda, setDenda] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  async function load() {
    setLoading(true);
    try {
      const [d, t] = await Promise.all([getDenda(), getTransaksi()]);
      setDenda(d.data || []); setTransaksi(t.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openTambah() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(d) { setEditing(d); setForm({ transaksiId: String(d.transaksi_sewa_id), jumlah: String(d.jumlah), alasan: d.alasan }); setOpen(true); }

  async function handleDelete(d) {
    if (!confirm("Hapus catatan denda ini?")) return;
    try { await deleteDenda(d.ID); load(); } catch (err) { alert(err.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { transaksi_sewa_id: Number(form.transaksiId), jumlah: Number(form.jumlah), alasan: form.alasan };
      if (editing) await updateDenda(editing.ID, payload); else await createDenda(payload);
      setOpen(false); load();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  const totalDenda = denda.reduce((sum, d) => sum + (d.jumlah || 0), 0);

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl">Denda</h1><p className="text-sm text-muted mt-1">Catatan denda manual, terhubung ke transaksi</p></div>
        <PrimaryButton onClick={openTambah}>+ Tambah denda</PrimaryButton>
      </div>
      <div className="bg-surface border border-border rounded-2xl p-5 mb-5 flex gap-8">
        <div><p className="text-sm text-muted mb-1">Total denda</p><p className="font-display text-xl">Rp{totalDenda.toLocaleString("id-ID")}</p></div>
        <div><p className="text-sm text-muted mb-1">Jumlah catatan</p><p className="font-display text-xl">{denda.length}</p></div>
      </div>
      {loading && <p className="text-sm text-muted">Memuat...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && !error && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted bg-background/50 border-b border-border"><th className="font-normal px-5 py-3">Penyewa</th><th className="font-normal px-5 py-3">Alasan</th><th className="font-normal px-5 py-3">Jumlah</th><th className="font-normal px-5 py-3">Tanggal dicatat</th><th className="font-normal px-5 py-3"></th></tr></thead>
            <tbody>
              {denda.length === 0 ? <tr><td colSpan={5} className="px-5 py-6 text-center text-muted">Belum ada catatan denda.</td></tr> : denda.map((d) => (
                <tr key={d.ID} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{d.transaksi_sewa?.penyewa?.nama || d.transaksi_sewa?.nama_penyewa_manual || "\u2014"}</td>
                  <td className="px-5 py-3">{d.alasan}</td>
                  <td className="px-5 py-3">Rp{(d.jumlah || 0).toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3 text-muted">{new Date(d.CreatedAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-3"><div className="flex items-center justify-end gap-3"><button onClick={() => openEdit(d)} className="text-xs text-navy hover:underline">Edit</button><button onClick={() => handleDelete(d)} className="text-xs text-danger hover:underline">Hapus</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit denda" : "Tambah denda"}>
        <form onSubmit={handleSubmit}>
          <Field label="Transaksi"><Select required value={form.transaksiId} onChange={(e) => setForm({ ...form, transaksiId: e.target.value })}><option value="">Pilih transaksi</option>{transaksi.map((t) => <option key={t.ID} value={t.ID}>{(t.penyewa?.nama || t.nama_penyewa_manual)} \u2014 {new Date(t.tanggal_sewa).toLocaleDateString("id-ID")}</option>)}</Select></Field>
          <Field label="Jumlah denda (Rp)"><Input required type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} placeholder="75000" /></Field>
          <Field label="Alasan"><Input required value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} placeholder="Telat kembalikan 3 hari" /></Field>
          <PrimaryButton type="submit" disabled={saving} className="w-full">{saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan denda"}</PrimaryButton>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}
