import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Crown, Lock, CheckCircle, CreditCard } from "@phosphor-icons/react";
import GameCard from "../components/GameCard";
import { apiGet, apiPost } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const VIP_PASS_IMG = "https://static.prod-images.emergentagent.com/jobs/9140492a-890f-4670-be88-c2da75eb9e94/images/de4d04dd0f3f746b7438a6c7ffba1d07d911867d09e7403e4268855260deeeab.png";

const VipPage = () => {
  const { user, refreshUser } = useAuth();
  const [games, setGames] = useState([]);
  const [config, setConfig] = useState({ vip_price_ghs: 50, currency: "GHS" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet("/games?category=vip").then(setGames).catch(() => {});
    apiGet("/config").then(setConfig).catch(() => {});
  }, [user]);

  const handleUnlock = async () => {
    if (!user) {
      toast.info("Please sign in to continue");
      navigate("/login?next=/vip");
      return;
    }
    setLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/payment/callback`;
      const data = await apiPost("/payment/initialize", { callback_url: callbackUrl });
      window.location.href = data.authorization_url;
    } catch (e) {
      const msg = e.response?.data?.detail || "Payment initialization failed";
      toast.error(msg);
      if (msg.includes("not configured")) {
        toast.info("Demo mode: payment keys are placeholders.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = user?.vip_active || user?.role === "admin";

  return (
    <div className="pt-32 pb-20" data-testid="vip-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <span className="label-uppercase text-brand-primary">Premium Access</span>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tighter mt-3 flex items-center justify-center gap-3">
            <Crown size={48} weight="fill" className="text-brand-primary" /> VIP Games
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl mx-auto">
            High-confidence picks from our expert tipsters. Updated daily before kickoff.
          </p>
        </div>

        {!isUnlocked && (
          <div className="card-premium p-8 md:p-12 mb-12 grid md:grid-cols-2 gap-8 items-center" data-testid="vip-unlock-cta">
            <div>
              <span className="label-uppercase text-brand-primary">Unlock now</span>
              <h2 className="font-heading text-3xl md:text-4xl font-black mt-3 mb-4">
                Get full VIP access for 30 days
              </h2>
              <ul className="space-y-3 mb-6">
                {[
                  "All daily VIP picks",
                  "Premium expert analysis",
                  "Early access to high-odds bets",
                  "Ghana mobile money accepted",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/85">
                    <CheckCircle size={20} weight="fill" className="text-brand-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-mono font-black text-5xl text-white">GHS {config.vip_price_ghs}</span>
                <span className="text-sm text-white/60">/ month</span>
              </div>
              <button
                onClick={handleUnlock}
                disabled={loading}
                className="btn-primary w-full sm:w-auto justify-center disabled:opacity-50"
                data-testid="unlock-vip-btn"
              >
                <CreditCard size={20} weight="bold" />
                {loading ? "Initializing..." : "Pay with Mobile Money"}
              </button>
            </div>
            <div className="hidden md:block">
              <img src={VIP_PASS_IMG} alt="VIP Pass" className="w-full rounded-xl animate-float" />
            </div>
          </div>
        )}

        {isUnlocked && (
          <div className="card-base p-6 mb-12 flex items-center gap-4" data-testid="vip-active-banner">
            <div className="w-12 h-12 rounded-full bg-brand-primary/15 flex items-center justify-center">
              <CheckCircle size={28} weight="fill" className="text-brand-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">VIP Access Active</h3>
              <p className="text-sm text-white/60">
                All games unlocked. {user?.vip_expires_at && `Expires ${new Date(user.vip_expires_at).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        )}

        {games.length === 0 ? (
          <div className="card-base p-12 text-center" data-testid="vip-empty-state">
            <Lock size={48} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No VIP games scheduled yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="vip-games-grid">
            {games.map((g, idx) => (
              <GameCard key={g.id} game={g} index={idx} premium onUnlock={handleUnlock} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VipPage;
