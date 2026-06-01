"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { BrandMark, Input, Field, Button } from "@/components/ui";
import { Mail, Lock, Eye, ChevronRight } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-7 md:hidden">
        <BrandMark />
      </div>
      <h2 className="m-0 mb-1.5 text-[26px] font-extrabold tracking-[-.02em]">Welcome back</h2>
      <p className="m-0 mb-[26px] text-sm text-muted">Log in to continue your streak.</p>

      <form onSubmit={handleSubmit} className="grid gap-[15px]">
        {error && <div className="rounded-xl bg-red-500/8 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</div>}
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" icon={<Mail width={17} height={17} />} required />
        </Field>
        <Field label="Password">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock width={17} height={17} />}
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2.5 top-1/2 flex -translate-y-1/2 text-muted"
              aria-label="Toggle password visibility"
            >
              <Eye width={17} height={17} />
            </button>
          </div>
        </Field>
        <Button type="submit" variant="primary" full size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Log in"} <ChevronRight width={17} height={17} />
        </Button>
      </form>

      <p className="mt-6 text-center text-[13.5px] text-muted">
        New to CalTrack?{" "}
        <Link href="/register" className="font-bold text-primary">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
