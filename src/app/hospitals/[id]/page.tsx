"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { hospitalApi, mediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { HospitalImageManager } from "@/components/dashboard/HospitalImageManager";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StarRating } from "@/components/ui/StarRating";
import { HospitalDetail, HospitalImage, Slot } from "@/types";

const DAY_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const TYPE_LABEL: Record<string, string> = {
  general: "General Hospital",
  multi_specialty: "Multi-Specialty Hospital",
  clinic: "Clinic",
  nursing_home: "Nursing Home",
  diagnostic_center: "Diagnostic Center",
};

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

const isToday = (iso: string) => iso === new Date().toISOString().slice(0, 10);

const Section = ({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export default function HospitalDetailPage({ params }: { params: { id: string } }) {
  const hospitalId = params.id;

  const [hospital, setHospital] = useState<HospitalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  const { token, role } = useAuth();

  // availability filters — doctor and date, applied independently
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setHospital(await hospitalApi.getById(hospitalId));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load hospital");
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    load();
  }, [load]);

  // an admin manages any hospital; a hospital_admin only the one they're attached to
  useEffect(() => {
    if (!token) {
      setCanManage(false);
      return;
    }
    if (role === "admin") {
      setCanManage(true);
      return;
    }
    if (role !== "hospital_admin") {
      setCanManage(false);
      return;
    }
    hospitalApi
      .getMy()
      .then((mine) => setCanManage(mine?.id === hospitalId))
      .catch(() => setCanManage(false));
  }, [token, role, hospitalId]);

  const weeklySchedule = useMemo(
    () =>
      [...(hospital?.opdSchedule ?? [])].sort(
        (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
      ),
    [hospital],
  );

  const availableDates = useMemo(
    () => Array.from(new Set((hospital?.slots ?? []).map((s) => s.slotDate))).sort(),
    [hospital],
  );

  const filteredSlots = useMemo(() => {
    return (hospital?.slots ?? []).filter((s) => {
      if (doctorFilter && (s.doctor?.id ?? s.doctorId) !== doctorFilter) return false;
      if (dateFilter && s.slotDate !== dateFilter) return false;
      return true;
    });
  }, [hospital, doctorFilter, dateFilter]);

  const hasSlotFilters = !!doctorFilter || !!dateFilter;
  const clearSlotFilters = () => { setDoctorFilter(""); setDateFilter(""); };

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of filteredSlots) {
      if (!map.has(s.slotDate)) map.set(s.slotDate, []);
      map.get(s.slotDate)!.push(s);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSlots]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <MarketingHeader />
        <main className="flex-1 flex items-center justify-center py-24"><Spinner size="lg" /></main>
        <MarketingFooter />
      </div>
    );
  }

  if (loadError || !hospital) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <MarketingHeader />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Hospital not found</h1>
          <p className="mt-2 text-slate-500">{loadError ?? "This hospital may have been removed."}</p>
          <Link href="/health-directory" className="inline-block mt-6"><Button>Back to directory</Button></Link>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  const m = hospital.municipality;
  const locationChain = [m?.name, m?.district?.name, m?.district?.province?.name].filter(Boolean);
  const banner = mediaUrl(hospital.imageUrl);
  const mapsHref =
    hospital.latitude != null && hospital.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`
      : null;

  const openSlots = hospital.slots.filter((s) => (s.bookedTokens ?? 0) < (s.maxTokens ?? 0)).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <MarketingHeader />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Link href="/health-directory" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Health Directory
          </Link>

          {/* ── HERO ─────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="relative h-48 sm:h-64 bg-primary-light">
              {banner && !imageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner}
                  alt={hospital.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/40">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{hospital.name}</h1>
                  {hospital.hospitalType && (
                    <p className="text-primary font-semibold mt-1">{TYPE_LABEL[hospital.hospitalType] ?? hospital.hospitalType}</p>
                  )}
                  {locationChain.length > 0 && (
                    <p className="text-sm text-slate-500 mt-1.5">{locationChain.join(", ")}</p>
                  )}
                </div>

                {hospital.doctorRating.total > 0 && (
                  <div className="text-right shrink-0">
                    <StarRating value={hospital.doctorRating.average} />
                    <p className="text-xs text-slate-400 mt-1">
                      {hospital.doctorRating.average.toFixed(1)} from {hospital.doctorRating.total} doctor review
                      {hospital.doctorRating.total !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 mt-6 pt-6 border-t border-slate-100 text-sm">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Doctors</dt>
                  <dd className="mt-1 font-semibold text-slate-800 tabular-nums">{hospital.doctors.length}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open slots</dt>
                  <dd className="mt-1 font-semibold text-slate-800 tabular-nums">{openSlots}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">OPD entries</dt>
                  <dd className="mt-1 font-semibold text-slate-800 tabular-nums">{weeklySchedule.length}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone</dt>
                  <dd className="mt-1 font-semibold text-slate-800">{hospital.phone ?? "—"}</dd>
                </div>
              </dl>

              {/* ── PHOTO GALLERY ──────────────────── */}
              {hospital.images.length > 1 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Photos ({hospital.images.length})
                  </h2>
                  <ul className="flex gap-3 overflow-x-auto pb-1">
                    {hospital.images.map((img) => {
                      const thumb = mediaUrl(img.imageUrl);
                      return (
                        <li key={img.id} className="shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveImage(thumb)}
                            className="block w-32 rounded-lg overflow-hidden border border-slate-200 hover:border-primary/50 transition-colors text-left"
                          >
                            <span className="block h-20 bg-slate-100">
                              {thumb && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={thumb} alt={img.caption ?? hospital.name} className="w-full h-full object-cover" />
                              )}
                            </span>
                            {img.caption && (
                              <span className="block px-2 py-1.5 text-[11px] text-slate-500 truncate">{img.caption}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              {/* ── PHOTO MANAGEMENT (owners only) ── */}
              {canManage && (
                <HospitalImageManager
                  hospitalId={hospital.id}
                  coverUrl={hospital.imageUrl ?? null}
                  onChange={(images, cover) =>
                    setHospital((h) => (h ? { ...h, images: images as HospitalImage[], imageUrl: cover } : h))
                  }
                />
              )}

              {/* ── ABOUT ──────────────────────────── */}
              <Section title="About this hospital">
                {hospital.description ? (
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{hospital.description}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No description available for this hospital yet.</p>
                )}
              </Section>

              {/* ── DOCTORS ────────────────────────── */}
              <Section
                title="Doctors practising here"
                subtitle={hospital.doctors.length > 0 ? "Tap a doctor to see their full profile and availability" : undefined}
              >
                {hospital.doctors.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No doctors are linked to this hospital yet.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hospital.doctors.map((doc) => {
                      const photo = mediaUrl(doc.imageUrl);
                      const name = (doc.user?.fullName ?? "Doctor").replace(/^Dr\.?\s*/i, "");
                      return (
                        <li key={doc.id}>
                          <Link
                            href={`/doctors/${doc.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-slate-50/60 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary-light overflow-hidden shrink-0 flex items-center justify-center text-primary font-bold">
                              {photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photo} alt={name} className="w-full h-full object-cover" />
                              ) : (
                                name.slice(0, 1).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">Dr. {name}</p>
                              <p className="text-xs text-primary font-semibold truncate">
                                {doc.specialisation?.name ?? "General Practitioner"}
                              </p>
                              {doc.degrees?.length > 0 && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {doc.degrees.map((d) => d.degreeName).join(", ")}
                                </p>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>

              {/* ── AVAILABILITY ───────────────────── */}
              <Section
                title="Upcoming availability"
                subtitle={`${filteredSlots.length} slot${filteredSlots.length !== 1 ? "s" : ""} at this hospital`}
                action={
                  hasSlotFilters ? (
                    <button
                      type="button"
                      onClick={clearSlotFilters}
                      className="text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      Clear filters
                    </button>
                  ) : undefined
                }
              >
                {hospital.slots.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div>
                      <label htmlFor="h-doctor" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Doctor
                      </label>
                      <select
                        id="h-doctor"
                        value={doctorFilter}
                        onChange={(e) => setDoctorFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[38px]"
                      >
                        <option value="">All doctors</option>
                        {hospital.doctors.map((d) => (
                          <option key={d.id} value={d.id}>
                            Dr. {(d.user?.fullName ?? "").replace(/^Dr\.?\s*/i, "")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="h-date" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Date
                      </label>
                      <input
                        id="h-date"
                        type="date"
                        value={dateFilter}
                        min={availableDates[0]}
                        max={availableDates[availableDates.length - 1]}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[38px]"
                      />
                    </div>
                  </div>
                )}

                {slotsByDate.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      {hospital.slots.length === 0 ? "No upcoming slots published" : "No slots match these filters"}
                    </p>
                    {hasSlotFilters && hospital.slots.length > 0 && (
                      <Button size="sm" variant="outline" className="mt-3" onClick={clearSlotFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {slotsByDate.map(([day, daySlots]) => (
                      <div key={day}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {isToday(day) ? "Today" : formatDay(day)}
                          </h3>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {daySlots.map((slot) => {
                            const booked = slot.bookedTokens ?? 0;
                            const max = slot.maxTokens ?? 0;
                            const isFull = booked >= max;
                            const docName = (slot.doctor?.user?.fullName ?? "").replace(/^Dr\.?\s*/i, "");

                            return (
                              <Link
                                key={slot.id}
                                href={`/doctors/${slot.doctor?.id ?? slot.doctorId}`}
                                className={`block rounded-xl border p-3.5 transition-colors ${
                                  isFull ? "border-slate-100 bg-slate-50/60" : "border-slate-200 hover:border-primary/40 bg-white"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                                      {slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}
                                    </p>
                                    <p className="text-xs text-slate-600 truncate mt-0.5">Dr. {docName}</p>
                                    <p className="text-[11px] text-primary truncate">
                                      {slot.doctor?.specialisation?.name}
                                    </p>
                                  </div>
                                  <span
                                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                      isFull ? "text-slate-500 bg-slate-200/70" : "text-emerald-700 bg-emerald-50"
                                    }`}
                                  >
                                    {isFull ? "Full" : `${max - booked} left`}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* ── OPD TIMETABLE ──────────────────── */}
              <Section title="Weekly OPD Schedule">
                {weeklySchedule.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No recurring OPD schedule listed.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[380px]">
                      <thead>
                        <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="pb-2 pr-4">Day</th>
                          <th className="pb-2 pr-4">Time</th>
                          <th className="pb-2">Doctor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {weeklySchedule.map((row) => (
                          <tr key={row.id}>
                            <td className="py-2.5 pr-4 font-semibold text-slate-700 capitalize">{row.dayOfWeek}</td>
                            <td className="py-2.5 pr-4 text-slate-600 whitespace-nowrap tabular-nums">{row.startTime} – {row.endTime}</td>
                            <td className="py-2.5 text-slate-500">
                              {row.doctor ? (
                                <Link href={`/doctors/${row.doctor.id}`} className="hover:text-primary transition-colors">
                                  Dr. {(row.doctor.user?.fullName ?? "").replace(/^Dr\.?\s*/i, "")}
                                </Link>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>

            {/* ── SIDEBAR ──────────────────────────── */}
            <div className="space-y-6">
              <Section title="Contact">
                <ul className="space-y-3 text-sm">
                  {hospital.address && (
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-primary shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <span className="text-slate-600">{hospital.address}</span>
                    </li>
                  )}
                  {hospital.phone && (
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-secondary shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <a href={`tel:${hospital.phone}`} className="text-slate-700 font-semibold hover:text-primary transition-colors">
                        {hospital.phone}
                      </a>
                    </li>
                  )}
                  {hospital.email && (
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-secondary shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <a href={`mailto:${hospital.email}`} className="text-slate-600 hover:text-primary transition-colors break-all">
                        {hospital.email}
                      </a>
                    </li>
                  )}
                  {hospital.website && (
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-secondary shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18a15 15 0 010-18z" />
                        </svg>
                      </span>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-primary transition-colors break-all"
                      >
                        {hospital.website.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  )}
                </ul>

                {mapsHref && (
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full">View on map</Button>
                  </a>
                )}
              </Section>

              <Section title="Location">
                {locationChain.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No location recorded.</p>
                ) : (
                  <ol className="space-y-2">
                    {[
                      { label: "Province", value: m?.district?.province?.name },
                      { label: "District", value: m?.district?.name },
                      { label: "Municipality", value: m?.name },
                    ].filter((x) => x.value).map((x) => (
                      <li key={x.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{x.label}</span>
                        <span className="font-semibold text-slate-700 text-right">{x.value}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {hospital.latitude != null && hospital.longitude != null && (
                  <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-mono">
                    {hospital.latitude}, {hospital.longitude}
                  </p>
                )}
              </Section>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />

      {/* ── LIGHTBOX ─────────────────────────────── */}
      {activeImage && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={hospital.name}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
