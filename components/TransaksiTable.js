"use client";

import { useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import StatusBadge from "./StatusBadge";
import { createReviewLink } from "@/lib/api";

export default function TransaksiTable({ data, onKembalikan, onEdit, onDelete }) {
  // Default: transaksi dengan tanggal sewa terbaru ditampilkan lebih dulu.
  const [sorting, setSorting] = useState([{ id: "tanggal_sewa", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [linkBusy, setLinkBusy] = useState(null);
  const [linkError, setLinkError] = useState("");

  function namaPenyewa(t) {
    return t.penyewa?.nama || t.nama_penyewa_manual || "\u2014";
  }

  const columns = [
    {
      accessorFn: (t) => namaPenyewa(t),
      id: "penyewa",
      header: "Penyewa",
      cell: (info) => {
        const t = info.row.original;
        return (
          <div>
            {namaPenyewa(t)}
            {!t.penyewa && <span className="text-xs text-muted block">manual · {t.no_hp_manual}</span>}
          </div>
        );
      },
    },
    {
      id: "barang",
      header: "Barang",
      cell: (info) => (info.row.original.barang || []).map((x) => x.barang?.nama_barang).filter(Boolean).join(", ") || "\u2014",
      enableSorting: false,
    },
    { accessorKey: "jenis_jaminan", header: "Jaminan", cell: (info) => info.getValue() || "\u2014" },
    {
      accessorKey: "tanggal_sewa",
      header: "Tgl sewa",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("id-ID"),
    },
    {
      accessorKey: "tanggal_kembali_rencana",
      header: "Tgl kembali",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("id-ID"),
    },
    { accessorKey: "status", header: "Status", cell: (info) => <StatusBadge status={info.getValue()} /> },
    {
      id: "aksi",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const t = info.row.original;
        return (
          <div className="flex items-center justify-end gap-3">
            {t.status !== "selesai" && (
              <button onClick={() => onKembalikan(t.ID)} className="text-xs text-navy hover:underline">Tandai kembali</button>
            )}
            {t.status === "selesai" && (
              <button
                disabled={linkBusy === t.ID}
                onClick={async () => {
                  setLinkError("");
                  setLinkBusy(t.ID);
                  try {
                    const { url } = await createReviewLink(t.ID);
                    try {
                      await navigator.clipboard.writeText(url);
                      alert("Link ulasan disalin. Anda juga dapat membagikannya melalui WhatsApp.");
                    } catch {
                      window.prompt("Salin link ulasan ini:", url);
                    }
                    if (confirm("Buka WhatsApp untuk mengirim link ulasan?")) {
                      const message = `Halo, terima kasih sudah menyewa di JasKita. Boleh bantu beri ulasan melalui link berikut? ${url}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
                    }
                  } catch (error) {
                    setLinkError(error.message);
                  } finally {
                    setLinkBusy(null);
                  }
                }}
                className="text-xs text-[#2447a8] hover:underline disabled:opacity-50"
              >
                {linkBusy === t.ID ? "Membuat…" : "Link ulasan"}
              </button>
            )}
            <button onClick={() => onEdit(t)} className="text-xs text-navy hover:underline">Edit</button>
            <button onClick={() => onDelete(t)} className="text-xs text-danger hover:underline">Hapus</button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left text-muted bg-background/50 border-b border-border">
                <th className="font-normal px-5 py-3 w-12">No</th>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    className={`font-normal px-5 py-3 whitespace-nowrap ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " \u2191", desc: " \u2193" }[header.column.getIsSorted()] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-5 py-6 text-center text-muted">Belum ada transaksi.</td></tr>
            ) : table.getRowModel().rows.map((row, i) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                {/* Nomor urut dihitung dari posisi baris SETELAH sorting &
                    pagination (i = index di array yang sedang ditampilkan),
                    bukan dari row.index bawaan TanStack yang ternyata
                    mengikuti posisi data mentah sebelum di-sort. */}
                <td className="px-5 py-3 text-muted">{pagination.pageIndex * pagination.pageSize + i + 1}</td>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {linkError && <p role="alert" className="px-5 py-2 text-xs text-danger">{linkError}</p>}

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm">
          <span className="text-muted">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()} · {data.length} transaksi</span>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 rounded-lg border border-border disabled:opacity-40">Sebelumnya</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 rounded-lg border border-border disabled:opacity-40">Berikutnya</button>
          </div>
        </div>
      )}
    </div>
  );
}