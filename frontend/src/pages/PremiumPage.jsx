import React, { useEffect, useState } from "react";
import GameCard from "../components/GameCard";
import { apiGet } from "../lib/api";

const PremiumPage = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    apiGet("/games?category=premium").then(setGames).catch(() => {});
  }, []);

  return (
    <div className="pt-32 pb-20" data-testid="premium-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <span className="label-uppercase text-brand-primary">Free Picks</span>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tighter mt-3">
            Premium Predictions
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">
            Solid mid-tier picks with proven win rates. Free for all registered users.
          </p>
        </div>

        {games.length === 0 ? (
          <div className="card-base p-12 text-center">
            <p className="text-white/60">No premium predictions available. Check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((g, idx) => (
              <GameCard key={g.id} game={g} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumPage;
