import React from "react";
import { WhatsappLogo } from "@phosphor-icons/react";

const WHATSAPP_NUMBER = "233541799703";

const WhatsAppFloat = () => {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20KickOracle%2C%20I%20need%20help`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-green-500/40 hover:scale-110 transition-transform animate-glow-pulse"
      data-testid="whatsapp-float-btn"
      aria-label="WhatsApp Support"
    >
      <WhatsappLogo size={28} weight="fill" className="text-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-danger border-2 border-brand-bg animate-pulse"></span>
    </a>
  );
};

export default WhatsAppFloat;
