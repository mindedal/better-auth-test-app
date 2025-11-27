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
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsPending(true);
    if (isSignUp) {
      await authClient.signUp.email(
        {
          email,
          password,
          name: email.split("@")[0],
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
    } else {
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
            const data = ctx.data as { twoFactor?: boolean; twoFactorRedirect?: boolean; user?: object; session?: object };

            // Correct check for 2FA flag in the response
            if (data?.twoFactor || data?.twoFactorRedirect) {
              setIsTwoFactor(true);
              toast.message("Two-Factor Authentication required");
              setIsPending(false);
              return;
            }

            // Standard success case - User object present
            if (data?.user || data?.session) {
              toast.success("Signed in successfully!");
              window.location.href = "/dashboard";
              return;
            }

            // Fallback: If data is empty (e.g. {}), verify session explicitly
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
    }
  };

  const handle2FAVerify = async () => {
    if (otpCode.length < 6) return;
    setIsPending(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: otpCode,
        trustDevice: true,
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={handle2FAVerify}
              disabled={isPending || otpCode.length < 6}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isSignUp ? "Sign Up" : "Login"}</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
