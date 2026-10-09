"use client";
export default function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-3">
      <button onClick={onEdit} className="text-xs text-navy hover:underline">Edit</button>
      <button onClick={onDelete} className="text-xs text-danger hover:underline">Hapus</button>
    </div>
  );
}
