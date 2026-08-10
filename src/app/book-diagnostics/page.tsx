"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { testApi, authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Spinner } from "@/components/ui/Spinner";
import { Test } from "@/types";

export default function BookDiagnosticsPage() {
  const { data: tests, isLoading, error, execute: fetchTests } = useApi(testApi.getAll);
  const { token } = useAuth();

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    if (!token) return;
    authApi
      .getMe()
      .then((profile) => {
        setFullName(profile.fullName || "");
        setPhone(profile.phone || "");
        setEmail(profile.email || "");
      })
      .catch(() => {
        // not fatal — user can still fill the form manually
      });
  }, [token]);

  const handleOpenModal = (test: Test) => {
    setSelectedTest(test);
    setSubmitted(false);
    setSubmitError(null);
  };

  const handleCloseModal = () => setSelectedTest(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedTest) return;
    if (!fullName.trim() || !phone.trim()) {
      setSubmitError("Please provide your name and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      await testApi.request(selectedTest.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
              Book Diagnostics
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">Find a Diagnostic Service</h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Select the test or scan you need, and our team will connect you with a lab or hospital
              near you.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
              Error loading services: {error}
            </div>
          ) : !tests || tests.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
              No diagnostic services listed yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tests.map((test: Test) => (
                <button
                  key={test.id}
                  onClick={() => handleOpenModal(test)}
                  className="text-left bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <h3 className="text-base font-bold text-slate-800">{test.name}</h3>
                  {test.description && (
                    <p className="text-sm text-slate-500 mt-1.5">{test.description}</p>
                  )}
                  <span className="inline-block mt-4 text-xs font-semibold text-primary">
                    Request this test &rarr;
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedTest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{selectedTest.name}</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {submitted ? (
              <div className="p-6 space-y-3 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">Request received</h4>
                <p className="text-sm text-slate-500">
                  Our team will contact you shortly to connect you with a lab or hospital that
                  offers <strong>{selectedTest.name}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  Leave your contact details and we&apos;ll reach out to connect you with a lab or
                  hospital that offers this test.
                </p>

                {submitError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>

                <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Prefer to talk to someone directly?
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Call us: </span>
                    <a href="tel:+97714440000" className="text-primary hover:underline">
                      +977-1-4440000
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Email us: </span>
                    <a href="mailto:support@zeneva.com" className="text-primary hover:underline">
                      support@zeneva.com
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <MarketingFooter />
    </div>
  );
}