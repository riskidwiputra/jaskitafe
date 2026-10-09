import { getToken, clearSession } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Sesi berakhir, silakan login lagi");
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error || "Terjadi kesalahan, coba lagi");
  }

  return body;
}

// --- Auth ---
export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const register = (data) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(data) });

// --- Barang ---
export const getBarang = () => request("/barang");
export const createBarang = (data) => request("/barang", { method: "POST", body: JSON.stringify(data) });
export const updateBarang = (id, data) => request(`/barang/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBarang = (id) => request(`/barang/${id}`, { method: "DELETE" });

// --- Penyewa ---
export const getPenyewa = () => request("/penyewa");
export const createPenyewa = (data) => request("/penyewa", { method: "POST", body: JSON.stringify(data) });

// --- Transaksi Sewa ---
export const getTransaksi = () => request("/transaksi-sewa");
export const createTransaksi = (data) => request("/transaksi-sewa", { method: "POST", body: JSON.stringify(data) });
export const updateTransaksi = (id, data) => request(`/transaksi-sewa/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTransaksi = (id) => request(`/transaksi-sewa/${id}`, { method: "DELETE" });
export const kembalikanTransaksi = (id) => request(`/transaksi-sewa/${id}/kembalikan`, { method: "PUT" });

// --- Denda ---
export const getDenda = (transaksiId) => request(transaksiId ? `/denda?transaksi_id=${transaksiId}` : "/denda");
export const createDenda = (data) => request("/denda", { method: "POST", body: JSON.stringify(data) });
export const updateDenda = (id, data) => request(`/denda/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDenda = (id) => request(`/denda/${id}`, { method: "DELETE" });

// --- Pengeluaran ---
export const getPengeluaran = () => request("/pengeluaran");
export const createPengeluaran = (data) => request("/pengeluaran", { method: "POST", body: JSON.stringify(data) });
export const updatePengeluaran = (id, data) => request(`/pengeluaran/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePengeluaran = (id) => request(`/pengeluaran/${id}`, { method: "DELETE" });
