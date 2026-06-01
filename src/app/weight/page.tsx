import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWeightLogsByUser } from "@/services";
import { Card, SectionTitle, StatCard, LineChart, type ChartPoint } from "@/components/ui";
import { Scale, TrendingUp, Flame, Target, History } from "@/components/icons";
import { LogWeightButton } from "@/components/weight-modal";
import { DeleteWeightEntry } from "./delete-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Weight — CalTrack" };

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function WeightPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await getWeightLogsByUser(session.user.id); // newest first
  const sorted = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const hasData = sorted.length > 0;
  const current = hasData ? sorted[sorted.length - 1].weight : 0;
  const start = hasData ? sorted[0].weight : 0;
  const change = +(current - start).toFixed(1);
  const lowest = hasData ? Math.min(...sorted.map((w) => w.weight)) : 0;
  const last4 = sorted.slice(-4);
  const weekRate = last4.length > 1 ? +(last4[last4.length - 1].weight - last4[0].weight).toFixed(1) : 0;

  const data: ChartPoint[] = sorted.map((w) => ({ value: w.weight, label: fmtDate(w.createdAt) }));

  // newest-first history with day-over-day deltas
  const withDiff = entries.map((entry, i) => {
    const prev = entries[i + 1];
    return { ...entry, diff: prev ? +(entry.weight - prev.weight).toFixed(1) : null };
  });

  return (
    <div data-density="regular" className="stagger mx-auto grid w-full max-w-4xl gap-[var(--gap,18px)] px-5 py-6 pb-28 sm:px-6 lg:py-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-[27px] font-extrabold tracking-tight">
            Body <span className="grad-text">Weight</span>
          </h1>
          <div className="mt-1 text-[13.5px] font-semibold text-muted">{sorted.length} entries · tracking in kg</div>
        </div>
        <LogWeightButton current={hasData ? current : undefined} />
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 gap-[var(--gap,18px)] lg:grid-cols-4">
        <StatCard icon={<Scale width={20} height={20} />} color="var(--fat)" label="Current" value={hasData ? current : "—"} unit={hasData ? "kg" : undefined} />
        <StatCard
          icon={<TrendingUp width={20} height={20} />}
          color={change <= 0 ? "var(--primary)" : "var(--accent)"}
          label="Total change"
          value={hasData ? `${change > 0 ? "+" : ""}${change}` : "—"}
          unit={hasData ? "kg" : undefined}
        />
        <StatCard icon={<Flame width={20} height={20} />} color="var(--primary)" label="This week" value={hasData ? `${weekRate > 0 ? "+" : ""}${weekRate}` : "—"} unit={hasData ? "kg" : undefined} />
        <StatCard icon={<Target width={20} height={20} />} color="var(--grad-b)" label="Lowest" value={hasData ? lowest : "—"} unit={hasData ? "kg" : undefined} />
      </div>

      {/* ── Chart ── */}
      <Card glass>
        <SectionTitle icon={<Scale width={19} height={19} />}>Weight over time</SectionTitle>
        {hasData ? (
          <LineChart data={data} color="var(--fat)" unit=" kg" h={280} />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted">Log your weight to see the trend.</div>
        )}
      </Card>

      {/* ── History ── */}
      {hasData && (
        <Card glass pad={false}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <SectionTitle icon={<History width={19} height={19} />}>History</SectionTitle>
          </div>
          <div>
            {withDiff.map((w, i) => (
              <div
                key={w.id}
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderTop: i ? "1px solid var(--border-soft)" : "none" }}
              >
                <div className="text-[13.5px] font-semibold text-muted">{fmtDate(w.createdAt)}</div>
                <div className="flex items-center gap-3.5">
                  {w.diff !== null && (
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: w.diff < 0 ? "var(--primary)" : w.diff > 0 ? "var(--accent)" : "var(--muted)" }}
                    >
                      {w.diff > 0 ? "+" : ""}
                      {w.diff || "—"}
                      {w.diff ? "kg" : ""}
                    </span>
                  )}
                  <span className="font-mono text-base font-bold">
                    {w.weight}
                    <span className="text-[11px] font-medium text-muted"> kg</span>
                  </span>
                  <DeleteWeightEntry id={w.id} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
