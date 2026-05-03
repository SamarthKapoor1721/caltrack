import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkoutsByUser } from "@/services";
import { Card, CardHeader } from "@/components/ui";
import { WorkoutForm } from "@/components/workout-form";
import { DeleteWorkout } from "./delete-button";

export const metadata = {
  title: "Log Workout — CalTrack",
};

function formatWhen(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function WorkoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workouts = await getWorkoutsByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Log Workout</h1>
        <p className="mt-1 text-sm text-muted">
          Type the name of any exercise to log it.
        </p>
      </div>

      <Card className="animate-slide-up">
        <WorkoutForm />
      </Card>

      {workouts.length > 0 ? (
        <Card className="mt-8 animate-fade-in">
          <CardHeader
            title="Recent Workouts"
            subtitle={`${workouts.length} ${workouts.length === 1 ? "entry" : "entries"}`}
          />
          <div className="divide-y divide-border-light">
            {workouts.map((w) => (
              <div key={w.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/6 text-lg sm:h-11 sm:w-11">
                    💪
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{w.exerciseName}</p>
                      {w.toFailure && (
                        <span className="shrink-0 rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                          Failure
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {w.sets != null && (
                        <span className="rounded-md bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                          {w.sets} sets{w.reps != null ? ` × ${w.reps} reps` : ""}
                        </span>
                      )}
                      {w.intensity != null && (
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          w.intensity <= 4 ? "bg-emerald-500/10 text-emerald-700"
                          : w.intensity <= 7 ? "bg-amber-500/10 text-amber-700"
                          : "bg-red-500/10 text-red-700"
                        }`}>
                          RPE {w.intensity}
                        </span>
                      )}
                      {w.durationMin != null && (
                        <span className="rounded-md bg-muted/15 px-2 py-0.5 text-xs font-medium text-muted">
                          {w.durationMin} min
                        </span>
                      )}
                      {w.caloriesBurned != null && (
                        <span className="rounded-md bg-muted/15 px-2 py-0.5 text-xs font-medium text-muted">
                          {w.caloriesBurned} kcal
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      {formatWhen(w.createdAt)}{w.notes ? ` · ${w.notes}` : ""}
                    </p>
                  </div>

                  <DeleteWorkout id={w.id} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <p className="mt-10 text-center text-sm text-muted animate-fade-in">
          No workouts logged yet.
        </p>
      )}
    </div>
  );
}
