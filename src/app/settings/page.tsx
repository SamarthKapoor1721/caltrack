import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById } from "@/services";
import { Card, CardHeader } from "@/components/ui";
import { ProfileForm } from "./profile-form";
import { GoalsForm } from "./goals-form";

export const metadata = { title: "Settings — CalTrack" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile and daily nutrition goals.</p>
      </div>

      <div className="stagger-children space-y-4">
        <Card>
          <CardHeader title="Profile" subtitle="Your personal information" />
          <ProfileForm name={user.name ?? ""} />
        </Card>

        <Card>
          <CardHeader title="Daily Calorie Goal" subtitle="Your kcal target for the day" />
          <GoalsForm calorieGoal={user.calorieGoal ?? null} />
        </Card>

        <Card className="border-red-300/40 dark:border-red-900/40">
          <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
          <button type="button"
            className="h-10 rounded-xl border border-red-300 px-5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">
            Clear All Data
          </button>
        </Card>
      </div>
    </div>
  );
}
