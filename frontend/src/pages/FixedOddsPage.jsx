import React, { useEffect, useState } from "react";
import { TrendUp, Clock } from "@phosphor-icons/react";
import { apiGet } from "../lib/api";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

const FixedOddsPage = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    apiGet("/games?category=fixed_odds").then(setGames).catch(() => {});
  }, []);

  return (
    <div className="pt-32 pb-20" data-testid="fixed-odds-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <span className="label-uppercase text-brand-primary">Sharp Odds</span>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tighter mt-3">
            Fixed Odds
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">
            Locked-in odds, tight spreads, and clear lines for value bettors.
          </p>
        </div>

        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="fixed-odds-table">
              <thead>
                <tr className="border-b border-white/10 bg-brand-elevated">
                  <th className="text-left p-4 label-uppercase text-white/60">Match</th>
                  <th className="text-left p-4 label-uppercase text-white/60 hidden md:table-cell">League</th>
                  <th className="text-left p-4 label-uppercase text-white/60 hidden lg:table-cell">Date</th>
                  <th className="text-left p-4 label-uppercase text-white/60">Tip</th>
                  <th className="text-right p-4 label-uppercase text-white/60">Odds</th>
                </tr>
              </thead>
              <tbody>
                {games.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-white/60">
                      No fixed odds available right now.
                    </td>
                  </tr>
                ) : (
                  games.map((g) => (
                    <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors" data-testid={`odds-row-${g.id}`}>
                      <td className="p-4">
                        <div className="font-heading font-bold">
                          {g.home_team} <span className="text-white/40 font-normal">vs</span> {g.away_team}
                        </div>
                      </td>
                      <td className="p-4 text-white/60 text-sm hidden md:table-cell">{g.league}</td>
                      <td className="p-4 text-white/60 text-sm font-mono hidden lg:table-cell">
                        <span className="flex items-center gap-1"><Clock size={14} />{formatDate(g.match_date)}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-brand-primary">{g.prediction}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-xl text-white inline-flex items-center gap-1">
                          <TrendUp size={16} className="text-brand-primary" />
                          {g.odds?.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedOddsPage;
