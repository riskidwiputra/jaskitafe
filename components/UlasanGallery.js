"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import UlasanBrand from "@/components/UlasanBrand";
import { getReviewPhotoUrl } from "@/lib/review-photo-url";

function Stars({ value = 0 }) {
  return (
    <span className="tracking-[2px] text-[#2447a8]">
      {"★".repeat(value)}
      <span className="text-[#d5dbea]">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
}

export default function UlasanGallery({ apiUrl, initialData, pageSize }) {
  const [reviews, setReviews] = useState(initialData.data || []);
  const [summary, setSummary] = useState(
    initialData.summary || { total_reviews: 0, average_rating: 0 },
  );
  const [pagination, setPagination] = useState(
    initialData.pagination || {
      page: 1,
      limit: pageSize,
      total: 0,
      has_more: false,
    },
  );
  const [filter, setFilter] = useState(0);
  const [active, setActive] = useState(null);
  const [error, setError] = useState(initialData.error || "");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  async function loadPage(page, rating, append) {
    if (!apiUrl) {
      setError("URL API belum dikonfigurasi.");
      return;
    }

    const currentRequest = ++requestId.current;
    setError("");
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (rating) params.set("rating", String(rating));

      const response = await fetch(
        `${apiUrl}/public/ulasan?${params.toString()}`,
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "Gagal memuat ulasan.");
      }
      if (!Array.isArray(body.data) || !body.pagination || !body.summary) {
        throw new Error("Format data ulasan dari server tidak sesuai.");
      }
      if (currentRequest !== requestId.current) return;

      setReviews((current) =>
        append ? [...current, ...body.data] : body.data,
      );
      setPagination(body.pagination);
      setSummary(body.summary);
    } catch (requestError) {
      if (currentRequest === requestId.current) {
        setError(requestError.message || "Gagal memuat ulasan.");
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  function selectFilter(rating) {
    setFilter(rating);
    if (rating === 0) {
      requestId.current += 1;
      setReviews(initialData.data || []);
      setPagination(
        initialData.pagination || {
          page: 1,
          limit: pageSize,
          total: 0,
          has_more: false,
        },
      );
      setSummary(
        initialData.summary || { total_reviews: 0, average_rating: 0 },
      );
      setError(initialData.error || "");
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    loadPage(1, rating, false);
  }

  const average = Number(summary.average_rating || 0);
  const totalReviews = Number(summary.total_reviews || 0);

  return (
    <div
      className="min-h-screen bg-white text-[#141a2b]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="sticky top-0 z-10 border-b border-[#e8ebf1] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <UlasanBrand />
          <Link
            className="border-b-2 border-[#2447a8] pb-1 font-medium text-[#14285e]"
            href="/ulasan"
          >
            Ulasan
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12">
        <section className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="font-display text-5xl font-semibold text-[#14285e]">
            Momen mereka bersama JasKita
          </h1>
          <p className="mt-3 text-[#6a7183]">
            Foto dan cerita dari pelanggan yang sudah menyewa jas kami.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#e8ebf1] px-5 py-2">
            <b className="font-display text-3xl text-[#14285e]">
              {average.toFixed(1).replace(".", ",")}
            </b>
            <Stars value={Math.round(average)} />
            <span className="text-sm text-[#6a7183]">
              {totalReviews} ulasan
            </span>
          </div>
        </section>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {[0, 5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => selectFilter(rating)}
              aria-pressed={filter === rating}
              className={`rounded-full border px-4 py-2 text-sm ${
                filter === rating
                  ? "border-[#14285e] bg-[#14285e] text-white"
                  : "border-[#e8ebf1] bg-white hover:bg-[#eef3fc]"
              }`}
            >
              {rating ? `${rating} bintang` : "Semua"}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="py-8 text-center text-red-700">
            {error}. Periksa koneksi API backend.
          </p>
        )}
        {!error && loading && (
          <p className="py-8 text-center text-[#6a7183]">
            Memuat ulasan…
          </p>
        )}
        {!error && !loading && reviews.length === 0 && (
          <p className="py-12 text-center text-[#6a7183]">
            {filter
              ? "Belum ada ulasan dengan rating ini."
              : "Belum ada ulasan. Ulasan pelanggan akan tampil di sini setelah dikirim."}
          </p>
        )}

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((review) => (
            <button
              key={review.ID || review.id}
              type="button"
              onClick={() => setActive(review)}
              className="mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-[#e8ebf1] bg-white text-left transition hover:shadow-lg"
            >
              {review.foto?.length > 0 ? (
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    fill
                    src={getReviewPhotoUrl(review.foto[0].url)}
                    alt="Foto momen pelanggan"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                  />
                  {review.foto.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#14285e]">
                      {review.foto.length} foto
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-[#eef3fc] to-[#cfdcf5]">
                  <svg
                    width="54"
                    height="54"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8da6dd"
                    strokeWidth="1.3"
                    aria-hidden="true"
                  >
                    <path d="M9 3l3 4 3-4 5 3-2 5v10H6V11L4 6zM12 7v14" />
                  </svg>
                </div>
              )}
              <div className="p-5">
                <Stars value={review.rating} />
                <p className="my-3 line-clamp-3 text-[15px]">
                  {review.kritik_saran}
                </p>
                <div className="flex justify-between gap-2 text-sm">
                  <b>{review.nama_penyewa}</b>
                  <span className="text-[#6a7183]">
                    {formatDate(review.CreatedAt || review.created_at)}
                  </span>
                </div>
                {review.item_sewa && (
                  <p className="mt-2 text-xs text-[#6a7183]">
                    {review.item_sewa}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {pagination.has_more && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => loadPage(pagination.page + 1, filter, true)}
              disabled={loadingMore || loading}
              className="rounded-xl border border-[#2447a8] px-6 py-3 font-semibold text-[#2447a8] hover:bg-[#eef3fc] disabled:cursor-wait disabled:opacity-60"
            >
              {loadingMore ? "Memuat…" : "Muat lebih banyak"}
            </button>
          </div>
        )}
      </main>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#0f193c]/60 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Tutup"
                className="rounded-full px-3 py-1 text-xl text-[#14285e]"
              >
                ×
              </button>
            </div>
            {active.foto?.map((photo) => (
              <div
                key={photo.ID || photo.id}
                className="relative h-[65vh] w-full"
              >
                <Image
                fill
                src={getReviewPhotoUrl(photo.url)}
                alt="Foto ulasan"
                sizes="(max-width: 768px) 100vw, 512px"
                loading="lazy"
                decoding="async"
                className="object-contain"
                />
              </div>
            ))}
            <div className="p-6">
              <Stars value={active.rating} />
              <p className="my-3">{active.kritik_saran}</p>
              <b>{active.nama_penyewa}</b>
              <p className="mt-1 text-sm text-[#6a7183]">{active.item_sewa}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
