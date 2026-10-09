"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { getTransaksi, getDenda, getPengeluaran } from "@/lib/api";

function rupiah(n) { return `Rp${Math.round(n || 0).toLocaleString("id-ID")}`; }

const TABS = [
  { key: "harian", label: "Harian" },
  { key: "bulanan", label: "Bulanan" },
  { key: "tahunan", label: "Tahunan" },
];

export default function LaporanPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [denda, setDenda] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("harian");

  useEffect(() => {
    async function load() {
      try {
        const [t, d, p] = await Promise.all([getTransaksi(), getDenda(), getPengeluaran()]);
        setTransaksi(t.data || []);
        setDenda(d.data || []);
        setPengeluaran(p.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Gabungkan 3 sumber data jadi satu buku kas:
  // - Uang masuk: hasil sewa (harga_sewa) + denda
  // - Uang keluar: pengeluaran yang BUKAN kategori "Modal" (modal tidak
  //   dianggap "pengeluaran operasional", sesuai aturan yang sudah kita
  //   sepakati sebelumnya)
  const entries = useMemo(() => {
    const list = [];
    transaksi.forEach((t) => {
      const nama = t.penyewa?.nama || t.nama_penyewa_manual || "Tanpa nama";
      const namaBarang = (t.barang || []).map((x) => x.barang?.nama_barang).filter(Boolean).join(", ");
      list.push({
        tanggal: t.tanggal_sewa,
        jenis: "masuk",
        kategori: "Sewa",
        keterangan: `${nama}${namaBarang ? " · " + namaBarang : ""}`,
        jumlah: t.harga_sewa || 0,
      });
    });
    denda.forEach((d) => {
      const nama = d.transaksi_sewa?.penyewa?.nama || d.transaksi_sewa?.nama_penyewa_manual || "Tanpa nama";
      list.push({ tanggal: d.CreatedAt, jenis: "masuk", kategori: "Denda", keterangan: `${nama} · ${d.alasan || ""}`, jumlah: d.jumlah || 0 });
    });
    pengeluaran.filter((p) => p.kategori !== "Modal").forEach((p) => {
      list.push({ tanggal: p.tanggal, jenis: "keluar", kategori: p.kategori, keterangan: p.keterangan || p.dikeluarkan_oleh || "-", jumlah: p.jumlah || 0 });
    });
    return list.filter((e) => e.tanggal).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }, [transaksi, denda, pengeluaran]);

  const totalMasuk = entries.filter((e) => e.jenis === "masuk").reduce((s, e) => s + e.jumlah, 0);
  const totalKeluar = entries.filter((e) => e.jenis === "keluar").reduce((s, e) => s + e.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  // Pengelompokan sesuai tab: harian per tanggal persis, bulanan per
  // bulan+tahun, tahunan per tahun saja.
  const grouped = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      const d = new Date(e.tanggal);
      let key, label;
      if (tab === "harian") {
        key = d.toISOString().slice(0, 10);
        label = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      } else if (tab === "bulanan") {
        key = `${d.getFullYear()}-${d.getMonth()}`;
        label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      } else {
        key = `${d.getFullYear()}`;
        label = `Tahun ${d.getFullYear()}`;
      }
      if (!map.has(key)) map.set(key, { label, entries: [], masuk: 0, keluar: 0 });
      const g = map.get(key);
      g.entries.push(e);
      if (e.jenis === "masuk") g.masuk += e.jumlah; else g.keluar += e.jumlah;
    });
    return Array.from(map.values());
  }, [entries, tab]);

  return (
    <ProtectedLayout>
      <div className="mb-7">
        <h1 className="font-display text-2xl">Buku Kas</h1>
        <p className="text-sm text-muted mt-1">Uang masuk (sewa + denda) dan uang keluar (pengeluaran non-modal), digabung dalam satu catatan</p>
      </div>

      {loading && <p className="text-sm text-muted">Memuat data...</p>}
      {error && <div className="text-sm rounded-lg px-3.5 py-2.5 bg-danger/10 text-danger border border-danger/20 mb-5">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-success/10 border border-success/20 p-5">
              <p className="text-sm text-success/80 mb-1">Total Pemasukan</p>
              <p className="font-display text-xl text-success">{rupiah(totalMasuk)}</p>
            </div>
            <div className="rounded-2xl bg-danger/10 border border-danger/20 p-5">
              <p className="text-sm text-danger/80 mb-1">Total Pengeluaran</p>
              <p className="font-display text-xl text-danger">{rupiah(totalKeluar)}</p>
            </div>
            <div className="rounded-2xl bg-navy p-5">
              <p className="text-sm text-white/70 mb-1">Saldo</p>
              <p className="font-display text-xl text-white">{rupiah(saldo)}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${tab === t.key ? "bg-navy text-white font-medium" : "bg-surface border border-border text-muted"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {grouped.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-10 text-center text-muted text-sm">Belum ada transaksi tercatat.</div>
          ) : (
            <div className="space-y-4">
              {grouped.map((g, i) => (
                <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-background/60 border-b border-border">
                    <p className="text-sm font-medium">{g.label}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-success">+{rupiah(g.masuk)}</span>
                      <span className="text-danger">-{rupiah(g.keluar)}</span>
                    </div>
                  </div>
                  {tab === "harian" ? (
                    <div>
                      {g.entries.map((e, j) => (
                        <div key={j} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0">
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded-md mr-2 ${e.jenis === "masuk" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{e.kategori}</span>
                            <span className="text-sm">{e.keterangan}</span>
                          </div>
                          <span className={`text-sm font-medium ${e.jenis === "masuk" ? "text-success" : "text-danger"}`}>
                            {e.jenis === "masuk" ? "+" : "-"}{rupiah(e.jumlah)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-3 text-sm text-muted">{g.entries.length} transaksi pada periode ini · Saldo periode: {rupiah(g.masuk - g.keluar)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </ProtectedLayout>
  );
}
