import { type ReactNode } from "react";
import { BrandMark } from "@/components/ui";

/** Split-screen auth layout: vibrant brand panel + centered form panel. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-var(--navbar-h))] md:grid-cols-[1.05fr_1fr]">
      {/* brand panel */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-14 text-white md:flex"
        style={{ background: "linear-gradient(150deg, var(--grad-a), var(--grad-b) 55%, #0f766e)" }}
      >
        <BrandMark light size="lg" />
        <div className="relative z-[2]">
          <h1 className="m-0 mb-4 max-w-[420px] text-[40px] font-extrabold leading-[1.08] tracking-[-.03em]">
            Track every calorie. Build real strength.
          </h1>
          <p className="m-0 max-w-[400px] text-base leading-relaxed opacity-90">
            Log meals, workouts and body weight in one place — and watch your progress compound.
          </p>
          <div className="mt-9 flex gap-7">
            {[
              ["Foods tracked", "8M+"],
              ["Daily logs", "1.2M"],
              ["Avg. rating", "4.9★"],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="font-mono text-[26px] font-extrabold">{v}</div>
                <div className="text-[12.5px] opacity-80">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-[2] text-[12.5px] opacity-70">© 2026 CalTrack</div>
        {/* deco rings */}
        <div className="absolute -right-[120px] -top-20 h-[360px] w-[360px] rounded-full" style={{ border: "40px solid rgba(255,255,255,.08)" }} />
        <div className="absolute -bottom-[140px] right-[60px] h-[300px] w-[300px] rounded-full" style={{ border: "30px solid rgba(255,255,255,.06)" }} />
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center bg-[var(--bg)] px-7 py-10">
        <div className="anim-slide w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}
