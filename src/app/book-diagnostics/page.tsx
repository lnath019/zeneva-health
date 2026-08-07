"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { testApi } from "@/lib/api";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Spinner } from "@/components/ui/Spinner";
import { Test } from "@/types";

export default function BookDiagnosticsPage() {
  const { data: tests, isLoading, error, execute: fetchTests } = useApi(testApi.getAll);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

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
                  onClick={() => setSelectedTest(test)}
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
                onClick={() => setSelectedTest(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                We&apos;ve noted your interest in <strong>{selectedTest.name}</strong>. Our team will
                reach out to connect you with a lab or hospital that offers this test.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
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
            </div>
          </div>
        </div>
      )}

      <MarketingFooter />
    </div>
  );
}