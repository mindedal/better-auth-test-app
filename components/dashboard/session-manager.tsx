"use client"

import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Laptop, Smartphone, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface Session {
    id: string
    userAgent?: string | null
    ipAddress?: string | null
    expiresAt: Date
    token: string
}

export function SessionManager() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isPending, setIsPending] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { data: currentSession } = authClient.useSession()
    const [revokingId, setRevokingId] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSessions() {
            try {
                const res = await authClient.listSessions()
                if (res.data) {
                    setSessions(res.data as unknown as Session[])
                } else if (res.error) {
                    setError(res.error.message || "Failed to fetch sessions")
                }
            } catch (e) {
                setError("Failed to fetch sessions")
            } finally {
                setIsPending(false)
            }
        }
        fetchSessions()
    }, [])

    if (isPending) {
        return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading sessions...</div>
    }

    if (error) {
        return <div className="text-red-500">Failed to load sessions</div>
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.map((session) => {
                    const isCurrent = currentSession?.session?.token === session.token
                    const isMobile = session.userAgent?.toLowerCase().includes("mobile")
                    
                    return (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full">
                                    {isMobile ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {isMobile ? "Mobile Device" : "Desktop Device"}
                                        {isCurrent && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {session.ipAddress || "Unknown IP"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Last active: {new Date(session.expiresAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            
                            {!isCurrent && (
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    disabled={revokingId === session.token}
                                    onClick={async () => {
                                        setRevokingId(session.token)
                                        try {
                                            await authClient.revokeSession({
                                                token: session.token
                                            })
                                            setSessions(prev => prev.filter(s => s.token !== session.token))
                                            toast.success("Session revoked")
                                        } catch (e) {
                                            toast.error("Failed to revoke session")
                                        } finally {
                                            setRevokingId(null)
                                        }
                                    }}
                                >
                                    {revokingId === session.token ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke"}
                                </Button>
                            )}
                        </div>
                    )
                })}
                {sessions.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                        No active sessions found.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
