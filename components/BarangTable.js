"use client";

import { useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import StatusBadge from "./StatusBadge";
import RowActions from "./RowActions";

export default function BarangTable({ data, onEdit, onDelete }) {
  const [sorting, setSorting] = useState([]);

  const columns = [
    { accessorKey: "kode_barang", header: "Kode" },
    { accessorKey: "nama_barang", header: "Nama barang" },
    { accessorKey: "ukuran", header: "Ukuran" },
    { accessorKey: "type", header: "Tipe" },
    { accessorKey: "jumlah_barang", header: "Jumlah" },
    { accessorKey: "harga_satuan", header: "Harga modal", cell: (info) => `Rp${(info.getValue() || 0).toLocaleString("id-ID")}` },
    { accessorKey: "merk", header: "Merk" },
    { accessorKey: "status", header: "Status", cell: (info) => <StatusBadge status={info.getValue()} /> },
    { id: "aksi", header: "", cell: (info) => <RowActions onEdit={() => onEdit(info.row.original)} onDelete={() => onDelete(info.row.original)} /> },
  ];

  const table = useReactTable({
    data, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left text-muted bg-background/50 border-b border-border">
                {hg.headers.map((header) => (
                  <th key={header.id} onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined} className="font-normal px-5 py-3 select-none cursor-pointer whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " \u2191", desc: " \u2193" }[header.column.getIsSorted()] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-6 text-center text-muted">Tidak ada barang yang cocok.</td></tr>
            ) : table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm">
          <span className="text-muted">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 rounded-lg border border-border disabled:opacity-40">Sebelumnya</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 rounded-lg border border-border disabled:opacity-40">Berikutnya</button>
          </div>
        </div>
      )}
    </div>
  );
}
