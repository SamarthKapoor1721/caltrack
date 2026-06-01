import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkoutsByUser } from "@/services";
import { getTodayISO, toDateKey, dateLabel } from "@/lib";
import { Card, StatCard, Metric, Chip, EmptyState } from "@/components/ui";
import { Flame, Dumbbell, Clock, Bolt } from "@/components/icons";
import { LogExerciseButton } from "@/components/workout-modal";
import { DeleteWorkout } from "./delete-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log Workout — CalTrack" };

type Workout = Awaited<ReturnType<typeof getWorkoutsByUser>>[number];

function fmtDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function WorkoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workouts = await getWorkoutsByUser(session.user.id);
  const today = getTodayISO();
  const todayW = workouts.filter((w) => toDateKey(w.createdAt) === today);
  const earlier = workouts.filter((w) => toDateKey(w.createdAt) !== today);

  const totalBurned = todayW.reduce((s, w) => s + (w.caloriesBurned ?? 0), 0);
  const totalVolume = todayW.reduce((s, w) => s + (w.sets ?? 0) * (w.reps ?? 0) * (w.weight ?? 0), 0);
  const totalTime = todayW.reduce((s, w) => s + (w.durationMin ?? 0), 0);

  // group earlier workouts by day for a compact recent list
  const grouped: { key: string; items: Workout[] }[] = [];
  for (const w of earlier) {
    const key = toDateKey(w.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.key === key) last.items.push(w);
    else grouped.push({ key, items: [w] });
  }

  return (
    <div data-density="regular" className="stagger mx-auto grid w-full max-w-3xl gap-[var(--gap,18px)] px-5 py-6 pb-28 sm:px-6 lg:py-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-[27px] font-extrabold tracking-tight">
            <span className="grad-text">Workout</span> Log
          </h1>
          <div className="mt-1 text-[13.5px] font-semibold text-muted">
            {fmtDate(today)} · {todayW.length} exercises
          </div>
        </div>
        <LogExerciseButton />
      </div>

      {/* ── Today stat strip ── */}
      <div className="grid grid-cols-1 gap-[var(--gap,18px)] sm:grid-cols-3">
        <StatCard icon={<Flame width={20} height={20} />} color="var(--accent)" label="Calories burned" value={totalBurned} unit="kcal" />
        <StatCard icon={<Dumbbell width={20} height={20} />} color="var(--primary)" label="Total volume" value={totalVolume.toLocaleString()} unit="kg" />
        <StatCard icon={<Clock width={20} height={20} />} color="var(--fat)" label="Time under tension" value={totalTime} unit="min" />
      </div>

      {/* ── Today's workouts ── */}
      {todayW.length === 0 ? (
        <Card glass>
          <EmptyState
            icon={<Dumbbell width={26} height={26} />}
            title="No workouts yet today"
            hint="Log your first exercise to start tracking volume and calories burned."
            action={<LogExerciseButton />}
          />
        </Card>
      ) : (
        <div className="grid gap-[var(--gap,18px)]">
          {todayW.map((w) => (
            <WorkoutCard key={w.id} w={w} />
          ))}
        </div>
      )}

      {/* ── Earlier ── */}
      {grouped.length > 0 && (
        <div className="grid gap-[var(--gap,18px)]">
          <h2 className="mt-2 text-[13px] font-bold uppercase tracking-wide text-muted">Earlier</h2>
          {grouped.map((g) => (
            <div key={g.key} className="grid gap-2.5">
              <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">{dateLabel(g.key, today)}</div>
              {g.items.map((w) => (
                <WorkoutCard key={w.id} w={w} compact />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ w, compact = false }: { w: Workout; compact?: boolean }) {
  const intensity = w.intensity ?? 0;
  const rpeColor = intensity >= 9 ? "#ef4444" : intensity >= 7 ? "var(--accent)" : "var(--primary)";
  const sets = w.sets ?? 0;
  const reps = w.reps ?? 0;
  const weight = w.weight ?? 0;

  return (
    <Card glass>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3.5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: "linear-gradient(135deg,var(--grad-a),var(--grad-b))" }}
          >
            <Dumbbell width={22} height={22} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-base font-bold">{w.exerciseName}</span>
              {w.toFailure && (
                <Chip color="#ef4444" icon={<Bolt width={12} height={12} />}>
                  To failure
                </Chip>
              )}
            </div>
            <div className="mt-1 font-mono text-[13px] text-muted">
              {sets} × {reps} {weight > 0 ? `@ ${weight}kg` : "bodyweight"}
              {w.durationMin != null ? ` · ${w.durationMin}min` : ""}
            </div>
          </div>
        </div>
        <DeleteWorkout id={w.id} />
      </div>

      {!compact && (
        <>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            <Metric label="Sets × Reps" value={`${sets}×${reps}`} />
            <Metric label="Weight" value={weight > 0 ? `${weight}kg` : "BW"} />
            <Metric label="Burned" value={`${w.caloriesBurned ?? 0}`} unit="kcal" color="var(--accent)" />
            <Metric label="RPE" value={intensity || "—"} unit={intensity ? "/10" : undefined} color={rpeColor} />
          </div>

          {intensity > 0 && (
            <div className="mt-3.5">
              <div className="mb-1.5 flex justify-between whitespace-nowrap text-[11px] font-semibold text-muted">
                <span>Intensity</span>
                <span style={{ color: rpeColor }}>RPE&nbsp;{intensity}</span>
              </div>
              <div className="flex gap-[3px]">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-[3px]"
                    style={{ background: i < intensity ? rpeColor : "var(--border)" }}
                  />
                ))}
              </div>
            </div>
          )}

          {w.notes && (
            <div
              className="mt-3.5 rounded-[10px] bg-[var(--bg)] px-3.5 py-2.5 text-[13px] text-muted"
              style={{ borderLeft: "3px solid var(--primary)" }}
            >
              {w.notes}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
