"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { BrandMark, Input, Field, Button } from "@/components/ui";
import { User, Mail, Lock, Eye, ChevronRight } from "@/components/icons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      const signInResult = await signIn("credentials", { email, password, redirect: false });
      if (signInResult?.error) {
        router.push("/login");
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
      <h2 className="m-0 mb-1.5 text-[26px] font-extrabold tracking-[-.02em]">Create your account</h2>
      <p className="m-0 mb-[26px] text-sm text-muted">Start tracking in under a minute.</p>

      <form onSubmit={handleSubmit} className="grid gap-[15px]">
        {error && <div className="rounded-xl bg-red-500/8 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</div>}
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Mercer" icon={<User width={17} height={17} />} />
        </Field>
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
              minLength={8}
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
          {loading ? "Creating account…" : "Create account"} <ChevronRight width={17} height={17} />
        </Button>
      </form>

      <p className="mt-6 text-center text-[13.5px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
