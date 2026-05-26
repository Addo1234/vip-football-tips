import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SignIn, EnvelopeSimple, Lock, SoccerBall } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/9140492a-890f-4670-be88-c2da75eb9e94/images/e7ce0d98c29e68b3b144a97cac700aec2d11881a6287182abf82299f41953dbe.png";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get("next") || "/";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name}!`);
      navigate(u.role === "admin" ? "/admin" : nextPath);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2" data-testid="login-page">
      <div className="hidden md:block relative">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-brand-bg/70" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center">
              <SoccerBall size={22} weight="fill" className="text-black" />
            </div>
            <div className="font-heading font-black text-xl">
              KICK<span className="text-brand-primary">ORACLE</span>
            </div>
          </Link>
          <div>
            <h2 className="font-heading text-4xl font-black tracking-tighter mb-3">
              The sharpest tips, <span className="text-brand-primary">cashing out daily.</span>
            </h2>
            <p className="text-white/70">Welcome back. Let's stack some wins.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="label-uppercase text-brand-primary">Sign in</span>
            <h1 className="font-heading text-4xl font-black tracking-tighter mt-2">Welcome back</h1>
            <p className="text-white/65 mt-2">Sign in to access your predictions.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label-uppercase text-white/60 block mb-2">Email</label>
              <div className="relative">
                <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-brand-elevated border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:border-brand-primary focus:outline-none"
                  data-testid="login-email-input"
                />
              </div>
            </div>
            <div>
              <label className="label-uppercase text-white/60 block mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-brand-elevated border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:border-brand-primary focus:outline-none"
                  data-testid="login-password-input"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-50"
              data-testid="login-submit-btn"
            >
              <SignIn size={20} weight="bold" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-white/60 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
