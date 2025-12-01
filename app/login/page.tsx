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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, ShieldCheck, CheckCircle2, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

// Password validation schema with strength requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
}

// Password strength indicator component
function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Special character", valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check) => (
        <div
          key={check.label}
          className={`flex items-center gap-2 text-xs ${
            check.valid ? "text-green-600" : "text-muted-foreground"
          }`}
        >
          <CheckCircle2
            className={`h-3 w-3 ${check.valid ? "opacity-100" : "opacity-30"}`}
          />
          {check.label}
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [isPending, setIsPending] = useState(false);

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
    // Validate password strength before submitting
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      passwordValidation.errors.forEach((error) => toast.error(error));
      return;
    }

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
          toast.success(
            "Account created! Please check your email to verify your account."
          );
          setShowVerificationMessage(true);
          setIsPending(false);
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

  // Show email verification message after signup
  if (showVerificationMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardHeader className="items-center text-center space-y-2">
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 mb-2">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to verify your account. If you
              don&apos;t see it, check your spam folder.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowVerificationMessage(false)}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
                  <PasswordStrengthIndicator password={password} />
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
