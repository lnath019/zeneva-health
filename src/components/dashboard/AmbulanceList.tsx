"use client";

import React, { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { ambulanceApi } from "@/lib/api";
import { Spinner } from "../ui/Spinner";
import { Ambulance } from "@/types";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  basic: {
    label: "Basic Life Support",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  advanced: {
    label: "Advanced Life Support",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  neonatal: {
    label: "Neonatal",
    className: "bg-pink-50 text-pink-700 border-pink-200",
    dot: "bg-pink-500",
  },
  patient_transport: {
    label: "Patient Transport",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
};

function getTypeConfig(type: string) {
  const key = type?.toLowerCase().replace(/\s+/g, "_");
  return (
    typeConfig[key] ?? {
      label: type ?? "Unknown",
      className: "bg-slate-100 text-slate-600 border-slate-200 capitalize",
      dot: "bg-slate-400",
    }
  );
}

export function AmbulanceList() {
  const {
    data: ambulances,
    isLoading,
    error,
    execute: fetchAmbulances,
  } = useApi(ambulanceApi.getAll);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Emergency Ambulances
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            All available ambulances across districts.
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading ambulances: {error}
        </div>
      ) : !ambulances || ambulances.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No ambulance data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ambulances.map((ambulance: Ambulance) => {
            const badge = getTypeConfig(ambulance.type);

            return (
              <div
                key={ambulance.id}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-secondary/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                {/* Top row — name + type badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                  
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {ambulance.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ambulance.district}
                      </p>
                    </div>
                  </div>

                  {/* Type badge */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                      badge.className,
                    )}
                  >
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", badge.dot)}
                    />
                    {badge.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-sm text-slate-500 border-t border-slate-50 pt-4">
                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4 text-secondary shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-semibold text-slate-700">
                      {ambulance.phone}
                    </span>
                  </div>

                  {/* District */}
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4 text-primary shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-slate-600">{ambulance.district}</span>
                  </div>

                  {/* Notes — only show if present */}
                  {ambulance.notes && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs text-slate-400 italic">
                        {ambulance.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
