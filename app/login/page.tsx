"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsPending(true);
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          toast.message("Signing in...");
        },
        onSuccess: async (ctx) => {
          const data = ctx.data as {
            twoFactor?: boolean;
            twoFactorRedirect?: boolean;
            user?: object;
            session?: object;
          };

          console.log("Sign In Response:", ctx);

          if (data?.twoFactor || data?.twoFactorRedirect) {
            setIsTwoFactor(true);
            toast.message("Two-Factor Authentication required");
            setIsPending(false);
            return;
          }

          if (data?.user || data?.session) {
            toast.success("Signed in successfully!");
            window.location.href = "/dashboard";
            return;
          }

          try {
            const sessionData = await authClient.getSession();

            if (sessionData.data) {
              toast.success("Signed in successfully!");
              window.location.href = "/dashboard";
            } else {
              toast.error("Login failed. Please try again.");
              setIsPending(false);
            }
          } catch {
            toast.error("Login verification failed.");
            setIsPending(false);
          }
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsPending(false);
        },
      }
    );
  };

  const handleSignUp = async () => {
    setIsPending(true);
    await authClient.signUp.email(
      {
        email,
        password,
        name: "",
      },
      {
        onRequest: () => {
          toast.message("Signing up...");
        },
        onSuccess: () => {
          toast.success("Signed up successfully!");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsPending(false);
        },
      }
    );
  };

  const handle2FAVerify = async () => {
    if (otpCode.length < 6) return;
    setIsPending(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: otpCode,
        trustDevice,
      });

      if (res.data) {
        toast.success("Verified successfully!");
        window.location.href = "/dashboard";
      } else if (res.error) {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsPending(false);
    }
  };

  if (isTwoFactor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardHeader className="items-center text-center space-y-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 py-4">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="trust-device"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                />
                <Label htmlFor="trust-device">Trust this device</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={handle2FAVerify}
              disabled={isPending || otpCode.length < 6}
              size="lg"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Identity
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setIsTwoFactor(false)}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full mt-2"
                  onClick={handleSignIn}
                  disabled={isPending}
                  size="lg"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full mt-2"
                  onClick={handleSignUp}
                  disabled={isPending}
                  size="lg"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
