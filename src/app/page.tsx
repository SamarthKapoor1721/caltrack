import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getUserById,
  getDailySummary,
  getWeightLogsByUser,
  getExerciseWeightHistory,
  getWorkoutsByUserSince,
} from "@/services";
import { getTodayISO, toDateKey, calculateTDEE } from "@/lib";
import {
  Card,
  SectionTitle,
  ProgressRing,
  DonutChart,
  ProgressBar,
  LineChart,
  BarChart,
  StatCard,
  KV,
  Chip,
  Button,
  type ChartPoint,
} from "@/components/ui";
import { Flame, Apple, Target, Dumbbell, Scale, Drop, TrendingUp } from "@/components/icons";

export const dynamic = "force-dynamic";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function chartLabel(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");
  if (user.age == null || user.weight == null || user.height == null) {
    redirect("/onboarding");
  }

  const today = getTodayISO();
  const [summary, weightLogs, strengthHistory, recentWorkouts] = await Promise.all([
    getDailySummary(user.id, today),
    getWeightLogsByUser(user.id),
    getExerciseWeightHistory(user.id, 90),
    getWorkoutsByUserSince(user.id, 7),
  ]);

  const consumed = summary.totalCalories;
  const protein = Math.round(summary.totalProtein);
  const carbs = Math.round(summary.totalCarbs);
  const fat = Math.round(summary.totalFat);

  const maintenance = calculateTDEE({
    weight: user.weight,
    height: user.height,
    age: user.age,
    gender: (user.gender ?? "OTHER") as "MALE" | "FEMALE" | "OTHER",
    activityLevel: user.activityLevel,
  });
  const goal = user.calorieGoal ?? maintenance;

  const burnedToday = recentWorkouts
    .filter((w) => toDateKey(w.createdAt) === today)
    .reduce((s, w) => s + (w.caloriesBurned ?? 0), 0);
  const workoutsToday = recentWorkouts.filter((w) => toDateKey(w.createdAt) === today).length;

  const net = consumed - burnedToday;
  const remaining = goal - net;

  // macro goals (rough split): P 30%, C 45%, F 25% of goal kcal
  const pGoal = Math.round((goal * 0.3) / 4);
  const cGoal = Math.round((goal * 0.45) / 4);
  const fGoal = Math.round((goal * 0.25) / 9);
  const macros = [
    { key: "Protein", value: protein, goal: pGoal, color: "var(--protein)" },
    { key: "Carbs", value: carbs, goal: cGoal, color: "var(--carbs)" },
    { key: "Fat", value: fat, goal: fGoal, color: "var(--fat)" },
  ];

  // weight trend (last 8 entries, oldest→newest)
  const sortedWeights = [...weightLogs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const wData: ChartPoint[] = sortedWeights.slice(-8).map((w) => ({
    value: w.weight,
    label: chartLabel(w.createdAt),
  }));
  const weightChange =
    sortedWeights.length > 1
      ? +(sortedWeights[sortedWeights.length - 1].weight - sortedWeights[0].weight).toFixed(1)
      : 0;

  // strength progression — first tracked exercise
  const strength = strengthHistory[0];
  const sData: ChartPoint[] =
    strength?.points.map((p) => ({
      value: p.weight,
      label: new Date(`${p.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })) ?? [];

  // calories burned this week
  const burnByDay: ChartPoint[] = (() => {
    const days: ChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const v = recentWorkouts
        .filter((w) => toDateKey(w.createdAt) === key)
        .reduce((s, w) => s + (w.caloriesBurned ?? 0), 0);
      days.push({ value: v, label: d.toLocaleDateString("en-US", { weekday: "short" })[0] });
    }
    return days;
  })();

  const firstName = user.name?.split(" ")[0] ?? "there";
  const totalMacroG = protein + carbs + fat;

  return (
    <div data-density="regular" className="stagger mx-auto grid w-full max-w-[1180px] gap-[var(--gap,18px)] px-5 py-6 pb-28 sm:px-6 lg:py-8">
      {/* ── Greeting ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-0.5 text-[13.5px] font-semibold text-muted">{greeting()}, {firstName} 👋</div>
          <h1 className="m-0 text-[27px] font-extrabold tracking-tight">
            Today&apos;s <span className="grad-text">Summary</span>
          </h1>
        </div>
        <div className="flex gap-2.5">
          <Link href="/log"><Button variant="soft"><Apple width={17} height={17} /> Log food</Button></Link>
          <Link href="/workout"><Button variant="primary"><Dumbbell width={17} height={17} /> Log workout</Button></Link>
        </div>
      </div>

      {/* ── Calories + macros ── */}
      <div className="grid gap-[var(--gap,18px)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card glass>
          <SectionTitle icon={<Flame width={19} height={19} />}>Calories</SectionTitle>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <ProgressRing value={net} max={goal} label={`of ${goal} kcal`} />
            <div className="grid min-w-[150px] flex-1 gap-3">
              <KV icon={<Apple width={18} height={18} />} color="var(--primary)" label="Eaten" value={consumed} unit="kcal" />
              <KV icon={<Flame width={18} height={18} />} color="var(--accent)" label="Burned" value={burnedToday} unit="kcal" />
              <KV icon={<Target width={18} height={18} />} color="var(--fat)" label={remaining >= 0 ? "Remaining" : "Over"} value={Math.abs(remaining)} unit="kcal" />
            </div>
          </div>
        </Card>

        <Card glass>
          <SectionTitle icon={<Target width={19} height={19} />}>Macros</SectionTitle>
          <div className="flex flex-wrap items-center gap-5">
            <DonutChart
              size={138}
              stroke={20}
              data={macros.map((m) => ({ value: m.value, color: m.color }))}
              centerTop={`${totalMacroG}g`}
              centerBottom="total"
            />
            <div className="grid min-w-[140px] flex-1 gap-3.5">
              {macros.map((m) => (
                <div key={m.key}>
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: m.color }} />
                      {m.key}
                    </span>
                    <span className="font-mono text-muted">
                      {m.value}
                      <span className="opacity-60">/{m.goal}g</span>
                    </span>
                  </div>
                  <ProgressBar value={m.value} goal={m.goal} color={m.color} height={7} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 gap-[var(--gap,18px)] lg:grid-cols-4">
        <StatCard
          icon={<Drop width={20} height={20} />}
          color="var(--fat)"
          label="Current weight"
          value={user.weight}
          unit="kg"
          trend={sortedWeights.length > 1 ? `${weightChange > 0 ? "+" : ""}${weightChange} kg` : undefined}
          trendGood={weightChange <= 0}
        />
        <StatCard icon={<Flame width={20} height={20} />} color="var(--accent)" label="Burned today" value={burnedToday} unit="kcal" />
        <StatCard icon={<Dumbbell width={20} height={20} />} color="var(--primary)" label="Workouts today" value={workoutsToday} unit="logged" />
        <StatCard icon={<Target width={20} height={20} />} color="var(--grad-b)" label="Maintenance" value={maintenance} unit="kcal" />
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-[var(--gap,18px)] lg:grid-cols-2">
        <Card glass>
          <SectionTitle icon={<Scale width={19} height={19} />} action={<Chip color="var(--fat)">{wData.length} entries</Chip>}>
            Weight trend
          </SectionTitle>
          {wData.length > 0 ? (
            <LineChart data={wData} color="var(--fat)" unit=" kg" h={210} />
          ) : (
            <div className="flex h-52 flex-col items-center justify-center text-center text-sm text-muted">
              No weight entries yet.
              <Link href="/weight" className="mt-2 font-semibold text-primary">Log weight →</Link>
            </div>
          )}
        </Card>
        <Card glass>
          <SectionTitle
            icon={<TrendingUp width={19} height={19} />}
            action={strength ? <Chip color="var(--primary)">{strength.exercise}</Chip> : undefined}
          >
            Strength progression
          </SectionTitle>
          {sData.length > 0 ? (
            <LineChart data={sData} color="var(--primary)" unit=" kg" h={210} />
          ) : (
            <div className="flex h-52 flex-col items-center justify-center text-center text-sm text-muted">
              No strength data yet.
              <Link href="/workout" className="mt-2 font-semibold text-primary">Log a workout →</Link>
            </div>
          )}
        </Card>
      </div>

      {/* ── Burned this week ── */}
      <Card glass>
        <SectionTitle icon={<Flame width={19} height={19} />}>Calories burned · this week</SectionTitle>
        <BarChart data={burnByDay} color="var(--accent)" unit=" kcal" h={190} />
      </Card>
    </div>
  );
}
