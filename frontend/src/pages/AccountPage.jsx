import React from "react";
import { Navigate, Link } from "react-router-dom";
import { Crown, CheckCircle, User as UserIcon, EnvelopeSimple } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

const AccountPage = () => {
  const { user, loading, logout } = useAuth();
  if (loading) return <div className="pt-32 text-center text-white/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="pt-32 pb-20" data-testid="account-page">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <span className="label-uppercase text-brand-primary">My Account</span>
        <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter mt-2 mb-8">Hi, {user.name}</h1>

        <div className="card-base p-8 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Row icon={UserIcon} label="Name" value={user.name} />
            <Row icon={EnvelopeSimple} label="Email" value={user.email} />
            <Row icon={Crown} label="VIP Status" value={user.vip_active ? "Active" : "Inactive"} accent={user.vip_active} />
            <Row icon={CheckCircle} label="Role" value={user.role.toUpperCase()} />
          </div>

          {user.vip_active && user.vip_expires_at && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <span className="label-uppercase text-white/60">VIP expires</span>
              <div className="font-mono text-brand-primary text-lg mt-1">
                {new Date(user.vip_expires_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!user.vip_active && (
            <Link to="/vip" className="btn-primary" data-testid="account-upgrade-btn">
              <Crown size={20} weight="fill" /> Upgrade to VIP
            </Link>
          )}
          <button onClick={logout} className="btn-secondary" data-testid="account-logout-btn">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ icon: Icon, label, value, accent }) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={18} className="text-white/50" />
      <span className="label-uppercase text-white/60">{label}</span>
    </div>
    <div className={`font-heading font-bold text-xl ${accent ? "text-brand-primary" : ""}`}>{value}</div>
  </div>
);

export default AccountPage;
