import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash, PencilSimple, Users, Crown, ChartLineUp, SoccerBall, EnvelopeSimple } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

const emptyGame = {
  home_team: "",
  away_team: "",
  league: "",
  match_date: "",
  prediction: "",
  odds: 1.5,
  category: "vip",
  confidence: 80,
  notes: "",
};

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("games");
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyGame);
  const [busy, setBusy] = useState(false);

  const loadAll = async () => {
    try {
      const [g, s] = await Promise.all([apiGet("/games"), apiGet("/admin/stats")]);
      setGames(g);
      setStats(s);
    } catch (e) { /* noop */ }
  };

  const loadUsers = async () => {
    try { setUsers(await apiGet("/admin/users")); } catch { /* */ }
  };
  const loadMessages = async () => {
    try { setMessages(await apiGet("/admin/contact-messages")); } catch { /* */ }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAll();
      loadUsers();
      loadMessages();
    }
  }, [user]);

  if (loading) return <div className="pt-32 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const startEdit = (g) => {
    setEditing(g.id);
    setForm({
      home_team: g.home_team,
      away_team: g.away_team,
      league: g.league,
      match_date: g.match_date?.slice(0, 16) || "",
      prediction: g.prediction || "",
      odds: g.odds || 1.5,
      category: g.category,
      confidence: g.confidence || 80,
      notes: g.notes || "",
      status: g.status,
      score: g.score || "",
    });
  };

  const reset = () => {
    setEditing(null);
    setForm(emptyGame);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        odds: parseFloat(form.odds),
        confidence: parseInt(form.confidence),
        match_date: new Date(form.match_date).toISOString(),
      };
      if (editing) {
        await apiPut(`/admin/games/${editing}`, payload);
        toast.success("Game updated");
      } else {
        await apiPost("/admin/games", payload);
        toast.success("Game posted");
      }
      reset();
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this game?")) return;
    try {
      await apiDelete(`/admin/games/${id}`);
      toast.success("Deleted");
      loadAll();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const setStatus = async (g, newStatus) => {
    const score = newStatus === "pending" ? null : window.prompt("Final score (e.g., 2-1)?", g.score || "");
    try {
      await apiPut(`/admin/games/${g.id}`, { status: newStatus, score: score || undefined });
      toast.success("Updated");
      loadAll();
    } catch (e) {
      toast.error("Failed");
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-10 flex items-end justify-between flex-wrap gap-3">
          <div>
            <span className="label-uppercase text-brand-primary">Control Room</span>
            <h1 className="font-heading text-4xl font-black tracking-tighter mt-2">Admin Dashboard</h1>
          </div>
          <div className="text-sm text-white/60">Signed in as <span className="text-brand-primary font-bold">{user.email}</span></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Users" value={stats.total_users || 0} />
          <StatCard icon={Crown} label="VIP Members" value={stats.vip_users || 0} />
          <StatCard icon={SoccerBall} label="Games" value={stats.total_games || 0} />
          <StatCard icon={ChartLineUp} label="Wins" value={stats.games_won || 0} accent />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { k: "games", l: "Games" },
            { k: "post", l: editing ? "Edit Game" : "Post Game" },
            { k: "users", l: "Users" },
            { k: "messages", l: "Messages" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                tab === t.k ? "bg-brand-primary text-black" : "bg-brand-elevated text-white/80 hover:text-white"
              }`}
              data-testid={`admin-tab-${t.k}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === "games" && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-elevated">
                  <tr className="text-left text-white/60">
                    <th className="p-4 label-uppercase">Match</th>
                    <th className="p-4 label-uppercase hidden md:table-cell">Category</th>
                    <th className="p-4 label-uppercase hidden md:table-cell">Pick</th>
                    <th className="p-4 label-uppercase">Status</th>
                    <th className="p-4 label-uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.id} className="border-b border-white/5" data-testid={`admin-game-row-${g.id}`}>
                      <td className="p-4">
                        <div className="font-bold">{g.home_team} vs {g.away_team}</div>
                        <div className="text-xs text-white/50 font-mono">{g.league}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-brand-primary/10 text-brand-primary">
                          {g.category}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm">
                        {g.prediction} <span className="font-mono text-brand-primary">@{g.odds?.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={g.status}
                          onChange={(e) => setStatus(g, e.target.value)}
                          className="bg-brand-elevated border border-white/10 rounded px-2 py-1 text-sm"
                          data-testid={`admin-status-select-${g.id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { startEdit(g); setTab("post"); }} className="p-2 rounded-lg hover:bg-white/5" data-testid={`admin-edit-${g.id}`}>
                            <PencilSimple size={18} />
                          </button>
                          <button onClick={() => del(g.id)} className="p-2 rounded-lg hover:bg-brand-danger/10 text-brand-danger" data-testid={`admin-delete-${g.id}`}>
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {games.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-white/60">No games yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "post" && (
          <form onSubmit={save} className="card-base p-8 space-y-5" data-testid="admin-game-form">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold">{editing ? "Edit Game" : "Post New Game"}</h2>
              {editing && <button type="button" onClick={reset} className="text-sm text-white/60 hover:text-white">Cancel edit</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Home Team">
                <input required value={form.home_team} onChange={(e) => setForm({ ...form, home_team: e.target.value })}
                  className="input" data-testid="form-home-team" />
              </Field>
              <Field label="Away Team">
                <input required value={form.away_team} onChange={(e) => setForm({ ...form, away_team: e.target.value })}
                  className="input" data-testid="form-away-team" />
              </Field>
              <Field label="League">
                <input required value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })}
                  className="input" data-testid="form-league" />
              </Field>
              <Field label="Match Date & Time">
                <input required type="datetime-local" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })}
                  className="input" data-testid="form-match-date" />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" data-testid="form-category">
                  <option value="vip">VIP</option>
                  <option value="premium">Premium</option>
                  <option value="fixed_odds">Fixed Odds</option>
                </select>
              </Field>
              <Field label="Odds">
                <input required type="number" step="0.01" min="1.01" value={form.odds} onChange={(e) => setForm({ ...form, odds: e.target.value })}
                  className="input" data-testid="form-odds" />
              </Field>
              <Field label="Prediction">
                <input required value={form.prediction} onChange={(e) => setForm({ ...form, prediction: e.target.value })}
                  className="input" placeholder="e.g., Over 2.5 Goals" data-testid="form-prediction" />
              </Field>
              <Field label="Confidence (%)">
                <input type="number" min="0" max="100" value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })}
                  className="input" data-testid="form-confidence" />
              </Field>
            </div>
            <Field label="Notes (optional)">
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input resize-none" data-testid="form-notes" />
            </Field>
            <button type="submit" disabled={busy} className="btn-primary justify-center disabled:opacity-50" data-testid="admin-save-game-btn">
              <Plus size={20} weight="bold" /> {busy ? "Saving..." : (editing ? "Update Game" : "Post Game")}
            </button>
          </form>
        )}

        {tab === "users" && (
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead className="bg-brand-elevated">
                <tr className="text-left text-white/60">
                  <th className="p-4 label-uppercase">Name</th>
                  <th className="p-4 label-uppercase">Email</th>
                  <th className="p-4 label-uppercase">Role</th>
                  <th className="p-4 label-uppercase">VIP</th>
                  <th className="p-4 label-uppercase hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="p-4 font-semibold">{u.name}</td>
                    <td className="p-4 text-white/70 font-mono text-sm">{u.email}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${u.role === "admin" ? "bg-brand-primary/10 text-brand-primary" : "bg-white/5 text-white/70"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.vip_active ? (
                        <span className="text-brand-success text-sm font-bold">Active</span>
                      ) : (
                        <span className="text-white/40 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4 text-white/60 text-sm hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-3">
            {messages.length === 0 && <div className="card-base p-8 text-center text-white/60">No messages yet.</div>}
            {messages.map((m) => (
              <div key={m.id} className="card-base p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <EnvelopeSimple size={18} className="text-brand-primary" /> {m.subject}
                    </div>
                    <div className="text-sm text-white/60 mt-1">{m.name} • <span className="font-mono">{m.email}</span></div>
                  </div>
                  <div className="text-xs text-white/40 font-mono">{new Date(m.created_at).toLocaleString()}</div>
                </div>
                <p className="text-white/80 leading-relaxed mt-3">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.input{width:100%;background:#1A243D;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;padding:.75rem 1rem;color:white;outline:none;}.input:focus{border-color:#C4FF00;}`}</style>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className={`card-base p-6 ${accent ? "border-brand-primary/30" : ""}`}>
    <div className="flex items-center gap-3 mb-2">
      <Icon size={20} weight="duotone" className={accent ? "text-brand-primary" : "text-white/60"} />
      <span className="label-uppercase text-white/60">{label}</span>
    </div>
    <div className="font-mono font-black text-3xl">{value}</div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="label-uppercase text-white/60 block mb-2">{label}</span>
    {children}
  </label>
);

export default AdminDashboard;
