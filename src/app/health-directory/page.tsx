"use client";

import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HospitalList } from "@/components/dashboard/HospitalList";
import { AmbulanceList } from "@/components/dashboard/AmbulanceList";
import { cn } from "@/lib/utils";

type Tab = "hospitals" | "ambulances";

export default function HealthDirectoryPage() {
  const [tab, setTab] = useState<Tab>("hospitals");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
              Health Directory
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Hospitals &amp; Emergency Ambulances
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Browse our network of hospitals and clinics, or find an ambulance service near you.
            </p>
          </div>

          <div className="flex gap-1 mb-6 border-b border-slate-200">
            <button
              onClick={() => setTab("hospitals")}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
                tab === "hospitals"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Hospitals
            </button>
            <button
              onClick={() => setTab("ambulances")}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
                tab === "ambulances"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Ambulances
            </button>
          </div>

          {tab === "hospitals" ? <HospitalList /> : <AmbulanceList />}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}