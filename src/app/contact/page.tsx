"use client";

import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend endpoint for contact submissions yet — this just
    // confirms receipt locally. Wire this up to a real endpoint later.
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
            Contact
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-600 leading-relaxed max-w-2xl mb-12">
            Have a question about booking, an account issue, or a partnership inquiry?
            Send us a message, or reach out directly using the details below.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-6">
                  <h3 className="font-bold mb-1">Message received</h3>
                  <p className="text-sm">
                    Thanks for reaching out — our team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary/15"
                    />
                  </div>
                  <Button type="submit">Send Message</Button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Contact Details
                </h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    <span className="block font-semibold text-slate-800">Phone</span>
                    +977-1-4440000
                  </p>
                  <p>
                    <span className="block font-semibold text-slate-800">Email</span>
                    support@zeneva.com
                  </p>
                  <p>
                    <span className="block font-semibold text-slate-800">Location</span>
                    Kathmandu, Nepal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}