import Link from "next/link";
import Image from "next/image";

export default function UlasanBrand() {
  return (
    <Link href="/ulasan" className="inline-flex items-center gap-3 text-[#14285e]" aria-label="JasKita">
      <span className="size-12 overflow-hidden rounded-full border-2 border-[#d6b45c] bg-[#071b3b] shadow-sm ring-4 ring-[#eef3fc]">
        <Image
          src="/jaskita-logo.jpg"
          alt=""
          width={48}
          height={48}
          sizes="48px"
          className="size-full object-cover"
        />
      </span>
      <span className="font-display text-2xl font-bold tracking-tight">JasKita</span>
    </Link>
  );
}
