"use client";

import React, { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Hospital, Slot } from "@/types";

interface DoctorAvailabilityProps {
  slots: Slot[];
  hospitals: Hospital[];
  onBook: (slot: Slot) => void;
}

type Period = "all" | "morning" | "afternoon" | "evening";
type Availability = "all" | "open";

const PERIODS: { key: Period; label: string; from: number; to: number }[] = [
  { key: "all", label: "Any time", from: 0, to: 24 },
  { key: "morning", label: "Morning", from: 0, to: 12 },
  { key: "afternoon", label: "Afternoon", from: 12, to: 17 },
  { key: "evening", label: "Evening", from: 17, to: 24 },
];

const hourOf = (time?: string) => Number((time ?? "0").slice(0, 2));

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

const isToday = (iso: string) => iso === new Date().toISOString().slice(0, 10);

const SELECT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[38px]";

export function DoctorAvailability({ slots, hospitals, onBook }: DoctorAvailabilityProps) {
  // three independent filters — each narrows the list on its own
  const [hospitalId, setHospitalId] = useState("");
  const [date, setDate] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [availability, setAvailability] = useState<Availability>("all");

  // dates that actually have slots, so the day strip never offers a dead option
  const availableDates = useMemo(
    () => Array.from(new Set(slots.map((s) => s.slotDate))).sort(),
    [slots],
  );

  // hospitals this doctor actually has slots at (may be fewer than affiliations)
  const hospitalOptions = useMemo(() => {
    const withSlots = new Set(slots.map((s) => s.hospitalId ?? s.hospital?.id).filter(Boolean));
    return hospitals.filter((h) => withSlots.has(h.id));
  }, [slots, hospitals]);

  const filtered = useMemo(() => {
    const p = PERIODS.find((x) => x.key === period)!;
    return slots.filter((s) => {
      const slotHospitalId = s.hospitalId ?? s.hospital?.id;
      if (hospitalId && slotHospitalId !== hospitalId) return false;
      if (date && s.slotDate !== date) return false;

      const h = hourOf(s.startTime);
      if (period !== "all" && (h < p.from || h >= p.to)) return false;

      if (availability === "open" && (s.bookedTokens ?? 0) >= (s.maxTokens ?? 0)) return false;
      return true;
    });
  }, [slots, hospitalId, date, period, availability]);

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of filtered) {
      if (!map.has(s.slotDate)) map.set(s.slotDate, []);
      map.get(s.slotDate)!.push(s);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const hasFilters = !!hospitalId || !!date || period !== "all" || availability !== "all";
  const clearAll = () => { setHospitalId(""); setDate(""); setPeriod("all"); setAvailability("all"); };

  const openCount = filtered.filter((s) => (s.bookedTokens ?? 0) < (s.maxTokens ?? 0)).length;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <div className="p-6 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Available Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length === 0
              ? "No slots match these filters"
              : `${filtered.length} slot${filtered.length !== 1 ? "s" : ""} · ${openCount} open for booking`}
          </p>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── FILTERS ─────────────────────────── */}
      <div className="px-6 pb-5 space-y-4 border-b border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="filter-hospital" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Hospital
            </label>
            <select
              id="filter-hospital"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="">All hospitals</option>
              {hospitalOptions.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-date" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              id="filter-date"
              type="date"
              value={date}
              min={availableDates[0]}
              max={availableDates[availableDates.length - 1]}
              onChange={(e) => setDate(e.target.value)}
              className={SELECT_CLS}
            />
          </div>

          <div>
            <label htmlFor="filter-period" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Time of day
            </label>
            <select
              id="filter-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className={SELECT_CLS}
            >
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* quick day strip — only dates that actually have slots */}
        {availableDates.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setDate("")}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                date === "" ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              All dates
            </button>
            {availableDates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDate(d === date ? "" : d)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  date === d ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {isToday(d) ? "Today" : formatDay(d)}
              </button>
            ))}
          </div>
        )}

        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={availability === "open"}
            onChange={(e) => setAvailability(e.target.checked ? "open" : "all")}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Only show slots with tokens left
        </label>
      </div>

      {/* ── SLOTS ───────────────────────────── */}
      <div className="p-6">
        {grouped.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No slots match your filters</p>
            <p className="text-xs text-slate-400 mt-1">
              {slots.length === 0 ? "This doctor hasn't published any upcoming slots." : "Try widening the date range or choosing another hospital."}
            </p>
            {hasFilters && slots.length > 0 && (
              <Button size="sm" variant="outline" className="mt-4" onClick={clearAll}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([day, daySlots]) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {isToday(day) ? "Today" : formatDay(day)}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {daySlots
                    .slice()
                    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
                    .map((slot) => {
                      const booked = slot.bookedTokens ?? 0;
                      const max = slot.maxTokens ?? 0;
                      const isFull = booked >= max;
                      const left = Math.max(max - booked, 0);
                      const pct = max > 0 ? Math.min((booked / max) * 100, 100) : 0;

                      return (
                        <div
                          key={slot.id}
                          className={`rounded-xl border p-3.5 transition-colors ${
                            isFull ? "border-slate-100 bg-slate-50/60" : "border-slate-200 hover:border-primary/40 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 tabular-nums">
                                {slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}
                              </p>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{slot.hospital?.name}</p>
                            </div>
                            <span
                              className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                isFull ? "text-slate-500 bg-slate-200/70" : left <= 3 ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50"
                              }`}
                            >
                              {isFull ? "Full" : left <= 3 ? `${left} left` : "Open"}
                            </span>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                              <span>Tokens</span>
                              <span className="font-semibold text-slate-600 tabular-nums">{booked}/{max}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isFull ? "bg-slate-300" : left <= 3 ? "bg-amber-400" : "bg-emerald-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className="w-full mt-3"
                            disabled={isFull}
                            onClick={() => onBook(slot)}
                          >
                            {isFull ? "Fully booked" : "Book this slot"}
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
