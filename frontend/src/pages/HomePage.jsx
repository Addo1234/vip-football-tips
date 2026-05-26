import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { Crown, Lightning, ShieldCheck, ChartLineUp, ArrowRight, CheckCircle, Trophy, Users } from "@phosphor-icons/react";
import GameCard from "../components/GameCard";
import { apiGet } from "../lib/api";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/9140492a-890f-4670-be88-c2da75eb9e94/images/e7ce0d98c29e68b3b144a97cac700aec2d11881a6287182abf82299f41953dbe.png";
const VIP_CONCEPT = "https://static.prod-images.emergentagent.com/jobs/9140492a-890f-4670-be88-c2da75eb9e94/images/3bf8ae8ad98a32be080ea15cf8d87f256abb3acad40c76377c2126705bd19ba4.png";

const HomePage = () => {
  const [vipGames, setVipGames] = useState([]);
  const [premiumGames, setPremiumGames] = useState([]);

  useEffect(() => {
    apiGet("/games?category=vip").then(setVipGames).catch(() => {});
    apiGet("/games?category=premium").then(setPremiumGames).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Stadium" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/80 via-brand-bg/70 to-brand-bg" />
          <div className="absolute inset-0 bg-grid opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/30 mb-6">
              <Lightning size={16} weight="fill" className="text-brand-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
                Trusted by 25,000+ punters
              </span>
            </div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
              Win Bigger With <br />
              <span className="text-brand-primary">Expert Football</span> <br />
              Predictions.
            </h1>

            <p className="text-lg text-white/70 max-w-xl leading-relaxed mb-8">
              Data-driven picks, premium analysis, and verified results from professional tipsters.
              Unlock VIP games for the sharpest edge in the market.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/vip" className="btn-primary justify-center" data-testid="hero-cta-vip">
                <Crown size={20} weight="fill" /> Unlock VIP
              </Link>
              <Link to="/results" className="btn-secondary justify-center" data-testid="hero-cta-results">
                See Results <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-xl mt-12 pt-8 border-t border-white/10">
              <div>
                <div className="font-mono font-bold text-3xl text-brand-primary">87%</div>
                <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Win Rate</div>
              </div>
              <div>
                <div className="font-mono font-bold text-3xl text-brand-primary">25K+</div>
                <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Members</div>
              </div>
              <div>
                <div className="font-mono font-bold text-3xl text-brand-primary">∞</div>
                <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Daily Tips</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <div className="bg-brand-primary text-black py-3 border-y border-brand-primary" data-testid="marquee-ticker">
        <Marquee speed={50} gradient={false}>
          <span className="font-mono font-bold text-sm tracking-widest mx-8 flex items-center gap-2">
            <CheckCircle size={16} weight="fill" /> MAN CITY @1.85 — WON
          </span>
          <span className="font-mono font-bold text-sm tracking-widest mx-8 flex items-center gap-2">
            <CheckCircle size={16} weight="fill" /> AC MILAN BTTS @1.70 — WON
          </span>
          <span className="font-mono font-bold text-sm tracking-widest mx-8 flex items-center gap-2">
            <CheckCircle size={16} weight="fill" /> BAYERN OVER 2.5 @1.55 — WON
          </span>
          <span className="font-mono font-bold text-sm tracking-widest mx-8 flex items-center gap-2">
            <CheckCircle size={16} weight="fill" /> PSG -1 AH @1.90 — WON
          </span>
          <span className="font-mono font-bold text-sm tracking-widest mx-8 flex items-center gap-2">
            <CheckCircle size={16} weight="fill" /> ARSENAL DC @1.40 — WON
          </span>
        </Marquee>
      </div>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <span className="label-uppercase text-brand-primary">Why KickOracle</span>
          <h2 className="font-heading text-3xl md:text-5xl font-black tracking-tight mt-3">
            Built for the serious punter.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Crown, title: "VIP Picks", desc: "Hand-curated high-confidence games from our top tipsters. Updated daily." },
            { icon: ChartLineUp, title: "Data-Driven", desc: "Every prediction backed by stats, form analysis & insider intel." },
            { icon: ShieldCheck, title: "Verified Wins", desc: "Transparent results history. Every win — and loss — recorded." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card-base p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mb-5">
                <f.icon size={28} weight="duotone" className="text-brand-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">{f.title}</h3>
              <p className="text-white/65 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* VIP PREVIEW */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
          <img src={VIP_CONCEPT} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="label-uppercase text-brand-primary">Today's Tickets</span>
              <h2 className="font-heading text-3xl md:text-5xl font-black tracking-tight mt-3 flex items-center gap-3">
                <Crown size={40} weight="fill" className="text-brand-primary" /> VIP Games
              </h2>
            </div>
            <Link to="/vip" className="text-brand-primary text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vipGames.slice(0, 3).map((g, idx) => (
              <GameCard key={g.id} game={g} index={idx} premium onUnlock={() => (window.location.href = "/vip")} />
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="label-uppercase text-brand-primary">Free Tier</span>
            <h2 className="font-heading text-3xl md:text-5xl font-black tracking-tight mt-3">
              Premium Predictions
            </h2>
          </div>
          <Link to="/premium" className="text-brand-primary text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumGames.slice(0, 3).map((g, idx) => (
            <GameCard key={g.id} game={g} index={idx} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="relative card-premium p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <Trophy size={48} weight="duotone" className="text-brand-primary mx-auto mb-6" />
            <h2 className="font-heading text-3xl md:text-5xl font-black tracking-tight mb-4">
              Ready to <span className="text-brand-primary">stack wins?</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
              Join thousands of punters cashing in daily with KickOracle VIP. Mobile money accepted.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary justify-center" data-testid="cta-signup-btn">
                Create Free Account
              </Link>
              <Link to="/vip" className="btn-secondary justify-center" data-testid="cta-vip-btn">
                <Users size={20} /> Join VIP
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
