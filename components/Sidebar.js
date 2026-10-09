"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/auth";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" },
  { href: "/barang", label: "Barang", icon: "M4 4h16l-1.5 4h-13L4 4Zm0 0 1 16h14l1-16" },
  { href: "/penyewa", label: "Penyewa", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" },
  { href: "/transaksi", label: "Transaksi", icon: "M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01" },
  { href: "/laporan", label: "Buku Kas", icon: "M4 6h16M4 12h16M4 18h7" },
  { href: "/denda", label: "Denda", icon: "M7 8h10M7 12h6m-9 9V5a2 2 0 0 1 2-2h9l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" },
  { href: "/pengeluaran", label: "Pengeluaran", icon: "M12 8v8m-4-4h8M4 6h16M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6M4 6l1.5-3h13L20 6" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-5 py-5">
        <p className="font-display text-xl text-navy">Sewa Jas</p>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {MENU.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-navy/10 text-navy font-medium" : "text-foreground/70 hover:bg-background"}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-border">
        <p className="text-sm font-medium truncate">{user?.nama || "Pengguna"}</p>
        <p className="text-xs text-muted truncate mb-3">{user?.email || ""}</p>
        <button onClick={handleLogout} className="text-xs text-danger hover:underline">Keluar</button>
      </div>
    </aside>
  );
}
