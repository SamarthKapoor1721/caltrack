import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById } from "@/services";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings — CalTrack" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");

  return (
    <div data-density="regular" className="stagger mx-auto grid w-full max-w-[820px] gap-[var(--gap,18px)] px-5 py-6 pb-28 sm:px-6 lg:py-8">
      <div>
        <h1 className="m-0 text-[27px] font-extrabold tracking-tight">
          <span className="grad-text">Settings</span>
        </h1>
        <div className="mt-1 text-[13.5px] font-semibold text-muted">Profile &amp; calorie targets</div>
      </div>

      <SettingsForm
        initial={{
          name: user.name ?? "",
          email: user.email,
          age: user.age ?? 28,
          height: user.height ?? 175,
          weight: user.weight ?? 75,
          gender: (user.gender ?? "OTHER") as "MALE" | "FEMALE" | "OTHER",
          activityLevel: user.activityLevel,
          calorieGoal: user.calorieGoal ?? 2000,
        }}
      />
    </div>
  );
}
