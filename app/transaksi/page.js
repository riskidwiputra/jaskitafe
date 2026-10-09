"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import TransaksiTable from "@/components/TransaksiTable";
import BarangPicker from "@/components/BarangPicker";
import PhotoInput from "@/components/PhotoInput";
import { Field, Input, Select, PrimaryButton } from "@/components/Form";
import { getTransaksi, createTransaksi, updateTransaksi, deleteTransaksi, kembalikanTransaksi, getPenyewa, getBarang } from "@/lib/api";

const TABS = ["semua", "berjalan", "terlambat", "selesai"];
const JENIS_JAMINAN = ["KTP", "SIM", "Deposit"];
const EMPTY_FORM = {
  modePenyewa: "data", penyewaId: "", namaManual: "", noHpManual: "", pilihBarang: [],
  tanggalSewa: "", tanggalKembali: "", hargaSewa: "", jenisJaminan: JENIS_JAMINAN[0], fotoPeminjam: "", keterangan: "",
};

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [penyewaList, setPenyewaList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("semua");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    try {
      const [t, p, b] = await Promise.all([getTransaksi(), getPenyewa(), getBarang()]);
      setTransaksi(t.data || []); setPenyewaList(p.data || []); setBarangList(b.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function update(patch) { setForm((prev) => ({ ...prev, ...patch })); }
  function openTambah() { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }

  function openEdit(t) {
    setEditing(t);
    setForm({
      ...EMPTY_FORM, modePenyewa: t.penyewa ? "data" : "manual", penyewaId: t.penyewa?.ID || "",
      namaManual: t.nama_penyewa_manual || "", noHpManual: t.no_hp_manual || "",
      pilihBarang: (t.barang || []).map((x) => x.barang_id), tanggalKembali: t.tanggal_kembali_rencana?.slice(0, 10) || "",
      hargaSewa: String(t.harga_sewa || ""), jenisJaminan: t.jenis_jaminan || JENIS_JAMINAN[0],
      fotoPeminjam: t.foto_peminjam || "", keterangan: t.keterangan || "",
    });
    setOpen(true);
  }

  async function handleDelete(t) {
    if (!confirm(`Hapus transaksi ${namaPenyewa(t)}? Kalau statusnya belum selesai, barangnya otomatis kembali "tersedia".`)) return;
    try { await deleteTransaksi(t.ID); load(); } catch (err) { alert(err.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      setSaving(true);
      try {
        await updateTransaksi(editing.ID, {
          nama_penyewa_manual: form.modePenyewa === "manual" ? form.namaManual : "",
          no_hp_manual: form.modePenyewa === "manual" ? form.noHpManual : "",
          tanggal_kembali_rencana: new Date(form.tanggalKembali).toISOString(),
          harga_sewa: Number(form.hargaSewa), jenis_jaminan: form.jenisJaminan,
          foto_peminjam: form.fotoPeminjam, keterangan: form.keterangan,
        });
        setOpen(false); load();
      } catch (err) { alert(err.message); } finally { setSaving(false); }
      return;
    }
    if (form.pilihBarang.length === 0) return alert("Pilih minimal 1 barang");
    if (form.modePenyewa === "data" && !form.penyewaId) return alert("Pilih penyewa dari data, atau ganti ke input manual");
    if (form.modePenyewa === "manual" && !form.namaManual) return alert("Isi nama penyewa manual");
    setSaving(true);
    try {
      await createTransaksi({
        penyewa_id: form.modePenyewa === "data" ? Number(form.penyewaId) : null,
        nama_penyewa_manual: form.modePenyewa === "manual" ? form.namaManual : "",
        no_hp_manual: form.modePenyewa === "manual" ? form.noHpManual : "",
        tanggal_sewa: new Date(form.tanggalSewa).toISOString(), tanggal_kembali_rencana: new Date(form.tanggalKembali).toISOString(),
        harga_sewa: Number(form.hargaSewa), jenis_jaminan: form.jenisJaminan, foto_peminjam: form.fotoPeminjam, keterangan: form.keterangan,
        barang: form.pilihBarang.map((id) => ({ barang_id: id, harga_item: 0 })),
      });
      setForm(EMPTY_FORM); setOpen(false); load();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  async function handleKembalikan(id) {
    if (!confirm("Tandai transaksi ini sudah dikembalikan?")) return;
    try { await kembalikanTransaksi(id); load(); } catch (err) { alert(err.message); }
  }

  function namaPenyewa(t) { return t.penyewa?.nama || t.nama_penyewa_manual || "\u2014"; }
  const barangTersedia = barangList.filter((b) => b.status === "tersedia");
  const filtered = tab === "semua" ? transaksi : transaksi.filter((t) => t.status === tab);

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl">Transaksi</h1><p className="text-sm text-muted mt-1">Riwayat sewa jas</p></div>
        <PrimaryButton onClick={openTambah}>+ Sewa baru</PrimaryButton>
      </div>
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`text-sm px-3 py-1.5 rounded-lg capitalize transition-colors ${tab === t ? "bg-navy/10 text-navy font-medium" : "text-muted hover:bg-surface"}`}>{t}</button>)}
      </div>
      {loading && <p className="text-sm text-muted">Memuat...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && !error && (
        <TransaksiTable data={filtered} onKembalikan={handleKembalikan} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit transaksi" : "Sewa baru"}>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => update({ modePenyewa: "data" })} className={`flex-1 text-sm py-2 rounded-lg border ${form.modePenyewa === "data" ? "border-navy bg-navy/10 text-navy font-medium" : "border-border text-muted"}`}>Dari data penyewa</button>
            <button type="button" onClick={() => update({ modePenyewa: "manual" })} className={`flex-1 text-sm py-2 rounded-lg border ${form.modePenyewa === "manual" ? "border-navy bg-navy/10 text-navy font-medium" : "border-border text-muted"}`}>Input manual</button>
          </div>
          {form.modePenyewa === "data" ? (
            <Field label="Penyewa"><Select required={!editing} disabled={!!editing} value={form.penyewaId} onChange={(e) => update({ penyewaId: e.target.value })}><option value="">Pilih penyewa</option>{penyewaList.map((p) => <option key={p.ID} value={p.ID}>{p.nama}</option>)}</Select></Field>
          ) : (
            <>
              <Field label="Nama penyewa"><Input required value={form.namaManual} onChange={(e) => update({ namaManual: e.target.value })} placeholder="Nama tanpa disimpan ke data penyewa" /></Field>
              <Field label="No. HP"><Input value={form.noHpManual} onChange={(e) => update({ noHpManual: e.target.value })} placeholder="0812xxxxxxx" /></Field>
            </>
          )}
          {editing ? (
            <Field label="Barang disewa"><p className="text-sm text-muted bg-background rounded-lg px-3.5 py-2.5">{(editing.barang || []).map((x) => x.barang?.nama_barang).filter(Boolean).join(", ") || "\u2014"}</p><p className="text-xs text-muted mt-1">Daftar barang tidak bisa diubah lewat edit.</p></Field>
          ) : (
            <Field label={`Barang disewa (${form.pilihBarang.length} dipilih)`}><BarangPicker barangTersedia={barangTersedia} selected={form.pilihBarang} onChange={(pilihBarang) => update({ pilihBarang })} /></Field>
          )}
          {!editing && <Field label="Tanggal sewa"><Input required type="date" value={form.tanggalSewa} onChange={(e) => update({ tanggalSewa: e.target.value })} /></Field>}
          <Field label="Tanggal kembali (rencana)"><Input required type="date" value={form.tanggalKembali} onChange={(e) => update({ tanggalKembali: e.target.value })} /></Field>
          <Field label="Harga sewa (Rp)"><Input required type="number" value={form.hargaSewa} onChange={(e) => update({ hargaSewa: e.target.value })} placeholder="150000" /></Field>
          <Field label="Jenis jaminan"><Select value={form.jenisJaminan} onChange={(e) => update({ jenisJaminan: e.target.value })}>{JENIS_JAMINAN.map((j) => <option key={j} value={j}>{j}</option>)}</Select></Field>
          <Field label="Foto peminjam / dokumentasi (opsional)"><PhotoInput label="" value={form.fotoPeminjam} onChange={(fotoPeminjam) => update({ fotoPeminjam })} /></Field>
          <Field label="Keterangan (opsional)"><Input value={form.keterangan} onChange={(e) => update({ keterangan: e.target.value })} /></Field>
          <PrimaryButton type="submit" disabled={saving} className="w-full">{saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan transaksi"}</PrimaryButton>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}