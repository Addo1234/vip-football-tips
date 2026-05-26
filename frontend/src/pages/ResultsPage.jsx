import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, TrendUp } from "@phosphor-icons/react";
import { apiGet } from "../lib/api";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    apiGet("/games/results").then(setResults).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return results;
    return results.filter((r) => r.status === filter);
  }, [results, filter]);

  const stats = useMemo(() => {
    const won = results.filter((r) => r.status === "won").length;
    const lost = results.filter((r) => r.status === "lost").length;
    const total = won + lost;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    return { won, lost, total, winRate };
  }, [results]);

  return (
    <div className="pt-32 pb-20" data-testid="results-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <span className="label-uppercase text-brand-primary">Transparent History</span>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tighter mt-3">
            Results
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">
            Every prediction tracked. Every result verified. No hidden losses.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="card-base p-6">
            <div className="label-uppercase text-white/50 mb-2">Win Rate</div>
            <div className="font-mono font-black text-3xl text-brand-primary">{stats.winRate}%</div>
          </div>
          <div className="card-base p-6">
            <div className="label-uppercase text-white/50 mb-2">Wins</div>
            <div className="font-mono font-black text-3xl text-brand-success">{stats.won}</div>
          </div>
          <div className="card-base p-6">
            <div className="label-uppercase text-white/50 mb-2">Losses</div>
            <div className="font-mono font-black text-3xl text-brand-danger">{stats.lost}</div>
          </div>
          <div className="card-base p-6">
            <div className="label-uppercase text-white/50 mb-2">Total</div>
            <div className="font-mono font-black text-3xl text-white">{stats.total}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: "all", label: "All" },
            { key: "won", label: "Wins" },
            { key: "lost", label: "Losses" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
                filter === f.key ? "bg-brand-primary text-black" : "bg-brand-elevated text-white/80 hover:text-white"
              }`}
              data-testid={`results-filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="card-base overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-white/60">No results yet.</div>
            ) : (
              filtered.map((r) => (
                <div key={r.id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-3" data-testid={`result-row-${r.id}`}>
                  <div className="flex-1">
                    <div className="text-xs text-white/50 mb-1 flex items-center gap-2 font-mono">
                      <span>{formatDate(r.match_date)}</span>
                      <span>•</span>
                      <span>{r.league}</span>
                    </div>
                    <div className="font-heading font-bold text-lg">
                      {r.home_team} <span className="text-white/40 font-normal">vs</span> {r.away_team}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="label-uppercase text-white/50 mb-0.5">Pick</div>
                      <div className="text-sm font-semibold text-brand-primary">{r.prediction}</div>
                    </div>
                    <div className="text-right">
                      <div className="label-uppercase text-white/50 mb-0.5">Odds</div>
                      <div className="font-mono font-bold text-white flex items-center gap-1">
                        <TrendUp size={14} className="text-brand-primary" />
                        {r.odds?.toFixed(2)}
                      </div>
                    </div>
                    {r.score && (
                      <div className="text-right hidden sm:block">
                        <div className="label-uppercase text-white/50 mb-0.5">Score</div>
                        <div className="font-mono font-bold text-white">{r.score}</div>
                      </div>
                    )}
                    <div>
                      {r.status === "won" ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-success/15 text-brand-success font-bold text-sm">
                          <CheckCircle size={16} weight="fill" /> WON
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-danger/15 text-brand-danger font-bold text-sm">
                          <XCircle size={16} weight="fill" /> LOST
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
