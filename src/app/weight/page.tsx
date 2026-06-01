import { Card, CardHeader } from "@/components/ui";
import { Scale, Clock } from "@/components/icons";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWeightLogsByUser } from "@/services";
import { WeightLogForm } from "@/components/weight-log-form";
import { WeightChart } from "@/components/weight-chart";
import { DeleteWeightEntry } from "./delete-button";
import { toDateKey, dateLabel, getTodayISO } from "@/lib";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Weight — CalTrack",
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function WeightPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await getWeightLogsByUser(session.user.id);

  const chartEntries = entries.map((e) => ({
    id: e.id,
    weight: e.weight,
    createdAt: e.createdAt.toISOString(),
  }));

  const today = getTodayISO();

  // Diff vs the previous (older) entry, computed across the full list.
  const withDiff = entries.map((entry, i) => {
    const prev = entries[i + 1];
    return {
      ...entry,
      diff: prev ? Math.round((entry.weight - prev.weight) * 10) / 10 : null,
    };
  });

  // Group the most recent 20 entries by calendar date (newest day first).
  const grouped: { key: string; items: typeof withDiff }[] = [];
  for (const item of withDiff.slice(0, 20)) {
    const key = toDateKey(item.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.key === key) last.items.push(item);
    else grouped.push({ key, items: [item] });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      {/* ── Header ──────────────────────────── */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Weight Tracker</h1>
        <p className="mt-1 text-sm text-muted">
          Log your weight daily or weekly and track your progress over time.
        </p>
      </div>

      {/* ── Log Weight Card ─────────────────── */}
      <Card className="mb-4 animate-slide-up">
        <CardHeader
          title="Log Weight"
          subtitle="Record your current weight"
          icon={<Scale className="h-5 w-5 text-primary" />}
        />
        <WeightLogForm />
      </Card>

      {/* ── Progress Chart ──────────────────── */}
      <Card className="mb-4 animate-fade-in" style={{ animationDelay: "80ms" }}>
        <CardHeader
          title="Progress Chart"
          subtitle={
            entries.length > 0
              ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} recorded`
              : "No entries yet"
          }
        />
        <WeightChart entries={chartEntries} />
      </Card>

      {/* ── Recent Entries ───────────────────── */}
      {entries.length > 0 && (
        <Card className="animate-fade-in" style={{ animationDelay: "160ms" }}>
          <CardHeader
            title="Recent Entries"
            subtitle="Your weight log history"
          />
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.key}>
                {/* Date header */}
                <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  {dateLabel(group.key, today)}
                </p>
                <div className="stagger-children divide-y divide-border-light">
                  {group.items.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:gap-4"
                    >
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/8 sm:h-11 sm:w-11">
                        <Scale className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>

                      {/* Time */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="h-3 w-3" />
                          {formatTime(entry.createdAt)}
                        </div>
                      </div>

                      {/* Change badge */}
                      {entry.diff !== null && (
                        <span
                          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            entry.diff < 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : entry.diff > 0
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {entry.diff > 0 ? "+" : ""}
                          {entry.diff} kg
                        </span>
                      )}

                      {/* Weight value */}
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold">{entry.weight}</span>
                        <span className="ml-0.5 text-xs text-muted">kg</span>
                      </div>

                      {/* Delete button */}
                      <DeleteWeightEntry id={entry.id} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {entries.length > 20 && (
            <p className="mt-5 text-center text-xs text-muted">
              Showing latest 20 of {entries.length} entries
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
