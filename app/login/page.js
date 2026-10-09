"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      setSession(res.token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-display text-3xl text-navy">Sewa Jas</p>
          <p className="mt-1 text-sm text-muted">Masuk untuk kelola usaha Anda</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-7 space-y-5">
          {error && <div className="text-sm rounded-lg px-3 py-2 bg-danger/10 text-danger border border-danger/20">{error}</div>}
          <div>
            <label className="block text-sm text-foreground/70 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@tokosewajas.com" className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-navy transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-1.5">Kata sandi</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-navy transition-colors" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-navy text-white text-sm font-medium py-2.5 hover:bg-navy-light transition-colors disabled:opacity-60">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-muted">Belum punya akun? Daftar dulu lewat Postman ke endpoint /api/auth/register.</p>
      </div>
    </div>
  );
}
