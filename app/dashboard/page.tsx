import { SessionManager } from "@/components/dashboard/session-manager";
import { TwoFactorSwitch } from "@/components/dashboard/two-factor-switch";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session } from "@/components/dashboard/session-manager";

export default async function DashboardPage() {
  const [session, activeSessionsData] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]);

  if (!session) {
    redirect("/login");
  }

  const activeSessions: Session[] = (activeSessionsData || []) as Session[];

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <TwoFactorSwitch />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Sessions</h2>
          <SessionManager
            initialSessions={activeSessions}
            currentSessionToken={session.session.token}
          />
        </div>
      </div>
    </div>
  );
}
