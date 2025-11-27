"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function TwoFactorSwitch() {
    const { data: session } = authClient.useSession()
    const [password, setPassword] = useState("")
    const [isPending, setIsPending] = useState(false)
    const [totpURI, setTotpURI] = useState<string | null>(null)
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [verificationCode, setVerificationCode] = useState("")
    const [showDisableConfirm, setShowDisableConfirm] = useState(false)

    const is2FAEnabled = session?.user?.twoFactorEnabled

    const handleEnable = async () => {
        if (!password) {
            toast.error("Password is required")
            return
        }
        setIsPending(true)
        try {
            const res = await authClient.twoFactor.enable({
                password
            })
            if (res.data) {
                setTotpURI(res.data.totpURI)
                setBackupCodes(res.data.backupCodes || [])
                toast.success("2FA initiated. Please scan the QR code.")
            } else if (res.error) {
                 toast.error(res.error.message)
            }
        } catch (e) {
            toast.error("Failed to enable 2FA")
        } finally {
            setIsPending(false)
        }
    }

    const handleVerify = async () => {
        if (verificationCode.length < 6) return
        setIsPending(true)
        try {
            const res = await authClient.twoFactor.verifyTotp({
                code: verificationCode
            })
            if (res.data) {
                toast.success("2FA Enabled Successfully")
                setTotpURI(null)
                setPassword("")
            } else if (res.error) {
                toast.error(res.error.message)
            }
        } catch (e) {
             toast.error("Verification failed")
        } finally {
            setIsPending(false)
        }
    }

    const handleDisable = async () => {
        if (!password) {
            toast.error("Password is required")
            return
        }
        setIsPending(true)
        try {
            const res = await authClient.twoFactor.disable({
                password
            })
            if (res.data) {
                toast.success("2FA Disabled")
                setShowDisableConfirm(false)
                setPassword("")
            } else if (res.error) {
                toast.error(res.error.message)
            }
        } catch (e) {
            toast.error("Failed to disable 2FA")
        } finally {
            setIsPending(false)
        }
    }

    if (is2FAEnabled) {
        return (
            <Card className="w-full max-w-2xl border-green-200 dark:border-green-900">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                        <CardTitle>Two-Factor Authentication is Enabled</CardTitle>
                    </div>
                    <CardDescription>
                        Your account is secured with 2FA.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showDisableConfirm ? (
                        <Button variant="destructive" onClick={() => setShowDisableConfirm(true)}>
                            Disable 2FA
                        </Button>
                    ) : (
                        <div className="space-y-4 max-w-sm">
                            <div className="space-y-2">
                                <Label>Confirm Password to Disable</Label>
                                <Input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Enter your password"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="destructive" 
                                    onClick={handleDisable}
                                    disabled={isPending}
                                >
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Disable
                                </Button>
                                <Button variant="ghost" onClick={() => setShowDisableConfirm(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!totpURI ? (
                    <div className="space-y-4 max-w-sm">
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Enter password to enable 2FA"
                            />
                        </div>
                        <Button onClick={handleEnable} disabled={isPending}>
                             {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Enable 2FA
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="p-4 bg-white rounded-lg w-fit border">
                                <QRCodeSVG value={totpURI} size={150} />
                            </div>
                            <div className="space-y-4 flex-1">
                                <h3 className="font-medium">1. Scan QR Code</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use an authenticator app (like Google Authenticator or Authy) to scan this code.
                                </p>
                                
                                <h3 className="font-medium">2. Enter Verification Code</h3>
                                <div className="space-y-2">
                                    <InputOTP
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={setVerificationCode}
                                    >
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
                                <Button onClick={handleVerify} disabled={isPending || verificationCode.length < 6}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify & Activate
                                </Button>
                            </div>
                        </div>
                        
                        {backupCodes.length > 0 && (
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                <div className="flex items-center gap-2 font-medium text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    Backup Codes
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Save these codes in a safe place. You can use them to log in if you lose access to your device.
                                </p>
                                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                                    {backupCodes.map((code, i) => (
                                        <div key={i} className="bg-background p-1 px-2 rounded border">{code}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
