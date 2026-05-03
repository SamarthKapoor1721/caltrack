import { Card, CardHeader } from "@/components/ui";
import { Clock } from "@/components/icons";

export const metadata = {
  title: "History — CalTrack",
};

const historyData = [
  {
    date: "2026-03-09",
    label: "Today",
    calories: 1420,
    goal: 2000,
    entries: 5,
  },
  {
    date: "2026-03-08",
    label: "Yesterday",
    calories: 1850,
    goal: 2000,
    entries: 7,
  },
  {
    date: "2026-03-07",
    label: "Mar 7",
    calories: 2100,
    goal: 2000,
    entries: 8,
  },
  {
    date: "2026-03-06",
    label: "Mar 6",
    calories: 1780,
    goal: 2000,
    entries: 6,
  },
  {
    date: "2026-03-05",
    label: "Mar 5",
    calories: 1950,
    goal: 2000,
    entries: 7,
  },
];

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted">
          Review your past daily nutrition summaries.
        </p>
      </div>

      <div className="stagger-children space-y-3">
        {historyData.map((day) => {
          const percent = Math.round((day.calories / day.goal) * 100);
          const over = day.calories > day.goal;

          return (
            <Card key={day.date}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    over ? "bg-red-500/8" : "bg-primary/8"
                  }`}>
                    <Clock className={`h-5 w-5 ${over ? "text-red-500" : "text-primary"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold sm:text-base">{day.label}</p>
                    <p className="text-xs text-muted">
                      {day.entries} entries · {day.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums">
                    {day.calories.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted">kcal</span>
                  </p>
                  <p
                    className={`text-xs font-semibold ${over ? "text-red-500" : "text-primary"}`}
                  >
                    {percent}% of goal
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-border/50">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out`}
                  style={{
                    width: `${Math.min(percent, 100)}%`,
                    backgroundColor: over ? "var(--color-red-500)" : "var(--primary)",
                    boxShadow: over
                      ? "0 0 8px rgba(239,68,68,0.3)"
                      : "0 0 8px var(--primary-glow)",
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
