import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Database, Zap, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-(family-name:--font-geist-sans)">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span>BetterAuth</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button size="sm">View Auth Flow</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container max-w-5xl mx-auto flex flex-col items-center gap-4 text-center px-4">
            <Link
              href="https://github.com/better-auth/better-auth"
              className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium transition-colors hover:text-primary"
              target="_blank"
            >
              Follow along on GitHub
            </Link>
            <h1 className="font-heading text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl tracking-tight">
              Authentication Testbed
            </h1>
            <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Demonstrating secure auth with PostgreSQL, Redis, and cookie-based sessions for Next.js applications.
            </p>
            <div className="space-x-4">
              <Link href="/login">
                <Button size="lg" className="h-11 px-8">
                  View Auth Flow
                </Button>
              </Link>
              <Link href="https://github.com" target="_blank">
                <Button variant="outline" size="lg" className="h-11 px-8 gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container max-w-5xl mx-auto space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24 px-4 rounded-3xl">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
            <Card className="bg-background/60 shadow-sm">
              <CardHeader>
                <Zap className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>Auth Flow Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Test and observe various authentication flows, including login, logout, and session management.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 shadow-sm">
              <CardHeader>
                <Database className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>PostgreSQL Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seamless integration with PostgreSQL for robust user and session data storage.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 shadow-sm">
              <CardHeader>
                <Database className="h-10 w-10 text-red-500 mb-2" />
                <CardTitle>Redis Cache</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  High-performance session storage and caching using Redis for
                  blazing speed.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0">
        <div className="container max-w-5xl mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            This is a technical demonstration, not a production service. Built using Next.js and shadcn/ui.
          </p>
        </div>
      </footer>
    </div>
  );
}
