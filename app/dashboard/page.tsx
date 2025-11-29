import { SessionManager } from "@/components/dashboard/session-manager";
import { TwoFactorSwitch } from "@/components/dashboard/two-factor-switch";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session } from "@/components/dashboard/session-manager";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Shield } from "lucide-react";

// Define an interface to match the user object from the session,
// including properties added by plugins like twoFactorEnabled.
interface AuthenticatedUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  // name is not used, so we don't include it in this specific type for user,
  // but it might be present in the underlying better-auth Session type.
  // image is not used.
  twoFactorEnabled?: boolean; // Optional as it might not always be enabled or present
}

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
  const user = session.user as AuthenticatedUser;

  return (
    <div className="min-h-screen bg-muted/20">
      <DashboardNavbar user={user} />

      <main className="container max-w-4xl mx-auto py-10 px-4">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Manage your account settings and security preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-muted-foreground">
                  Email Address
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Account ID: {user.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Card (2FA) */}
          <TwoFactorSwitch
            className="h-full"
            twoFactorEnabled={(user as any).twoFactorEnabled}
          />

          {/* Session Manager - Full Width on Mobile, Span 2 cols if needed or just one */}
          <div className="md:col-span-2">
            <SessionManager
              initialSessions={activeSessions}
              currentSessionToken={session.session.token}
              className="h-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
