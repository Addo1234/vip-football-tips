import React from "react";
import { motion } from "framer-motion";
import { Lock, TrendUp, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

const StatusBadge = ({ status }) => {
  if (status === "won")
    return (
      <span className="flex items-center gap-1 text-brand-success text-xs font-bold uppercase tracking-wider">
        <CheckCircle size={14} weight="fill" /> Won
      </span>
    );
  if (status === "lost")
    return (
      <span className="flex items-center gap-1 text-brand-danger text-xs font-bold uppercase tracking-wider">
        <XCircle size={14} weight="fill" /> Lost
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-white/50 text-xs font-bold uppercase tracking-wider">
      <Clock size={14} /> Pending
    </span>
  );
};

const GameCard = ({ game, onUnlock, premium = false, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative ${premium ? "card-premium" : "card-base"} p-6 overflow-hidden`}
      data-testid={`game-card-${game.id}`}
    >
      {premium && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest">
          VIP
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="label-uppercase text-white/50">{game.league}</span>
        <StatusBadge status={game.status} />
      </div>

      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex-1 text-left">
          <div className="font-heading font-bold text-base md:text-lg leading-tight" data-testid="game-home-team">{game.home_team}</div>
        </div>
        <div className="font-mono text-xs text-white/40">VS</div>
        <div className="flex-1 text-right">
          <div className="font-heading font-bold text-base md:text-lg leading-tight" data-testid="game-away-team">{game.away_team}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/50 mb-5 font-mono">
        <Clock size={14} />
        {formatDate(game.match_date)}
        {game.score && (
          <span className="ml-auto px-2 py-0.5 rounded bg-brand-elevated text-brand-primary font-bold">
            {game.score}
          </span>
        )}
      </div>

      <div className="border-t border-white/10 pt-4 flex items-center justify-between">
        {game.locked ? (
          <button
            onClick={onUnlock}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-primary text-black font-bold uppercase tracking-wide text-sm hover:bg-brand-primaryHover transition-colors"
            data-testid="game-unlock-btn"
          >
            <Lock size={16} weight="bold" /> Unlock VIP
          </button>
        ) : (
          <>
            <div>
              <div className="label-uppercase text-white/50 mb-1">Prediction</div>
              <div className="font-heading font-bold text-base text-brand-primary" data-testid="game-prediction">
                {game.prediction || "—"}
              </div>
            </div>
            <div className="text-right">
              <div className="label-uppercase text-white/50 mb-1">Odds</div>
              <div className="font-mono font-bold text-xl text-white flex items-center gap-1" data-testid="game-odds">
                <TrendUp size={16} className="text-brand-primary" />
                {game.odds?.toFixed(2)}
              </div>
            </div>
          </>
        )}
      </div>

      {game.confidence && !game.locked && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/50 mb-1.5">
            <span>Confidence</span>
            <span className="font-mono">{game.confidence}%</span>
          </div>
          <div className="h-1.5 bg-brand-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full transition-all"
              style={{ width: `${game.confidence}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GameCard;
