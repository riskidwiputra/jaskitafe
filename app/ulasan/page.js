import { Suspense } from "react";
import { connection } from "next/server";
import UlasanGallery from "@/components/UlasanGallery";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 9;

async function getInitialReviews() {
  if (!API_URL) {
    return {
      data: [],
      pagination: { page: 1, limit: PAGE_SIZE, total: 0, has_more: false },
      summary: { total_reviews: 0, average_rating: 0 },
      error: "URL API belum dikonfigurasi.",
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/public/ulasan?page=1&limit=${PAGE_SIZE}`,
      { cache: "no-store" },
    );
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error || "Gagal memuat ulasan.");
    }

    return body;
  } catch (error) {
    return {
      data: [],
      pagination: { page: 1, limit: PAGE_SIZE, total: 0, has_more: false },
      summary: { total_reviews: 0, average_rating: 0 },
      error: error.message || "Gagal menghubungi server ulasan.",
    };
  }
}

function GalleryFallback() {
  return <p className="py-12 text-center text-[#6a7183]">Memuat ulasan…</p>;
}

async function GalleryContent() {
  await connection();
  const initialData = await getInitialReviews();
  return (
    <UlasanGallery
      apiUrl={API_URL || ""}
      initialData={initialData}
      pageSize={PAGE_SIZE}
    />
  );
}

export default function UlasanPage() {
  return (
    <Suspense fallback={<GalleryFallback />}>
      <GalleryContent />
    </Suspense>
  );
}
