import { Card, CardHeader, ProgressRing } from "@/components/ui";
import { Flame, TrendingUp, Apple, Target, Clock, Scale } from "@/components/icons";
import { DEFAULT_GOALS, MACRO_COLORS, MEAL_TYPES, getTodayISO } from "@/lib";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById, getDailySummary, getCalorieHistory, getWeightLogsByUser } from "@/services";
import { CalorieChart } from "@/components/calorie-chart";
import { DashboardWeightChart } from "@/components/dashboard-weight-chart";

// ─── Helpers ─────────────────────────────────────
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function mealLabel(type: string): string {
  return MEAL_TYPES.find((m) => m.value === type)?.label ?? type;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const MEAL_EMOJI: Record<string, string> = {
  BREAKFAST: "🌅",
  LUNCH: "☀️",
  DINNER: "🌙",
  SNACK: "🍿",
};

// ─── Page ────────────────────────────────────────
export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");
  if (user.age == null || user.weight == null || user.height == null) {
    redirect("/onboarding");
  }

  const today = getTodayISO();
  const [summary, calorieHistory, weightLogs] = await Promise.all([
    getDailySummary(user.id, today),
    getCalorieHistory(user.id, 7),
    getWeightLogsByUser(user.id),
  ]);

  const calorieGoal = user.calorieGoal ?? null;
  const proteinGoal = DEFAULT_GOALS.protein;
  const carbsGoal = DEFAULT_GOALS.carbs;
  const fatGoal = DEFAULT_GOALS.fat;

  const consumed = summary.totalCalories;
  const remaining = calorieGoal != null ? Math.max(calorieGoal - consumed, 0) : null;

  const proteinPct = Math.min(Math.round((summary.totalProtein / proteinGoal) * 100), 100);
  const carbsPct = Math.min(Math.round((summary.totalCarbs / carbsGoal) * 100), 100);
  const fatPct = Math.min(Math.round((summary.totalFat / fatGoal) * 100), 100);

  const recentEntries = summary.entries.slice(0, 8);

  const weightChartData = [...weightLogs]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-30)
    .map((e) => ({
      id: e.id,
      weight: e.weight,
      date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: new Date(e.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      {/* ── Hero Header ──────────────────────────── */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting()}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Here&apos;s your nutrition overview for today.
        </p>
      </div>

      {/* ── No goal banner ───────────────────────── */}
      {calorieGoal == null && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-amber-300/50 bg-amber-50/60 px-5 py-4 dark:border-amber-800/40 dark:bg-amber-950/20 animate-fade-in">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">No calorie goal set</p>
            <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-400/80">Set a daily target in Settings to track your progress.</p>
          </div>
          <Link href="/settings" className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors">
            Set Goal
          </Link>
        </div>
      )}

      {/* ── Stat Cards ───────────────────────────── */}
      <div className="stagger-children mb-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Daily Goal"
          value={calorieGoal != null ? calorieGoal.toLocaleString() : "—"}
          sub="kcal target"
          gradient="from-emerald-500/10 to-green-500/5"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Consumed"
          value={consumed.toLocaleString()}
          sub={calorieGoal != null ? `${Math.round((consumed / calorieGoal) * 100)}% of goal` : "kcal today"}
          gradient="from-orange-500/10 to-amber-500/5"
          iconBg="bg-orange-500/10"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
          label="Remaining"
          value={remaining != null ? remaining.toLocaleString() : "—"}
          sub={remaining != null ? (remaining > 0 ? "kcal left today" : "Goal reached! 🎉") : "Set a goal first"}
          gradient="from-blue-500/10 to-cyan-500/5"
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<Apple className="h-5 w-5" />}
          label="Meals Logged"
          value={`${summary.entries.length}`}
          sub={summary.entries.length === 1 ? "entry today" : "entries today"}
          gradient="from-violet-500/10 to-purple-500/5"
          iconBg="bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* ── Charts ───────────────────────────────── */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader
            title="Calorie Trend"
            subtitle="Last 7 days"
            action={
              <Link
                href="/history"
                className="rounded-lg bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                View all →
              </Link>
            }
          />
          <CalorieChart data={calorieHistory} calorieGoal={calorieGoal ?? undefined} />
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "80ms" }}>
          <CardHeader
            title="Weight Progress"
            subtitle={
              weightChartData.length > 0
                ? `${weightChartData.length} entries`
                : "No entries yet"
            }
            action={
              <Link
                href="/weight"
                className="rounded-lg bg-violet-500/8 px-3 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-500/15 dark:text-violet-400"
              >
                Log weight →
              </Link>
            }
          />
          <DashboardWeightChart data={weightChartData} />
        </Card>
      </div>

      {/* ── Main Grid ────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left — Ring + Macros */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Calorie Ring */}
          <Card className="flex flex-col items-center">
            <CardHeader title="Today's Progress" subtitle="Daily calorie goal" />
            <ProgressRing
              value={consumed}
              max={calorieGoal ?? (consumed || 1)}
              size={190}
              strokeWidth={14}
              label="kcal"
            />
            {remaining != null ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/6 px-4 py-2.5">
                <span className="text-sm text-muted">Remaining:</span>
                <span className="text-sm font-bold text-primary">
                  {remaining.toLocaleString()} kcal
                </span>
              </div>
            ) : (
              <Link href="/settings" className="mt-5 rounded-xl bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-500/20 transition-colors dark:text-amber-400">
                Set calorie goal →
              </Link>
            )}
          </Card>

          {/* Macro Breakdown */}
          <Card>
            <CardHeader title="Macros" subtitle="Daily progress" />
            <div className="space-y-5">
              <MacroBar
                label="Protein"
                current={Math.round(summary.totalProtein)}
                goal={proteinGoal}
                percentage={proteinPct}
                color={MACRO_COLORS.protein}
                emoji="🥩"
              />
              <MacroBar
                label="Carbs"
                current={Math.round(summary.totalCarbs)}
                goal={carbsGoal}
                percentage={carbsPct}
                color={MACRO_COLORS.carbs}
                emoji="🍞"
              />
              <MacroBar
                label="Fat"
                current={Math.round(summary.totalFat)}
                goal={fatGoal}
                percentage={fatPct}
                color={MACRO_COLORS.fat}
                emoji="🥑"
              />
            </div>
          </Card>
        </div>

        {/* Right — Recent Meals */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Meals"
            subtitle="Today's food log"
            action={
              <Link
                href="/log"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                Add Food
              </Link>
            }
          />

          {recentEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
                <Apple className="h-8 w-8 text-primary" />
              </div>
              <p className="text-base font-semibold">No meals logged yet</p>
              <p className="mt-1 text-sm text-muted">
                Start tracking by logging your first meal.
              </p>
              <Link
                href="/log"
                className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Log Food
              </Link>
            </div>
          ) : (
            <div className="stagger-children divide-y divide-border-light">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:gap-4"
                >
                  {/* Meal emoji badge */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/6 text-lg sm:h-11 sm:w-11">
                    {MEAL_EMOJI[entry.mealType] ?? "🍽️"}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{entry.foodName}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <span>{mealLabel(entry.mealType).split(" ").slice(1).join(" ")}</span>
                      <span className="text-border">·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {formatTime(entry.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Macros mini */}
                  <div className="hidden shrink-0 items-center gap-2 text-xs sm:flex">
                    <span className="rounded-md bg-blue-500/8 px-2 py-0.5 font-medium text-blue-600 dark:text-blue-400">
                      P {Math.round(entry.protein)}g
                    </span>
                    <span className="rounded-md bg-amber-500/8 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                      C {Math.round(entry.carbs)}g
                    </span>
                    <span className="rounded-md bg-rose-500/8 px-2 py-0.5 font-medium text-rose-600 dark:text-rose-400">
                      F {Math.round(entry.fat)}g
                    </span>
                  </div>

                  {/* Calories */}
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold">{entry.calories}</span>
                    <span className="ml-0.5 text-xs text-muted">kcal</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {summary.entries.length > 8 && (
            <div className="mt-5 text-center">
              <Link
                href="/history"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View all {summary.entries.length} entries →
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* ── Quick Actions ────────────────────────── */}
      <div className="stagger-children mt-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/log"
          icon={<Apple className="h-6 w-6" />}
          title="Log Food"
          description="Record what you've eaten"
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-500/8"
        />
        <QuickAction
          href="/weight"
          icon={<Scale className="h-6 w-6" />}
          title="Log Weight"
          description="Track your body weight"
          color="text-violet-600 dark:text-violet-400"
          bg="bg-violet-500/8"
        />
        <QuickAction
          href="/history"
          icon={<TrendingUp className="h-6 w-6" />}
          title="View History"
          description="See your past entries"
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-500/8"
        />
        <QuickAction
          href="/settings"
          icon={<Target className="h-6 w-6" />}
          title="Set Goals"
          description="Adjust your daily targets"
          color="text-orange-600 dark:text-orange-400"
          bg="bg-orange-500/8"
        />
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-2xl border border-border-light bg-gradient-to-br ${gradient} p-4 shadow-sm sm:p-5`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
          <p className="mt-0.5 text-[11px] text-muted">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  current,
  goal,
  percentage,
  color,
  emoji,
}: {
  label: string;
  current: number;
  goal: number;
  percentage: number;
  color: string;
  emoji: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <span className="text-sm tabular-nums text-muted">
          <span className="font-semibold text-foreground">{current}g</span>
          {" "}/ {goal}g
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-border/50">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  color,
  bg,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <Link href={href}>
      <div className="group rounded-2xl border border-border-light bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color} transition-transform group-hover:scale-105`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{title}</p>
            <p className="hidden text-xs text-muted sm:block">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
