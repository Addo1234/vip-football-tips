import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { List, X, SoccerBall, Crown, SignOut } from "@phosphor-icons/react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/vip", label: "VIP Games" },
  { to: "/premium", label: "Premium" },
  { to: "/fixed-odds", label: "Fixed Odds" },
  { to: "/results", label: "Results" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
              <SoccerBall size={24} weight="fill" className="text-black" />
            </div>
            <div className="font-heading font-black text-xl tracking-tight">
              KICK<span className="text-brand-primary">ORACLE</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide uppercase transition-colors ${
                    isActive ? "text-brand-primary" : "text-white/80 hover:text-white"
                  }`
                }
                data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {user.vip_active && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-primary/15 text-brand-primary text-xs font-bold uppercase tracking-wider" data-testid="nav-vip-badge">
                    <Crown size={14} weight="fill" /> VIP
                  </span>
                )}
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-lg bg-brand-elevated border border-white/10 text-sm font-semibold hover:border-brand-primary/50 transition-colors"
                    data-testid="nav-admin-link"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/account"
                  className="text-sm font-semibold text-white/80 hover:text-white"
                  data-testid="nav-account-link"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  data-testid="nav-logout-btn"
                  aria-label="Logout"
                >
                  <SignOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white" data-testid="nav-login-link">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary !py-2 !px-5 text-sm" data-testid="nav-signup-link">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-brand-bg" data-testid="mobile-menu">
          <div className="px-6 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide ${
                    isActive ? "bg-brand-primary/10 text-brand-primary" : "text-white/80 hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="border-t border-white/10 mt-2 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-3 rounded-lg bg-brand-elevated text-sm font-semibold">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/account" onClick={() => setOpen(false)} className="px-3 py-3 rounded-lg text-sm font-semibold">
                    Account ({user.name})
                  </Link>
                  <button onClick={handleLogout} className="px-3 py-3 rounded-lg text-left text-sm font-semibold text-brand-danger">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-3 rounded-lg text-sm font-semibold border border-white/15">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary justify-center text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
