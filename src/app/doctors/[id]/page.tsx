"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doctorApi, appointmentApi, medicalHistoryApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StarRating } from "@/components/ui/StarRating";
import { DoctorPhoto } from "@/components/dashboard/DoctorPhoto";
import { DoctorReviews } from "@/components/dashboard/DoctorReviews";
import { DoctorAbout } from "@/components/dashboard/DoctorAbout";
import { DoctorAvailability } from "@/components/dashboard/DoctorAvailability";
import { DoctorDetail, MedicalHistoryRecord, Slot } from "@/types";

const DAY_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const Section = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const doctorId = params.id;
  const router = useRouter();
  const { token, userId, role } = useAuth();

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // booking modal — mirrors the flow on /book-doctor so behaviour stays consistent
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState("");
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [myRecords, setMyRecords] = useState<MedicalHistoryRecord[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setDoctor(await doctorApi.getById(doctorId));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load doctor");
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    medicalHistoryApi.getMy().then(setMyRecords).catch(() => setMyRecords([]));
  }, [token]);

  const isOwnProfile = role === "doctor" && !!userId && userId === doctor?.user?.id;

  // slots a patient could still book right now — drives the hero stat
  const openSlotCount = useMemo(
    () => (doctor?.slots ?? []).filter((s) => (s.bookedTokens ?? 0) < (s.maxTokens ?? 0)).length,
    [doctor],
  );

  const weeklySchedule = useMemo(
    () =>
      [...(doctor?.opdSchedule ?? [])].sort(
        (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
      ),
    [doctor],
  );

  const openBooking = (slot: Slot) => {
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/doctors/${doctorId}`)}`);
      return;
    }
    setBookingSlot(slot);
    setReason("");
    setSelectedRecordIds([]);
    setBookingError(null);
  };

  const confirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSlot) return;
    if (!reason.trim()) {
      setBookingError("Please specify a reason for your visit.");
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    try {
      await appointmentApi.book(bookingSlot.id, reason, selectedRecordIds);
      setBookingSlot(null);
      router.push("/dashboard?tab=patient-appointments");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <MarketingHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <Spinner size="lg" />
        </main>
        <MarketingFooter />
      </div>
    );
  }

  if (loadError || !doctor) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <MarketingHeader />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Doctor not found</h1>
          <p className="mt-2 text-slate-500">{loadError ?? "This profile may have been removed."}</p>
          <Link href="/book-doctor" className="inline-block mt-6">
            <Button>Back to all doctors</Button>
          </Link>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  const displayName = `Dr. ${(doctor.user?.fullName ?? "").replace(/^Dr\.?\s*/i, "")}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <MarketingHeader />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <Link href="/book-doctor" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All doctors
          </Link>

          {/* ── HERO: photo + identity ───────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <DoctorPhoto
                name={doctor.user?.fullName ?? "Doctor"}
                imageUrl={doctor.imageUrl ?? null}
                editable={isOwnProfile}
                onChange={(url) => setDoctor((d) => (d ? { ...d, imageUrl: url } : d))}
              />

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{displayName}</h1>
                <p className="text-primary font-semibold mt-1">
                  {doctor.specialisation?.name ?? "General Practitioner"}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                  <StarRating value={doctor.rating.average} />
                  <span className="text-sm text-slate-600">
                    {doctor.rating.total > 0 ? (
                      <>
                        <strong className="text-slate-800">{doctor.rating.average.toFixed(1)}</strong>{" "}
                        <span className="text-slate-400">
                          ({doctor.rating.total} review{doctor.rating.total !== 1 ? "s" : ""})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">No reviews yet</span>
                    )}
                  </span>
                </div>

                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 mt-6 pt-6 border-t border-slate-100 text-sm">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">NMC Number</dt>
                    <dd className="mt-1 font-semibold text-slate-800 tabular-nums">{doctor.nmcNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${doctor.isApproved ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                        {doctor.isApproved && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {doctor.isApproved ? "Verified" : "Pending"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Practices at</dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {doctor.hospitals.length} hospital{doctor.hospitals.length !== 1 ? "s" : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open slots</dt>
                    <dd className="mt-1 font-semibold text-slate-800 tabular-nums">{openSlotCount}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              {/* ── ABOUT ──────────────────────────── */}
              <DoctorAbout
                name={displayName}
                bio={doctor.bio ?? null}
                editable={isOwnProfile}
                onChange={(bio) => setDoctor((d) => (d ? { ...d, bio } : d))}
              />

              {/* ── AVAILABILITY (hospital / date / time filters) ── */}
              <DoctorAvailability
                slots={doctor.slots}
                hospitals={doctor.hospitals}
                onBook={openBooking}
              />

              {/* ── WEEKLY OPD ─────────────────────── */}
              <Section title="Weekly OPD Schedule">
                {weeklySchedule.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No recurring OPD schedule listed.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="pb-2 pr-4">Day</th>
                          <th className="pb-2 pr-4">Time</th>
                          <th className="pb-2">Hospital</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {weeklySchedule.map((row) => (
                          <tr key={row.id}>
                            <td className="py-2.5 pr-4 font-semibold text-slate-700 capitalize">{row.dayOfWeek}</td>
                            <td className="py-2.5 pr-4 text-slate-600 whitespace-nowrap">{row.startTime} – {row.endTime}</td>
                            <td className="py-2.5 text-slate-500">
                              {row.hospital ? (
                                <Link href={`/hospitals/${row.hospital.id}`} className="hover:text-primary transition-colors">
                                  {row.hospital.name}
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

              {/* ── REVIEWS ────────────────────────── */}
              <DoctorReviews
                doctorId={doctor.id}
                summary={doctor.rating}
                onSummaryChange={(summary) => setDoctor((d) => (d ? { ...d, rating: summary } : d))}
              />
            </div>

            <div className="space-y-6">
              {/* ── QUALIFICATIONS ─────────────────── */}
              <Section title="Qualifications">
                {doctor.degrees.length === 0 ? (
                  <p className="text-sm text-slate-500">No qualifications listed.</p>
                ) : (
                  <ul className="space-y-3">
                    {doctor.degrees.map((deg) => (
                      <li key={deg.id} className="flex gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{deg.degreeName}</p>
                          <p className="text-xs text-slate-500">
                            {deg.institution ?? "—"}
                            {deg.yearCompleted ? ` · ${deg.yearCompleted}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* ── HOSPITALS ──────────────────────── */}
              <Section title="Practices At">
                {doctor.hospitals.length === 0 ? (
                  <p className="text-sm text-slate-500">No hospital affiliations listed.</p>
                ) : (
                  <ul className="space-y-4">
                    {doctor.hospitals.map((h) => (
                      <li key={h.id}>
                        <Link
                          href={`/hospitals/${h.id}`}
                          className="block border border-slate-100 rounded-lg p-3 hover:border-primary/40 hover:bg-slate-50/60 transition-colors"
                        >
                          <p className="text-sm font-bold text-slate-800">{h.name}</p>
                          {h.address && <p className="text-xs text-slate-500 mt-0.5">{h.address}</p>}
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                            {h.phone && <span>{h.phone}</span>}
                            {h.hospitalType && (
                              <span className="capitalize text-slate-400">{h.hospitalType.replace(/_/g, " ")}</span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />

      {/* ── BOOKING MODAL ───────────────────────── */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Confirm Appointment</h3>
              <button
                onClick={() => setBookingSlot(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={confirmBooking} className="p-6 space-y-4">
              {bookingError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-700">
                <p><strong>Doctor:</strong> {displayName}</p>
                <p><strong>Hospital:</strong> {bookingSlot.hospital?.name}</p>
                <p>
                  <strong>Date &amp; Time:</strong> {bookingSlot.slotDate} ({bookingSlot.startTime?.slice(0, 5)} – {bookingSlot.endTime?.slice(0, 5)})
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Reason for Visit</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual physical checkup, headache, follow-up consultation"
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {myRecords.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Share Medical History
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 border border-slate-100 rounded-lg p-2">
                    {myRecords.map((record) => (
                      <label key={record.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRecordIds.includes(record.id)}
                          onChange={() =>
                            setSelectedRecordIds((prev) =>
                              prev.includes(record.id) ? prev.filter((r) => r !== record.id) : [...prev, record.id],
                            )
                          }
                        />
                        {record.title}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setBookingSlot(null)} disabled={isBooking}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isBooking}>
                  {isBooking ? <Spinner size="sm" className="text-white" /> : "Confirm Booking"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
