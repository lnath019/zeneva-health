"use client";

import { Suspense } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { BookAppointment } from "@/components/dashboard/BookAppointmentList";

export default function BookDoctorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
              Book a Doctor
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">Find &amp; Book a Doctor</h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Search by name, hospital, or speciality, and book directly from available slots.
            </p>
          </div>
<Suspense fallback={null}>
            <BookAppointment />
          </Suspense>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
          