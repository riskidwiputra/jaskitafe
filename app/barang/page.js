"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Modal from "@/components/Modal";
import BarangTable from "@/components/BarangTable";
import { Field, Input, Select, PrimaryButton } from "@/components/Form";
import { TIPE_BARANG } from "@/lib/constants";
import { getBarang, createBarang, updateBarang, deleteBarang } from "@/lib/api";

const EMPTY = {
  kode_barang: "", nama_barang: "", ukuran: "", jumlah_barang: "1", harga_satuan: "",
  type: TIPE_BARANG[0], dibeli_oleh: "", tanggal_beli: "", merk: "", toko: "",
  keterangan: "", link_pembelian: "", status: "tersedia",
};

export default function BarangPage() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterUkuran, setFilterUkuran] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDibeliOleh, setFilterDibeliOleh] = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await getBarang();
      setBarang(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openTambah() { setEditing(null); setForm(EMPTY); setOpen(true); }

  function openEdit(b) {
    setEditing(b);
    setForm({
      kode_barang: b.kode_barang || "", nama_barang: b.nama_barang || "", ukuran: b.ukuran || "",
      jumlah_barang: String(b.jumlah_barang || 1), harga_satuan: String(b.harga_satuan || ""),
      type: b.type || TIPE_BARANG[0], dibeli_oleh: b.dibeli_oleh || "",
      tanggal_beli: b.tanggal_beli ? b.tanggal_beli.slice(0, 10) : "",
      merk: b.merk || "", toko: b.toko || "", keterangan: b.keterangan || "",
      link_pembelian: b.link_pembelian || "", status: b.status || "tersedia",
    });
    setOpen(true);
  }

  async function handleDelete(b) {
    if (!confirm(`Hapus barang "${b.nama_barang}"? Data akan disembunyikan (soft delete).`)) return;
    try { await deleteBarang(b.ID); load(); } catch (err) { alert(err.message); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, jumlah_barang: Number(form.jumlah_barang), harga_satuan: Number(form.harga_satuan), tanggal_beli: form.tanggal_beli ? new Date(form.tanggal_beli).toISOString() : null };
    try {
      if (editing) await updateBarang(editing.ID, payload); else await createBarang(payload);
      setOpen(false); load();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  const ukuranCount = useMemo(() => { const m = {}; barang.forEach((b) => { m[b.ukuran] = (m[b.ukuran] || 0) + 1; }); return m; }, [barang]);
  const typeCount = useMemo(() => { const m = {}; barang.forEach((b) => { m[b.type] = (m[b.type] || 0) + 1; }); return m; }, [barang]);
  const dibeliOlehCount = useMemo(() => { const m = {}; barang.forEach((b) => { const k = b.dibeli_oleh || "(kosong)"; m[k] = (m[k] || 0) + 1; }); return m; }, [barang]);

  const filtered = useMemo(() => barang.filter((b) => {
    if (search && !b.nama_barang?.toLowerCase().includes(search.toLowerCase()) && !b.kode_barang?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterUkuran && b.ukuran !== filterUkuran) return false;
    if (filterType && b.type !== filterType) return false;
    if (filterDibeliOleh && (b.dibeli_oleh || "(kosong)") !== filterDibeliOleh) return false;
    if (tanggalDari && b.tanggal_beli && new Date(b.tanggal_beli) < new Date(tanggalDari)) return false;
    if (tanggalSampai && b.tanggal_beli && new Date(b.tanggal_beli) > new Date(tanggalSampai + "T23:59:59")) return false;
    return true;
  }), [barang, search, filterUkuran, filterType, filterDibeliOleh, tanggalDari, tanggalSampai]);

  const totalModalFiltered = useMemo(() => filtered.reduce((sum, b) => sum + (b.harga_satuan || 0) * (b.jumlah_barang || 1), 0), [filtered]);
  const adaFilterAktif = search || filterUkuran || filterType || filterDibeliOleh || tanggalDari || tanggalSampai;
  const daftarUkuran = Object.keys(ukuranCount).sort();
  const daftarDibeliOleh = Object.keys(dibeliOlehCount).sort();

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl">Barang</h1><p className="text-sm text-muted mt-1">Kelola modal & stok jas Anda</p></div>
        <PrimaryButton onClick={openTambah}>+ Tambah barang</PrimaryButton>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input placeholder="Cari nama atau kode barang..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy" />
        <select value={filterUkuran} onChange={(e) => setFilterUkuran(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy">
          <option value="">Semua ukuran ({barang.length})</option>
          {daftarUkuran.map((u) => <option key={u} value={u}>{u} ({ukuranCount[u]})</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy">
          <option value="">Semua tipe ({barang.length})</option>
          {TIPE_BARANG.map((t) => <option key={t} value={t}>{t} ({typeCount[t] || 0})</option>)}
        </select>
        <select value={filterDibeliOleh} onChange={(e) => setFilterDibeliOleh(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy">
          <option value="">Semua pembeli ({barang.length})</option>
          {daftarDibeliOleh.map((d) => <option key={d} value={d}>{d} ({dibeliOlehCount[d]})</option>)}
        </select>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div><label className="block text-xs text-muted mb-1">Tanggal beli dari</label><input type="date" value={tanggalDari} onChange={(e) => setTanggalDari(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy" /></div>
        <div><label className="block text-xs text-muted mb-1">Sampai</label><input type="date" value={tanggalSampai} onChange={(e) => setTanggalSampai(e.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy" /></div>
        {adaFilterAktif && <button onClick={() => { setSearch(""); setFilterUkuran(""); setFilterType(""); setFilterDibeliOleh(""); setTanggalDari(""); setTanggalSampai(""); }} className="text-sm text-muted hover:text-danger underline mb-0.5">Reset filter</button>}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-5 inline-flex flex-col">
        <p className="text-sm text-muted mb-1">Total modal {adaFilterAktif ? "(sesuai filter)" : "(semua barang)"}</p>
        <p className="font-display text-xl">Rp{totalModalFiltered.toLocaleString("id-ID")}</p>
        <p className="text-xs text-muted mt-1">{filtered.length} barang{filterDibeliOleh ? ` \u00b7 dibeli oleh ${filterDibeliOleh}` : ""}</p>
      </div>

      {loading && <p className="text-sm text-muted">Memuat...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && !error && <BarangTable data={filtered} onEdit={openEdit} onDelete={handleDelete} />}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit barang" : "Tambah barang"}>
        <form onSubmit={handleSubmit}>
          {editing && (
            <div className="mb-4 rounded-lg bg-background px-3.5 py-2.5 text-sm">
              <span className="text-muted">Kode barang: </span>
              <span className="font-medium">{editing.kode_barang}</span>
            </div>
          )}
          {!editing && (
            <p className="text-xs text-muted mb-4 -mt-1">Kode barang akan dibuat otomatis sesuai tipe yang dipilih (contoh: JP001).</p>
          )}
          <Field label="Nama barang"><Input required value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} placeholder="Jas Pria Goldy" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ukuran"><Input required value={form.ukuran} onChange={(e) => setForm({ ...form, ukuran: e.target.value })} placeholder="M / L / 32" /></Field>
            <Field label="Jumlah"><Input required type="number" min="1" value={form.jumlah_barang} onChange={(e) => setForm({ ...form, jumlah_barang: e.target.value })} /></Field>
          </div>
          <Field label="Harga modal (Rp)"><Input required type="number" value={form.harga_satuan} onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })} placeholder="377200" /></Field>
          <Field label="Tipe"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TIPE_BARANG.map((t) => <option key={t} value={t}>{t}</option>)}</Select></Field>
          <Field label="Tanggal beli"><Input type="date" value={form.tanggal_beli} onChange={(e) => setForm({ ...form, tanggal_beli: e.target.value })} /></Field>
          <Field label="Merk"><Input value={form.merk} onChange={(e) => setForm({ ...form, merk: e.target.value })} placeholder="Vente Series" /></Field>
          <Field label="Toko (opsional)"><Input value={form.toko} onChange={(e) => setForm({ ...form, toko: e.target.value })} /></Field>
          <Field label="Link pembelian (opsional)"><Input value={form.link_pembelian} onChange={(e) => setForm({ ...form, link_pembelian: e.target.value })} placeholder="https://shopee.co.id/..." /></Field>
          <Field label="Dibeli oleh"><Input value={form.dibeli_oleh} onChange={(e) => setForm({ ...form, dibeli_oleh: e.target.value })} placeholder="Putra" /></Field>
          <Field label="Keterangan (opsional)"><Input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></Field>
          {editing && <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["tersedia", "disewa", "dicuci", "rusak"].map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>}
          <PrimaryButton type="submit" disabled={saving} className="w-full">{saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan barang"}</PrimaryButton>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}