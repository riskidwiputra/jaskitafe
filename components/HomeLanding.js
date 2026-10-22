import Image from "next/image";
import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/sewajasmedanjohor/";
const MAPS_URL =
  "https://www.google.com/maps/place/Sewa+Jas+Medan+Johor/@3.5312405,98.6722515,17z/data=!3m1!4b1!4m6!3m5!1s0x30313bdadcbbefc5:0x9c4f284daf5d5e61!8m2!3d3.5312405!4d98.6748318!16s%2Fg%2F11nv71r99k?entry=ttu";
const MAP_EMBED_URL =
  "https://www.google.com/maps?q=3.5312405,98.6748318&output=embed";
const WHATSAPP_URL =
  "https://wa.me/628216692650?text=Halo%20JasKita%2C%20saya%20ingin%20bertanya%20tentang%20sewa%20jas.";

function InstagramIcon({ className = "size-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20l.9-4.7A8.5 8.5 0 1 1 20.5 11.7Z" />
      <path d="M8.1 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .6.6 1 1.4 1.8 2.5 2.3.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.7-.1l1.7.8c.3.1.4.3.4.5 0 .4-.2 1.3-.8 1.7-.6.4-1.3.6-2.1.4-1.1-.3-2.5-.9-3.9-2.2-1.2-1.1-2-2.5-2.2-3.5-.2-.9.1-1.8.6-2.6Z" />
    </svg>
  );
}

function ArrowIcon({ className = "size-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function MapPinIcon({ className = "size-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function SuitIllustration() {
  return (
    <svg
      viewBox="0 0 420 480"
      fill="none"
      className="h-full w-full"
      role="img"
      aria-label="Ilustrasi jas formal"
    >
      <path
        d="m128 77 39-25h86l39 25 58 41-34 79-36-17 14 235H126l14-235-36 17-34-79 58-41Z"
        fill="#263652"
      />
      <path
        d="m167 52 44 63 42-63M166 53l-30 132 75-44 75 44-32-132"
        fill="#f5f0e8"
      />
      <path d="m211 115-18 34 18 183 20-183-20-34Z" fill="#b28a56" />
      <path d="m136 185 75-44 75 44-15 235H126l10-235Z" fill="#1f2a44" />
      <path
        d="m135 186 57-32-22 72-35-40ZM287 186l-57-32 22 72 35-40Z"
        fill="#334563"
      />
      <path d="M159 256h37v9h-37zM226 256h37v9h-37z" fill="#b28a56" />
      <path d="M170 330h28v8h-28zM226 330h28v8h-28z" fill="#b28a56" />
      <circle cx="212" cy="354" r="3" fill="#e9dfd0" />
      <circle cx="212" cy="372" r="3" fill="#e9dfd0" />
    </svg>
  );
}

function InstagramFeed({ posts, status }) {
  if (!posts.length) {
    return (
      <div className="rounded-3xl border border-[#e8e2d8] bg-white px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f5eee4] text-[#8f6438]">
          <InstagramIcon className="size-7" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold text-[#1f2a44]">
          {status === "not_configured"
            ? "Hubungkan Instagram JasKita"
            : "Feed Instagram belum tersedia"}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#706c63]">
          {status === "not_configured"
            ? "Foto postingan terbaru akan tampil di sini setelah koneksi resmi Instagram diaktifkan."
            : "Postingan Instagram tidak dapat dimuat sekarang. Kunjungi akun kami untuk melihat foto terbaru."}
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d8c8b4] px-5 py-3 text-sm font-semibold text-[#1f2a44] transition hover:bg-[#f8f4ee]"
        >
          <InstagramIcon className="size-4" />
          Buka @sewajasmedanjohor
          <ArrowIcon />
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.postUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Lihat postingan Instagram JasKita${post.caption ? `: ${post.caption.slice(0, 90)}` : ""}`}
          className="group relative aspect-square overflow-hidden rounded-2xl bg-[#eee8df]"
        >
          <Image
            src={post.imageUrl}
            alt={post.caption || "Foto pelanggan JasKita dari Instagram"}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-[#111827]/0 text-white opacity-0 transition group-hover:bg-[#111827]/35 group-hover:opacity-100">
            <InstagramIcon className="size-8" />
          </span>
        </a>
      ))}
    </div>
  );
}

export default function HomeLanding({ instagramPosts, instagramStatus }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#22251f]">
      <header className="sticky top-0 z-20 border-b border-[#e9e3d9] bg-[#f7f5f0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/jaskita-logo.jpg"
              alt="Logo JasKita"
              width={42}
              height={42}
              className="size-[42px] rounded-full object-cover"
            />
            <span className="font-display text-xl font-semibold tracking-tight text-[#1f2a44]">
              JasKita
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#55564f] md:flex">
            <a href="#galeri" className="transition hover:text-[#9c6b2e]">
              Galeri
            </a>
            <a href="#lokasi" className="transition hover:text-[#9c6b2e]">
              Lokasi
            </a>
            <Link href="/ulasan" className="transition hover:text-[#9c6b2e]">
              Ulasan
            </Link>
          </nav>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#1f2a44] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#344363] sm:px-5"
          >
            <WhatsAppIcon className="size-[18px]" />
            <span className="hidden sm:inline">Chat WhatsApp</span>
            <span className="sm:hidden">Chat kami</span>
          </a>
        </div>
      </header>

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_35%,#e6d8c2_0%,transparent_38%),linear-gradient(120deg,#f7f5f0_0%,#f1ece3_100%)]" />
        <div className="mx-auto grid min-h-[630px] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b3] bg-white/60 px-4 py-2 text-xs font-bold tracking-[0.15em] text-[#765b3b]">
              <span className="size-1.5 rounded-full bg-[#b38a55]" />
              SEWA JAS · MEDAN JOHOR
            </p>
            <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.08] tracking-tight text-[#1f2a44] sm:text-6xl lg:text-7xl">
              Tampil percaya diri
              <span className="mt-2 block text-[#9c6b2e]">
                di momen istimewa.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#68665f] sm:text-lg sm:leading-8">
              Temukan jas untuk hari yang ingin selalu dikenang. Tanya pilihan
              model dan ketersediaan langsung melalui WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f2a44] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#1f2a44]/10 transition hover:-translate-y-0.5 hover:bg-[#344363]"
              >
                <WhatsAppIcon />
                Konsultasi via WhatsApp
              </a>
              <a
                href="#galeri"
                className="inline-flex items-center gap-2 rounded-full border border-[#cfc2b0] bg-white/60 px-6 py-3.5 font-semibold text-[#1f2a44] transition hover:bg-white"
              >
                Lihat galeri
                <ArrowIcon />
              </a>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#706c63]">
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="size-[18px] text-[#9c6b2e]" />
                Berlokasi di Medan Johor
              </span>
              <Link
                href="/ulasan"
                className="inline-flex items-center gap-2 font-semibold text-[#765b3b] hover:text-[#1f2a44]"
              >
                Lihat ulasan pelanggan
                <ArrowIcon />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex aspect-[1/1.04] w-full max-w-[510px] items-center justify-center">
            <div className="absolute inset-[7%] rounded-[48%_52%_46%_54%] bg-[#e5d7c2]" />
            <div className="absolute inset-[14%] rounded-[48%_52%_46%_54%] border border-[#c6ac89]/70" />
            <div className="relative z-10 h-[91%] w-[77%]">
              <SuitIllustration />
            </div>
            <div className="absolute bottom-[8%] left-0 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-[#493722]/10 backdrop-blur sm:p-5">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#9c6b2e]">
                TEMUKAN GAYA TERBAIKMU
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-[#1f2a44] sm:text-xl">
                Momenmu, gayamu.
              </p>
            </div>
            <div className="absolute right-0 top-[13%] flex size-16 items-center justify-center rounded-full border border-white/80 bg-[#f7f5f0] text-[#a17a4a] shadow-lg sm:size-[76px]">
              <span className="font-display text-xl italic">J</span>
            </div>
          </div>
        </div>
      </section>

      <section id="galeri" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#9c6b2e]">
                #MOMENJASKITA
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#1f2a44] sm:text-5xl">
                Cerita dari Instagram
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#706c63] sm:text-base">
                Intip momen dan inspirasi gaya dari pelanggan JasKita.
              </p>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#765b3b] transition hover:text-[#1f2a44]"
            >
              <InstagramIcon className="size-[18px]" />
              @sewajasmedanjohor
              <ArrowIcon />
            </a>
          </div>
          <InstagramFeed posts={instagramPosts} status={instagramStatus} />
        </div>
      </section>

      <section id="lokasi" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#9c6b2e]">
              KAMI MENUNGGU KUNJUNGANMU
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#1f2a44] sm:text-5xl">
              Temukan JasKita
            </h2>
            <p className="mt-4 max-w-md leading-7 text-[#706c63]">
              Kunjungi toko kami di Medan Johor untuk bertanya tentang pilihan
              jas dan penyewaan.
            </p>
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#e8e2d8] bg-white p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f5eee4] text-[#8f6438]">
                <MapPinIcon />
              </span>
              <div>
                <p className="font-semibold text-[#1f2a44]">
                  Sewa Jas Medan Johor
                </p>
                <p className="mt-1 text-sm text-[#706c63]">Medan, Sumatera Utara</p>
              </div>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#9c6b2e] px-6 py-3.5 font-semibold text-white transition hover:bg-[#805522]"
            >
              <MapPinIcon />
              Petunjuk arah
              <ArrowIcon />
            </a>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[#e8e2d8] bg-[#eee8df] shadow-xl shadow-[#493722]/10">
            <iframe
              title="Lokasi Sewa Jas Medan Johor di Google Maps"
              src={MAP_EMBED_URL}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block min-h-[330px] border-0 sm:min-h-[420px]"
            />
          </div>
        </div>
      </section>

      <section id="kontak" className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1f2a44] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="absolute -right-16 -top-28 size-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-20 size-80 rounded-full border border-white/10" />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-[#d5b27e]">
              SIAP UNTUK MOMEN SPESIALMU?
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Yuk, temukan jas yang pas.
            </h2>
            <p className="mt-4 leading-7 text-white/70">
              Hubungi kami untuk bertanya tentang model, ukuran, dan
              ketersediaan.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#d8b77f] px-6 py-3.5 font-semibold text-[#1f2a44] transition hover:bg-[#e8c990]"
            >
              <WhatsAppIcon />
              Chat JasKita di WhatsApp
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e2d8] bg-[#f7f5f0]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-[#706c63] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} JasKita Medan Johor</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/ulasan" className="hover:text-[#1f2a44]">
              Ulasan pelanggan
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1f2a44]"
            >
              Instagram
            </a>
            <a href={MAPS_URL} target="_blank" rel="noreferrer" className="hover:text-[#1f2a44]">
              Google Maps
            </a>
          </div>
        </div>
      </footer>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat JasKita melalui WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-[#278b58] text-white shadow-xl shadow-[#1d563c]/30 transition hover:scale-105 hover:bg-[#20794c] sm:bottom-7 sm:right-7 sm:size-16"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </main>
  );
}
