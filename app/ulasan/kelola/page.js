"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { deleteReview, getReviews, reactivateReviewLink, updateReview } from "@/lib/api";
import { getReviewPhotoUrl } from "@/lib/review-photo-url";

const LINK_STATUS = {
  belum_digunakan: { label: "Belum digunakan", className: "bg-blue-50 text-blue-800" },
  sudah_digunakan: { label: "Sudah digunakan", className: "bg-amber-50 text-amber-800" },
  kedaluwarsa: { label: "Kedaluwarsa", className: "bg-gray-100 text-gray-700" },
};

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";
}

export default function KelolaUlasan() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [editing, setEditing] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      const result = await getReviews();
      setData(result.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getReviews()
      .then((result) => {
        if (active) setData(result.data || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });
    return () => {
      active = false;
    };
  }, []);

  function startEditing(review) {
    setEditing(review.ID || review.id);
    setRating(review.rating);
    setComment(review.kritik_saran);
    setError("");
  }

  async function saveReview(event) {
    event.preventDefault();
    setBusy(editing);
    setError("");
    try {
      await updateReview(editing, { rating, kritik_saran: comment });
      setEditing(null);
      await loadReviews();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(null);
    }
  }

  async function removeReview(review) {
    if (!window.confirm("Hapus ulasan ini beserta foto-fotonya?")) return;
    const id = review.ID || review.id;
    setBusy(id);
    setError("");
    try {
      await deleteReview(id);
      setEditing(null);
      await loadReviews();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(null);
    }
  }

  async function reactivateLink(transaksiId) {
    setBusy(`link-${transaksiId}`);
    setError("");
    try {
      await reactivateReviewLink(transaksiId);
      await loadReviews();
    } catch (linkError) {
      setError(linkError.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-navy">Ulasan pelanggan</h1>
        <p className="mt-1 text-sm text-muted">
          Admin dapat memperbarui komentar dan mengaktifkan kembali link yang sudah dipakai.
        </p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>}
      {!error && data.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          Belum ada link ulasan. Link yang sudah dibuat akan tampil di sini.
        </div>
      )}

      <div className="space-y-4">
        {data.map((entry) => {
          const review = entry.review;
          const reviewId = review?.ID || review?.id;
          const status = LINK_STATUS[entry.status_link] || LINK_STATUS.kedaluwarsa;

          return (
            <article key={entry.transaksi_sewa_id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {review?.nama_penyewa || `Transaksi #${entry.transaksi_sewa_id}`}
                  </h2>
                  {review?.item_sewa && <p className="text-sm text-muted">{review.item_sewa}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-muted">Berlaku sampai {formatDate(entry.expires_at)}</span>
                </div>
              </div>

              {review ? (
                <>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[#2447a8]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <span className="text-xs text-muted">{formatDate(review.CreatedAt || review.created_at)}</span>
                  </div>

                  {editing === reviewId ? (
                    <form onSubmit={saveReview} className="mt-4 space-y-4">
                      <fieldset>
                        <legend className="mb-2 text-sm font-medium">Rating</legend>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              aria-label={`${value} bintang`}
                              aria-pressed={rating === value}
                              onClick={() => setRating(value)}
                              className={`text-3xl ${value <= rating ? "text-[#2447a8]" : "text-gray-300"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <label className="block text-sm font-medium">
                        Komentar
                        <textarea
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                          maxLength={5000}
                          required
                          className="mt-1 min-h-28 w-full rounded-lg border border-border bg-background p-3 text-sm"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={busy === reviewId || rating < 1 || !comment.trim()}
                          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {busy === reviewId ? "Menyimpan…" : "Simpan perubahan"}
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm">
                          Batal
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="my-3 whitespace-pre-wrap">{review.kritik_saran}</p>
                      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
                        {review.foto?.map((photo) => (
                          <a
                            key={photo.ID || photo.id}
                            href={getReviewPhotoUrl(photo.url)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              className="aspect-square w-full rounded-lg object-cover"
                              src={getReviewPhotoUrl(photo.url)}
                              alt="Foto ulasan"
                            />
                          </a>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(review)}
                          className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-background"
                        >
                          Edit ulasan
                        </button>
                        <button
                          type="button"
                          disabled={busy === reviewId}
                          onClick={() => removeReview(review)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-danger hover:bg-red-50 disabled:opacity-50"
                        >
                          Hapus ulasan
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">Pelanggan belum mengirim ulasan melalui link ini.</p>
              )}

              {entry.status_link !== "belum_digunakan" && (
                <button
                  type="button"
                  disabled={busy === `link-${entry.transaksi_sewa_id}`}
                  onClick={() => reactivateLink(entry.transaksi_sewa_id)}
                  className="mt-4 rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-50"
                >
                  {busy === `link-${entry.transaksi_sewa_id}` ? "Mengaktifkan…" : "Aktifkan kembali link"}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </ProtectedLayout>
  );
}
