import React from "react";
import { Link } from "react-router-dom";
import { FacebookLogo, TwitterLogo, InstagramLogo, WhatsappLogo, SoccerBall } from "@phosphor-icons/react";

const Footer = () => {
  return (
    <footer className="bg-brand-surface border-t border-white/10 mt-20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center">
                <SoccerBall size={22} weight="fill" className="text-black" />
              </div>
              <div className="font-heading font-black text-xl">
                KICK<span className="text-brand-primary">ORACLE</span>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Premium football predictions backed by data, expert analysis, and proven track record.
            </p>
          </div>

          <div>
            <h4 className="label-uppercase text-white/50 mb-4">Predictions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vip" className="text-white/80 hover:text-brand-primary">VIP Games</Link></li>
              <li><Link to="/premium" className="text-white/80 hover:text-brand-primary">Premium</Link></li>
              <li><Link to="/fixed-odds" className="text-white/80 hover:text-brand-primary">Fixed Odds</Link></li>
              <li><Link to="/results" className="text-white/80 hover:text-brand-primary">Results</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="label-uppercase text-white/50 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-white/80 hover:text-brand-primary">Contact</Link></li>
              <li><Link to="/signup" className="text-white/80 hover:text-brand-primary">Get Started</Link></li>
              <li><Link to="/login" className="text-white/80 hover:text-brand-primary">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="label-uppercase text-white/50 mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-brand-elevated hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors" data-testid="footer-facebook">
                <FacebookLogo size={20} weight="bold" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-brand-elevated hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors" data-testid="footer-twitter">
                <TwitterLogo size={20} weight="bold" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-brand-elevated hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors" data-testid="footer-instagram">
                <InstagramLogo size={20} weight="bold" />
              </a>
              <a href="https://wa.me/233123456789" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-brand-elevated hover:bg-brand-primary hover:text-black flex items-center justify-center transition-colors" data-testid="footer-whatsapp">
                <WhatsappLogo size={20} weight="bold" />
              </a>
            </div>
            <p className="text-xs text-white/50 mt-4">
              Bet responsibly. 18+ only.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} KickOracle. All rights reserved.</p>
          <p>Built for serious punters in Ghana 🇬🇭</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
