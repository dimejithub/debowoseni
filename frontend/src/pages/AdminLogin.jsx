import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AdminLogin() {
  const { user, signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  if (!loading && user) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back.");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error("Sign-in failed", {
        description: err?.message || "Check your credentials and try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-login-page">
      <div className="lime-glow-soft absolute inset-0" aria-hidden />
      <div className="container-page relative flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime"
            data-testid="admin-back-home"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </a>

          <div className="mt-6 rounded-[24px] border border-line bg-surface p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg">
                <Lock className="h-4 w-4 text-lime" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Admin</p>
                <h1 className="font-display text-3xl tracking-tight">Sign in</h1>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5" data-testid="admin-login-form">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-full border border-line bg-bg px-5 py-3 text-ink focus:border-lime focus:outline-none"
                  data-testid="admin-email"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-full border border-line bg-bg px-5 py-3 text-ink focus:border-lime focus:outline-none"
                  data-testid="admin-password"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-lime px-6 py-3 text-sm font-semibold text-bg disabled:opacity-60"
                data-testid="admin-signin-submit"
              >
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              Authenticated via Supabase Auth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
