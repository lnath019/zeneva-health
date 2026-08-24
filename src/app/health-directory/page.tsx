"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HospitalList } from "@/components/dashboard/HospitalList";
import { AmbulanceList } from "@/components/dashboard/AmbulanceList";
import { cn } from "@/lib/utils";

type Tab = "hospitals" | "ambulances";

function DirectoryTabs() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("hospital");
  const [tab, setTab] = useState<Tab>("hospitals");

  return (
    <>
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

      {tab === "hospitals" && <HospitalList highlightId={highlightId} />}
      {tab === "ambulances" && <AmbulanceList />}

      {/* Rendered unconditionally (only visibility toggles) so this static copy
          stays in the server-rendered HTML for crawlers even though the tab
          defaults to Hospitals on first load. */}
      <AmbulanceInfo className={tab === "ambulances" ? "" : "hidden"} />
    </>
  );
}

// Static, non-fetched copy — indexable in the page's initial HTML for search
// engines, independent of whether the live ambulance list above has loaded
// or which tab is currently visible.
function AmbulanceInfo({ className }: { className?: string }) {
  return (
    <div className={cn("mt-8 bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm space-y-6", className)}>
      <div>
        <h2 className="text-xl font-bold text-slate-900">Emergency Ambulance Services in Nepal</h2>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Zeniva Health Care maintains a directory of verified emergency ambulance services across
          Nepal, spanning national dispatch lines, Red Cross chapters, hospital-attached fleets, and
          local government and community services. In a medical emergency, every minute matters —
          this directory is designed to help you find and call the nearest available ambulance
          service as quickly as possible, without searching through outdated contact lists.
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">When to Call an Ambulance</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Call an ambulance immediately for chest pain or suspected heart attack, difficulty
          breathing, severe bleeding, loss of consciousness, major trauma from an accident, stroke
          symptoms (sudden numbness, slurred speech, or facial drooping), severe allergic reactions,
          or any condition where moving the patient without trained medical support could make
          things worse. When you call, be ready to share the patient&apos;s location, condition, and a
          contact number.
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">Types of Ambulance Services Available</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-600 leading-relaxed list-disc pl-5">
          <li>
            <span className="font-semibold text-slate-700">Basic Life Support (BLS):</span> Standard
            transport with first-aid equipment, oxygen, and trained attendants — suitable for stable
            patients who need transfer to a hospital or clinic.
          </li>
          <li>
            <span className="font-semibold text-slate-700">Advanced Life Support (ALS):</span>{" "}
            Equipped with cardiac monitors, ventilators, and paramedics trained for critical,
            life-threatening conditions requiring active treatment en route.
          </li>
          <li>
            <span className="font-semibold text-slate-700">Neonatal Transport:</span> Specialised
            units with incubators and equipment for safely transporting newborns and premature
            infants requiring intensive care.
          </li>
          <li>
            <span className="font-semibold text-slate-700">Patient Transport:</span> Non-emergency
            transport for scheduled appointments, discharges, or transfers between facilities.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">National Emergency Ambulance Numbers</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          A few numbers are worth remembering wherever you are in Nepal:{" "}
          <span className="font-semibold text-slate-700">102</span> for the National Ambulance
          Emergency Line (available nationwide, 24/7),{" "}
          <span className="font-semibold text-slate-700">1130</span> for the Nepal Red Cross
          Society&apos;s ambulance and disaster relief coordination, and{" "}
          <span className="font-semibold text-slate-700">1115</span> for the general Health
          Emergency Hotline. Local hospital, municipal, and private ambulance numbers for your
          district are listed above and update as new services are added.
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">How to Use This Directory</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Every listing shows the service type, coverage area, and a direct phone number. Ambulance
          coverage is organised by province, district, and municipality so you can quickly find the
          service closest to your location, whether you&apos;re in Kathmandu Valley or a rural
          district. Providers, hospitals, and municipal offices can register or update their
          ambulance listings by reaching out through the Zeniva dashboard.
        </p>
      </div>
    </div>
  );
}

export default function HealthDirectoryPage() {
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

          <Suspense fallback={null}>
            <DirectoryTabs />
          </Suspense>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
