"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import { Field, Input, PrimaryButton } from "@/components/Form";
import { getPenyewa, createPenyewa, getTransaksi } from "@/lib/api";

const EMPTY = { nama: "", no_hp: "", alamat: "", catatan: "" };
function initials(name = "") { return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

export default function PenyewaPage() {
  const [penyewa, setPenyewa] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([getPenyewa(), getTransaksi()]);
      setPenyewa(p.data || []); setTransaksi(t.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try { await createPenyewa(form); setForm(EMPTY); setOpen(false); load(); }
    catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  function totalSewa(id) { return transaksi.filter((t) => t.penyewa_id === id).length; }

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl">Penyewa</h1><p className="text-sm text-muted mt-1">Data pelanggan yang pernah/sedang menyewa</p></div>
        <PrimaryButton onClick={() => setOpen(true)}>+ Tambah penyewa</PrimaryButton>
      </div>
      {loading && <p className="text-sm text-muted">Memuat...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && !error && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted bg-background/50 border-b border-border"><th className="font-normal px-5 py-3">Nama</th><th className="font-normal px-5 py-3">No. HP</th><th className="font-normal px-5 py-3">Total sewa</th><th className="font-normal px-5 py-3">Catatan</th></tr></thead>
            <tbody>
              {penyewa.length === 0 ? <tr><td colSpan={4} className="px-5 py-6 text-center text-muted">Belum ada penyewa.</td></tr> : penyewa.map((p) => (
                <tr key={p.ID} className="border-b border-border last:border-0">
                  <td className="px-5 py-3"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-navy/10 text-navy text-xs font-medium flex items-center justify-center shrink-0">{initials(p.nama)}</div>{p.nama}</div></td>
                  <td className="px-5 py-3">{p.no_hp}</td>
                  <td className="px-5 py-3">{totalSewa(p.ID)} kali</td>
                  <td className="px-5 py-3 text-muted">{p.catatan || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah penyewa">
        <form onSubmit={handleSubmit}>
          <Field label="Nama"><Input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Budi Santoso" /></Field>
          <Field label="No. HP"><Input required value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} placeholder="0812xxxxxxx" /></Field>
          <Field label="Alamat"><Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></Field>
          <Field label="Catatan"><Input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Langganan / dst" /></Field>
          <PrimaryButton type="submit" disabled={saving} className="w-full">{saving ? "Menyimpan..." : "Simpan penyewa"}</PrimaryButton>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}
