"use client";
const STYLE = {
  tersedia: "bg-success/10 text-success", disewa: "bg-danger/10 text-danger", dicuci: "bg-warning/10 text-warning",
  berjalan: "bg-warning/10 text-warning", terlambat: "bg-danger/10 text-danger", selesai: "bg-success/10 text-success",
};
export default function StatusBadge({ status }) {
  return <span className={`text-xs px-2 py-1 rounded-md capitalize ${STYLE[status] || "bg-background text-muted"}`}>{status}</span>;
}
