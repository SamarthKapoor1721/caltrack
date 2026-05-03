"use client";

import { useRef, useState, useTransition } from "react";
import { saveProfile } from "./actions";

export function ProfileForm({ name }: { name: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveProfile(data);
      if ("error" in result) { setStatus("error"); setMsg(result.error ?? "Error"); }
      else { setStatus("success"); setMsg("Profile saved."); }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-semibold">Display Name</label>
        <input
          id="name" name="name" type="text" defaultValue={name} required
          className="h-11 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm transition-all placeholder:text-muted/60 hover:border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60">
          {pending ? "Saving…" : "Save Profile"}
        </button>
        {status === "success" && <span className="text-sm text-emerald-600">✓ {msg}</span>}
        {status === "error" && <span className="text-sm text-red-600">{msg}</span>}
      </div>
    </form>
  );
}
