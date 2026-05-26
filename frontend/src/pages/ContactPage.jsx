import React, { useState } from "react";
import { toast } from "sonner";
import { EnvelopeSimple, Phone, MapPin, PaperPlaneRight, WhatsappLogo } from "@phosphor-icons/react";
import { apiPost } from "../lib/api";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/contact", form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20" data-testid="contact-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <span className="label-uppercase text-brand-primary">Get in Touch</span>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tighter mt-3">
            Contact Us
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl mx-auto">
            Got a question, suggestion, or need support? Drop us a line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-base p-6 text-center">
            <EnvelopeSimple size={32} weight="duotone" className="text-brand-primary mx-auto mb-3" />
            <div className="label-uppercase text-white/50 mb-1">Email</div>
            <div className="font-semibold">hello@kickoracle.com</div>
          </div>
          <div className="card-base p-6 text-center">
            <WhatsappLogo size={32} weight="duotone" className="text-brand-primary mx-auto mb-3" />
            <div className="label-uppercase text-white/50 mb-1">WhatsApp</div>
            <div className="font-semibold">+233 54 179 9703</div>
          </div>
          <div className="card-base p-6 text-center">
            <MapPin size={32} weight="duotone" className="text-brand-primary mx-auto mb-3" />
            <div className="label-uppercase text-white/50 mb-1">Location</div>
            <div className="font-semibold">Accra, Ghana 🇬🇭</div>
          </div>
        </div>

        <div className="card-base p-8 md:p-12 max-w-2xl mx-auto">
          <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-uppercase text-white/60 block mb-2">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-brand-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-brand-primary focus:outline-none"
                  data-testid="contact-name-input"
                />
              </div>
              <div>
                <label className="label-uppercase text-white/60 block mb-2">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-brand-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-brand-primary focus:outline-none"
                  data-testid="contact-email-input"
                />
              </div>
            </div>
            <div>
              <label className="label-uppercase text-white/60 block mb-2">Subject</label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-brand-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-brand-primary focus:outline-none"
                data-testid="contact-subject-input"
              />
            </div>
            <div>
              <label className="label-uppercase text-white/60 block mb-2">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-brand-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-brand-primary focus:outline-none resize-none"
                data-testid="contact-message-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-50"
              data-testid="contact-submit-btn"
            >
              <PaperPlaneRight size={20} weight="bold" />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
