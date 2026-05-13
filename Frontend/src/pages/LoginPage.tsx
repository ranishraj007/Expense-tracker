import { zodResolver } from "@hookform/resolvers/zod";
import { Home, LockKeyhole, Mail, PiggyBank } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import ErrorMessage from "@/components/common/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  identifier: z.string().min(2, "Enter your username or email."),
  password: z.string().min(1, "Password is required."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "admin", password: "admin" },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard";

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  });

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative flex min-h-[42vh] overflow-hidden bg-primary px-6 py-12 text-primary-foreground lg:min-h-screen lg:px-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-28"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(19,86,80,0.95),rgba(45,129,120,0.72)_55%,rgba(245,158,11,0.34))]" />
        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col justify-center">
          <div className="mb-6 inline-flex size-14 items-center justify-center rounded-lg border border-white/25 bg-white/15 shadow-xl shadow-slate-950/15 backdrop-blur">
            <PiggyBank className="size-7" />
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Family Expense Tracker</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/88">
            A calm shared space for tracking household spending, credits, and the little daily choices that keep a family budget healthy.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-white/90 sm:grid-cols-3">
            <div className="rounded-lg border border-white/20 bg-white/14 p-3 shadow-lg shadow-slate-950/10 backdrop-blur">Admin-managed users</div>
            <div className="rounded-lg border border-white/20 bg-white/14 p-3 shadow-lg shadow-slate-950/10 backdrop-blur">Shared family analytics</div>
            <div className="rounded-lg border border-white/20 bg-white/14 p-3 shadow-lg shadow-slate-950/10 backdrop-blur">Private edits</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="surface p-6 sm:p-8">
            <div className="mb-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground shadow-sm">
                <Home className="size-6" />
              </div>
              <h2 className="text-2xl font-semibold">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Log in with username/email and password. New users are created by an admin.</p>
            </div>

            <form className="grid gap-4" onSubmit={onSubmit}>
              <ErrorMessage message={error} />
              <div className="grid gap-2">
                <Label htmlFor="identifier">Username or email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="identifier" className="pl-9" autoComplete="username" {...register("identifier")} />
                </div>
                {errors.identifier ? <p className="text-sm text-destructive">{errors.identifier.message}</p> : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" className="pl-9" type="password" autoComplete="current-password" {...register("password")} />
                </div>
                {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
              </div>

              <Button className="mt-2 w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>

            <p className="mt-5 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Admin login: username <strong>admin</strong>, password <strong>admin</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
