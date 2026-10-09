"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import StatusBadge from "@/components/StatusBadge";
import { getBarang, getTransaksi, getDenda, getPengeluaran } from "@/lib/api";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <p className="text-sm text-muted mb-2">{label}</p>
      <p className="font-display text-2xl text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

function rupiah(n) { return `Rp${Math.round(n || 0).toLocaleString("id-ID")}`; }

function isWithin(dateStr, period, now) {
  const d = new Date(dateStr);
  if (period === "hari-ini") return d.toDateString() === now.toDateString();
  if (period === "bulan-ini") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === "tahun-ini") return d.getFullYear() === now.getFullYear();
  return true;
}

const PERIODS = [{ key: "hari-ini", label: "Hari ini" }, { key: "bulan-ini", label: "Bulan ini" }, { key: "tahun-ini", label: "Tahun ini" }, { key: "semua", label: "Keseluruhan" }];
const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function DashboardPage() {
  const [barang, setBarang] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [denda, setDenda] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periode, setPeriode] = useState("bulan-ini");

  useEffect(() => {
    async function load() {
      try {
        const [b, t, d, p] = await Promise.all([getBarang(), getTransaksi(), getDenda(), getPengeluaran()]);
        setBarang(b.data || []); setTransaksi(t.data || []); setDenda(d.data || []); setPengeluaran(p.data || []);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    }
    load();
  }, []);

  const tersedia = barang.filter((b) => b.status === "tersedia").length;
  const disewa = barang.filter((b) => b.status === "disewa").length;
  const totalModalBarang = barang.reduce((sum, b) => sum + (b.harga_satuan || 0) * (b.jumlah_barang || 1), 0);
  const totalModalPengeluaran = pengeluaran.filter((p) => p.kategori === "Modal").reduce((sum, p) => sum + (p.jumlah || 0), 0);
  const totalModal = totalModalBarang + totalModalPengeluaran;
  const totalPernahSewa = transaksi.length;
  const transaksiTerbaru = [...transaksi].slice(-5).reverse();
  const now = new Date();

  function ringkasan(period) {
    const sewaMasuk = transaksi.filter((t) => isWithin(t.tanggal_sewa, period, now)).reduce((sum, t) => sum + (t.harga_sewa || 0), 0);
    const dendaMasuk = denda.filter((d) => isWithin(d.CreatedAt, period, now)).reduce((sum, d) => sum + (d.jumlah || 0), 0);
    const keluar = pengeluaran.filter((p) => p.kategori !== "Modal" && isWithin(p.tanggal, period, now)).reduce((sum, p) => sum + (p.jumlah || 0), 0);
    const kotor = sewaMasuk + dendaMasuk;
    return { kotor, bersih: kotor - keluar, keluar };
  }
  const r = ringkasan(periode);

  // Tren 6 bulan terakhir — pendapatan bersih per bulan, buat lihat naik/turun.
  function dataTren() {
    const bulanList = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      bulanList.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return bulanList.map(({ year, month }) => {
      const inBulan = (dateStr) => { const d = new Date(dateStr); return d.getFullYear() === year && d.getMonth() === month; };
      const sewaMasuk = transaksi.filter((t) => inBulan(t.tanggal_sewa)).reduce((s, t) => s + (t.harga_sewa || 0), 0);
      const dendaMasuk = denda.filter((d) => inBulan(d.CreatedAt)).reduce((s, d) => s + (d.jumlah || 0), 0);
      const keluar = pengeluaran.filter((p) => p.kategori !== "Modal" && inBulan(p.tanggal)).reduce((s, p) => s + (p.jumlah || 0), 0);
      return { label: `${NAMA_BULAN[month]} '${String(year).slice(2)}`, bersih: sewaMasuk + dendaMasuk - keluar };
    });
  }
  const tren = dataTren();
  const bulanIni = tren[tren.length - 1]?.bersih || 0;
  const bulanLalu = tren[tren.length - 2]?.bersih || 0;
  const perubahanPersen = bulanLalu !== 0 ? Math.round(((bulanIni - bulanLalu) / Math.abs(bulanLalu)) * 100) : (bulanIni > 0 ? 100 : 0);
  const naik = bulanIni >= bulanLalu;

  return (
    <ProtectedLayout>
      <div className="mb-7"><h1 className="font-display text-2xl">Dashboard</h1><p className="text-sm text-muted mt-1">Ringkasan usaha sewa jas Anda</p></div>
      {loading && <p className="text-sm text-muted">Memuat data...</p>}
      {error && <div className="text-sm rounded-lg px-3.5 py-2.5 bg-danger/10 text-danger border border-danger/20 mb-5">{error} — pastikan backend Golang sedang berjalan di localhost:8080.</div>}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-5 gap-4 mb-6">
            <StatCard label="Barang tersedia" value={tersedia} />
            <StatCard label="Sedang disewa" value={disewa} />
            <StatCard label="Total pernah sewa" value={totalPernahSewa} sub="Semua transaksi" />
            <StatCard label="Total modal" value={rupiah(totalModal)} sub="Barang + suntikan modal" />
            <StatCard label="Total denda tercatat" value={rupiah(denda.reduce((s, d) => s + (d.jumlah || 0), 0))} />
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">Tren Pendapatan Bersih (6 bulan terakhir)</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${naik ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                {naik ? "\u2191" : "\u2193"} {Math.abs(perubahanPersen)}% dari bulan lalu
              </span>
            </div>
            <p className="text-xs text-muted mb-4">Bulan ini: {rupiah(bulanIni)} · Bulan lalu: {rupiah(bulanLalu)}</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={tren} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}rb`} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip formatter={(v) => rupiah(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 13 }} />
                  <Line type="monotone" dataKey="bersih" stroke="var(--navy)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--navy)" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Pendapatan</p>
              <div className="flex gap-1 bg-background rounded-lg p-1">
                {PERIODS.map((p) => (
                  <button key={p.key} onClick={() => setPeriode(p.key)} className={`text-xs px-3 py-1.5 rounded-md transition-colors ${periode === p.key ? "bg-surface shadow-sm font-medium text-navy" : "text-muted"}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-background p-4"><p className="text-xs text-muted mb-1.5">Pendapatan kotor</p><p className="font-display text-xl">{rupiah(r.kotor)}</p><p className="text-xs text-muted mt-1">Sewa + denda</p></div>
              <div className="rounded-xl bg-background p-4"><p className="text-xs text-muted mb-1.5">Pengeluaran</p><p className="font-display text-xl text-danger">{rupiah(r.keluar)}</p><p className="text-xs text-muted mt-1">Biaya operasional</p></div>
              <div className="rounded-xl bg-navy p-4"><p className="text-xs text-white/70 mb-1.5">Pendapatan bersih</p><p className="font-display text-xl text-white">{rupiah(r.bersih)}</p><p className="text-xs text-white/60 mt-1">Kotor − pengeluaran</p></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-sm font-medium mb-4">Transaksi terbaru</p>
            {transaksiTerbaru.length === 0 ? <p className="text-sm text-muted">Belum ada transaksi.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted border-b border-border"><th className="font-normal pb-2">Penyewa</th><th className="font-normal pb-2">Tgl sewa</th><th className="font-normal pb-2">Tgl kembali</th><th className="font-normal pb-2">Status</th></tr></thead>
                <tbody>
                  {transaksiTerbaru.map((t) => (
                    <tr key={t.ID} className="border-b border-border last:border-0">
                      <td className="py-2.5">{t.penyewa?.nama || t.nama_penyewa_manual || "—"}</td>
                      <td className="py-2.5">{new Date(t.tanggal_sewa).toLocaleDateString("id-ID")}</td>
                      <td className="py-2.5">{new Date(t.tanggal_kembali_rencana).toLocaleDateString("id-ID")}</td>
                      <td className="py-2.5"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </ProtectedLayout>
  );
}
