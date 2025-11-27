"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/components/dashboard/session-manager";
import { TwoFactorSwitch } from "@/components/dashboard/two-factor-switch";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  return (
    <div className="p-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, {session?.user?.email}</p>
        <div className="flex gap-4">
          <Button onClick={handleSignOut}>Sign Out</Button>
          {/* @ts-expect-error role is added via config but types might not be generated yet */}
          {session?.user?.role === "admin" && (
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Admin Dashboard
            </Button>
          )}
        </div>
      </div>

      <TwoFactorSwitch />
      <SessionManager />
    </div>
  );
}
