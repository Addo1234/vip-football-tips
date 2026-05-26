import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, CircleNotch, Crown, ArrowRight } from "@phosphor-icons/react";
import { apiGet } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const PaymentCallbackPage = () => {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");
  const [status, setStatus] = useState("loading"); // loading | success | failed
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }
    apiGet(`/payment/verify/${reference}`)
      .then(async (data) => {
        if (data.status === "success") {
          await refreshUser();
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [reference, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-6" data-testid="payment-callback-page">
      <div className="w-full max-w-md card-base p-10 text-center">
        {status === "loading" && (
          <>
            <CircleNotch size={64} className="text-brand-primary mx-auto mb-6 animate-spin" />
            <h1 className="font-heading text-3xl font-black mb-2">Verifying payment...</h1>
            <p className="text-white/60">Hold tight while we confirm your transaction.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-brand-primary/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={56} weight="fill" className="text-brand-primary" />
            </div>
            <span className="label-uppercase text-brand-primary">Payment confirmed</span>
            <h1 className="font-heading text-3xl md:text-4xl font-black mt-3 mb-3">VIP Unlocked!</h1>
            <p className="text-white/70 mb-8">Welcome to KickOracle VIP. All premium picks are now yours.</p>
            <Link to="/vip" className="btn-primary w-full justify-center" data-testid="payment-success-cta">
              <Crown size={20} weight="fill" /> Go to VIP Games
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-brand-danger/15 flex items-center justify-center mx-auto mb-6">
              <XCircle size={56} weight="fill" className="text-brand-danger" />
            </div>
            <h1 className="font-heading text-3xl font-black mb-3">Payment Failed</h1>
            <p className="text-white/70 mb-8">
              We couldn't verify your payment. Please try again or contact support.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/vip" className="btn-primary w-full justify-center">
                Try Again <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-secondary w-full justify-center">
                Contact Support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
