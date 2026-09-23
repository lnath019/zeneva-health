"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

/* ============================================================================
   STYLES — injected via dangerouslySetInnerHTML (no SSR/CSR entity mismatch)
   ============================================================================ */
const PAGE_CSS = `
  /* ── Keyframes ─────────────────────────────────────────── */
  @keyframes dd-fade-up {
    from { opacity: 0; transform: translate3d(0, 20px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes dd-fade-in {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes dd-orb {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(0, -22px, 0) scale(1.06); }
  }
  @keyframes dd-pulse-dot {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%      { opacity: 0.55; transform: scale(1.4); }
  }
  @keyframes dd-skeleton {
    0%, 100% { opacity: 1;   }
    50%      { opacity: 0.5; }
  }
  @keyframes dd-spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes dd-modal-in {
    from { opacity: 0; transform: translate3d(0, 18px, 0) scale(0.97); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes dd-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes dd-badge-pop {
    0%   { transform: scale(0.6); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); }
  }

  .dd-fade      { animation: dd-fade-in   0.55s ease-out both; }
  .dd-fade-up   { animation: dd-fade-up   0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .dd-modal     { animation: dd-modal-in    0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .dd-backdrop  { animation: dd-backdrop-in 0.2s  ease-out both; }
  .dd-badge     { animation: dd-badge-pop   0.5s  cubic-bezier(0.22, 1, 0.36, 1) both; }

  .dd-delay-1 { animation-delay: 80ms;  }
  .dd-delay-2 { animation-delay: 160ms; }
  .dd-delay-3 { animation-delay: 240ms; }
  .dd-delay-4 { animation-delay: 320ms; }
  .dd-delay-5 { animation-delay: 400ms; }
  .dd-delay-6 { animation-delay: 480ms; }

  .dd-orb        { animation: dd-orb 9s ease-in-out infinite; }
  .dd-dot        { animation: dd-pulse-dot 2s ease-in-out infinite; }
  .dd-skeleton   { animation: dd-skeleton 1.4s ease-in-out infinite; }
  .dd-spin-slow  { animation: dd-spin-slow 26s linear infinite; }

  /* ── Shell with cursor-reactive ambient glow ───────────── */
  .dd-shell {
    position: relative;
    isolation: isolate;
  }
  .dd-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      680px circle at var(--cx, 50%) var(--cy, 30%),
      rgba(56, 189, 248, 0.08),
      transparent 55%
    );
    transition: background 0.12s linear;
  }

  /* Dot grid texture */
  .dd-dot-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image: radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px);
    background-size: 22px 22px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  }

  /* ── Parallax orbs ─────────────────────────────────────── */
  .dd-orb-1 {
    transform: translate3d(
      calc((var(--cx-n, 0)) * 20px),
      calc((var(--cy-n, 0)) * 20px),
      0
    );
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .dd-orb-2 {
    transform: translate3d(
      calc((var(--cx-n, 0)) * -28px),
      calc((var(--cy-n, 0)) * -24px),
      0
    );
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ── Card hover lift (hero, sections, sidebar) ─────────── */
  .dd-card {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s ease,
                border-color 0.25s ease;
    will-change: transform;
  }
  .dd-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 46px -22px rgba(15, 23, 42, 0.18);
    border-color: rgba(56, 189, 248, 0.35);
  }

  /* Hero photo panel gets a slightly stronger lift */
  .dd-hero-card {
    transition: box-shadow 0.4s ease, border-color 0.3s ease;
  }
  .dd-hero-card:hover {
    border-color: rgba(56, 189, 248, 0.35);
    box-shadow: 0 28px 60px -24px rgba(15, 23, 42, 0.20);
  }

  /* ── Hospital card cursor spotlight ────────────────────── */
  .dd-hosp {
    position: relative;
    overflow: hidden;
  }
  .dd-hosp-spot {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.25s ease;
    background: radial-gradient(
      260px circle at var(--mx, 50%) var(--my, 50%),
      rgba(56, 189, 248, 0.14),
      transparent 65%
    );
  }
  .dd-hosp:hover .dd-hosp-spot { opacity: 1; }

  /* ── Sections below the fold: defer rendering work ─────── */
  .dd-cv {
    content-visibility: auto;
    contain-intrinsic-size: 0 420px;
  }

  /* ── Modal input focus ring ────────────────────────────── */
  .dd-input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .dd-input:focus {
    outline: none;
    border-color: rgb(249, 115, 22);
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
  }

  /* ── Reduced motion ────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .dd-fade, .dd-fade-up, .dd-modal, .dd-backdrop, .dd-badge,
    .dd-orb, .dd-dot, .dd-skeleton, .dd-spin-slow {
      animation: none !important;
    }
    .dd-shell::before { display: none; }
    .dd-orb-1, .dd-orb-2, .dd-card, .dd-hero-card, .dd-hosp-spot {
      transition: none !important;
      transform: none !important;
    }
  }
`;

/* ============================================================================
   HOOKS
   ============================================================================ */

function useCursorTrack<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const handleMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        el.style.setProperty("--cx", `${px * 100}%`);
        el.style.setProperty("--cy", `${py * 100}%`);
        el.style.setProperty("--cx-n", `${px - 0.5}`);
        el.style.setProperty("--cy-n", `${py - 0.5}`);
      });
    };

    const handleLeave = () => {
      el.style.setProperty("--cx", "50%");
      el.style.setProperty("--cy", "30%");
      el.style.setProperty("--cx-n", "0");
      el.style.setProperty("--cy-n", "0");
    };

    el.addEventListener("pointermove", handleMove, { passive: true });
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return ref;
}

/* ============================================================================
   SMALL PRESENTATIONAL COMPONENTS
   ============================================================================ */

/**
 * Section — reusable card wrapper with an optional action slot.
 * Kept as a top-level component so its identity is stable across renders.
 */
const Section = React.memo(function Section({
  title,
  children,
  action,
  className = "",
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`dd-card dd-fade-up bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
});

/**
 * Small visual chip for the hero stats row.
 */
const HeroStat = React.memo(function HeroStat({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "primary" | "emerald" | "amber" | "secondary";
}) {
  const toneMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    emerald: "text-emerald-700 bg-emerald-50",
    amber: "text-amber-700 bg-amber-50",
  } as const;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 transition-colors duration-200 hover:bg-white hover:border-slate-200">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneMap[tone]}`}>
        {label}
      </div>
      <div className="mt-1.5 text-sm font-extrabold text-slate-800 tabular-nums">{value}</div>
    </div>
  );
});

/**
 * Hospital row with cursor-tracking spotlight + hover lift.
 */
const HospitalRow = React.memo(function HospitalRow({
  hospital,
}: {
  hospital: DoctorDetail["hospitals"][number];
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  return (
    <Link
      ref={ref}
      href={`/hospitals/${hospital.id}`}
      onMouseMove={handleMove}
      className="dd-hosp block border border-slate-100 rounded-lg p-3 transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span className="dd-hosp-spot" aria-hidden="true" />
      <p className="relative text-sm font-bold text-slate-800">{hospital.name}</p>
      {hospital.address && (
        <p className="relative text-xs text-slate-500 mt-0.5">{hospital.address}</p>
      )}
      <div className="relative flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
        {hospital.phone && <span>{hospital.phone}</span>}
        {hospital.hospitalType && (
          <span className="capitalize text-slate-400">
            {hospital.hospitalType.replace(/_/g, " ")}
          </span>
        )}
      </div>
    </Link>
  );
});

/**
 * Loading skeleton — matches the final layout so there is zero layout shift.
 */
function DoctorDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="h-4 w-28 rounded-full bg-slate-200 dd-skeleton" />

          {/* Hero */}
          <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="w-40 h-40 rounded-2xl bg-slate-100 dd-skeleton shrink-0" />
              <div className="flex-1 min-w-0 space-y-4">
                <div className="h-7 w-2/3 rounded-full bg-slate-100 dd-skeleton" />
                <div className="h-4 w-1/3 rounded-full bg-slate-100 dd-skeleton" />
                <div className="h-4 w-1/4 rounded-full bg-slate-100 dd-skeleton" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
                  <div className="h-14 rounded-xl bg-slate-100 dd-skeleton" />
                  <div className="h-14 rounded-xl bg-slate-100 dd-skeleton" />
                  <div className="h-14 rounded-xl bg-slate-100 dd-skeleton" />
                  <div className="h-14 rounded-xl bg-slate-100 dd-skeleton" />
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 rounded-2xl bg-white border border-slate-200/70 dd-skeleton" />
              <div className="h-96 rounded-2xl bg-white border border-slate-200/70 dd-skeleton" />
            </div>
            <div className="space-y-6">
              <div className="h-52 rounded-2xl bg-white border border-slate-200/70 dd-skeleton" />
              <div className="h-64 rounded-2xl bg-white border border-slate-200/70 dd-skeleton" />
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

/* ============================================================================
   MAIN PAGE
   ============================================================================ */

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const doctorId = params.id;
  const router = useRouter();
  const { token, userId, role } = useAuth();
  const shellRef = useCursorTrack<HTMLDivElement>();

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* booking modal state — mirrors /book-doctor flow */
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState("");
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [myRecords, setMyRecords] = useState<MedicalHistoryRecord[]>([]);

  /* Fetch doctor */
  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await doctorApi.getById(doctorId);
      setDoctor(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load doctor");
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  /* Fetch medical history when logged in */
  useEffect(() => {
    if (!token) {
      setMyRecords([]);
      return;
    }
    let cancelled = false;
    medicalHistoryApi
      .getMy()
      .then((records) => {
        if (!cancelled) setMyRecords(records);
      })
      .catch(() => {
        if (!cancelled) setMyRecords([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  /* Escape to close modal + body scroll lock */
  useEffect(() => {
    if (!bookingSlot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBookingSlot(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [bookingSlot]);

  const isOwnProfile = role === "doctor" && !!userId && userId === doctor?.user?.id;

  /* Open slots a patient could book right now */
  const openSlotCount = useMemo(
    () =>
      (doctor?.slots ?? []).filter(
        (s) => (s.bookedTokens ?? 0) < (s.maxTokens ?? 0)
      ).length,
    [doctor]
  );

  /* Weekly schedule, sorted by day then start time */
  const weeklySchedule = useMemo(
    () =>
      [...(doctor?.opdSchedule ?? [])].sort(
        (a, b) =>
          DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) ||
          a.startTime.localeCompare(b.startTime)
      ),
    [doctor]
  );

  /* Booking flow */
  const openBooking = useCallback(
    (slot: Slot) => {
      if (!token) {
        router.push(
          `/login?redirect=${encodeURIComponent(`/doctors/${doctorId}`)}`
        );
        return;
      }
      setBookingSlot(slot);
      setReason("");
      setSelectedRecordIds([]);
      setBookingError(null);
    },
    [token, router, doctorId]
  );

  const closeBooking = useCallback(() => {
    setBookingSlot(null);
  }, []);

  const toggleRecord = useCallback((id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }, []);

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
      setBookingError(
        err instanceof Error ? err.message : "Failed to book appointment"
      );
    } finally {
      setIsBooking(false);
    }
  };

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return <DoctorDetailSkeleton />;
  }

  /* ── Error / not found ─────────────────────────────────── */
  if (loadError || !doctor) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <MarketingHeader />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20 text-center">
          <div className="dd-fade-up bg-white rounded-2xl border border-slate-200/70 shadow-sm p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </span>
            <h1 className="mt-4 text-2xl font-bold text-slate-800">
              Doctor not found
            </h1>
            <p className="mt-2 text-slate-500">
              {loadError ?? "This profile may have been removed."}
            </p>
            <Link href="/book-doctor" className="inline-block mt-6">
              <Button>Back to all doctors</Button>
            </Link>
          </div>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  const displayName = `Dr. ${(doctor.user?.fullName ?? "").replace(/^Dr\.?\s*/i, "")}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <MarketingHeader />

      <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

        <div
          ref={shellRef}
          className="dd-shell relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"
        >
          {/* Dot grid + parallax orbs */}
          <div aria-hidden="true" className="dd-dot-grid" />
          <div
            aria-hidden="true"
            className="dd-orb dd-orb-1 pointer-events-none absolute -top-10 -right-16 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dd-orb dd-orb-2 pointer-events-none absolute top-[520px] -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            style={{ animationDelay: "1.6s" }}
          />

          {/* ── Back link ─────────────────────────────────── */}
          <Link
            href="/book-doctor"
            className="dd-fade relative inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            All doctors
          </Link>

          {/* ── HERO: photo + identity ───────────────────── */}
          <section className="dd-hero-card dd-fade-up dd-delay-1 relative bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8 overflow-hidden">
            {/* Soft gradient accent */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-secondary/5 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="shrink-0">
                <DoctorPhoto
                  name={doctor.user?.fullName ?? "Doctor"}
                  imageUrl={doctor.imageUrl ?? null}
                  editable={isOwnProfile}
                  onChange={(url) =>
                    setDoctor((d) => (d ? { ...d, imageUrl: url } : d))
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="dd-fade-up dd-delay-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {displayName}
                  </h1>
                  <p className="text-primary font-semibold mt-1">
                    {doctor.specialisation?.name ?? "General Practitioner"}
                  </p>
                </div>

                {/* Rating */}
                <div className="dd-fade-up dd-delay-3 flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                  <StarRating value={doctor.rating.average} />
                  <span className="text-sm text-slate-600">
                    {doctor.rating.total > 0 ? (
                      <>
                        <strong className="text-slate-800">
                          {doctor.rating.average.toFixed(1)}
                        </strong>{" "}
                        <span className="text-slate-400">
                          ({doctor.rating.total} review
                          {doctor.rating.total !== 1 ? "s" : ""})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">No reviews yet</span>
                    )}
                  </span>

                  {doctor.isApproved && (
                    <span className="dd-badge inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified doctor
                    </span>
                  )}
                </div>

                {/* Stat grid */}
                <div className="dd-fade-up dd-delay-4 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                  <HeroStat label="NMC Number" value={doctor.nmcNumber} tone="primary" />
                  <HeroStat
                    label="Status"
                    value={doctor.isApproved ? "Verified" : "Pending"}
                    tone={doctor.isApproved ? "emerald" : "amber"}
                  />
                  <HeroStat
                    label="Practices at"
                    value={`${doctor.hospitals.length} hospital${
                      doctor.hospitals.length !== 1 ? "s" : ""
                    }`}
                    tone="secondary"
                  />
                  <HeroStat
                    label="Open slots"
                    value={openSlotCount}
                    tone={openSlotCount > 0 ? "emerald" : "amber"}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              {/* ── ABOUT ──────────────────────────── */}
              <div className="dd-fade-up dd-delay-2 dd-cv">
                <DoctorAbout
                  name={displayName}
                  bio={doctor.bio ?? null}
                  editable={isOwnProfile}
                  onChange={(bio) =>
                    setDoctor((d) => (d ? { ...d, bio } : d))
                  }
                />
              </div>

              {/* ── AVAILABILITY ───────────────────── */}
              <div className="dd-fade-up dd-delay-3 dd-cv">
                <DoctorAvailability
                  slots={doctor.slots}
                  hospitals={doctor.hospitals}
                  onBook={openBooking}
                />
              </div>

              {/* ── WEEKLY OPD ─────────────────────── */}
              <div className="dd-cv">
                <Section title="Weekly OPD Schedule" delay={120}>
                  {weeklySchedule.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">
                      No recurring OPD schedule listed.
                    </p>
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
                          {weeklySchedule.map((row, i) => (
                            <tr
                              key={row.id}
                              className="dd-fade-up transition-colors hover:bg-slate-50/60"
                              style={{ animationDelay: `${i * 40}ms` }}
                            >
                              <td className="py-2.5 pr-4 font-semibold text-slate-700 capitalize">
                                {row.dayOfWeek}
                              </td>
                              <td className="py-2.5 pr-4 text-slate-600 whitespace-nowrap">
                                {row.startTime} – {row.endTime}
                              </td>
                              <td className="py-2.5 text-slate-500">
                                {row.hospital ? (
                                  <Link
                                    href={`/hospitals/${row.hospital.id}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {row.hospital.name}
                                  </Link>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              </div>

              {/* ── REVIEWS ────────────────────────── */}
              <div className="dd-fade-up dd-delay-4 dd-cv">
                <DoctorReviews
                  doctorId={doctor.id}
                  summary={doctor.rating}
                  onSummaryChange={(summary) =>
                    setDoctor((d) => (d ? { ...d, rating: summary } : d))
                  }
                />
              </div>
            </div>

            {/* ── SIDEBAR ──────────────────────────── */}
            <div className="space-y-6">
              {/* Qualifications */}
              <div className="dd-cv">
                <Section title="Qualifications" delay={0}>
                  {doctor.degrees.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No qualifications listed.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {doctor.degrees.map((deg, i) => (
                        <li
                          key={deg.id}
                          className="dd-fade-up flex gap-3 rounded-lg p-2 -m-2 transition-colors hover:bg-slate-50/70"
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                              {deg.degreeName}
                            </p>
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
              </div>

              {/* Hospitals */}
              <div className="dd-cv">
                <Section title="Practices At" delay={80}>
                  {doctor.hospitals.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No hospital affiliations listed.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {doctor.hospitals.map((h, i) => (
                        <li
                          key={h.id}
                          className="dd-fade-up"
                          style={{ animationDelay: `${i * 70}ms` }}
                        >
                          <HospitalRow hospital={h} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />

      {/* ── BOOKING MODAL ───────────────────────── */}
      {bookingSlot && (
        <div
          className="dd-backdrop fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeBooking}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dd-modal-title"
        >
          <div
            className="dd-modal bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <h3
                id="dd-modal-title"
                className="text-lg font-bold text-slate-800"
              >
                Confirm Appointment
              </h3>
              <button
                type="button"
                onClick={closeBooking}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={confirmBooking} className="p-6 space-y-4">
              {bookingError && (
                <div className="dd-fade bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              {/* Slot summary */}
              <div className="relative bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700 overflow-hidden">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
                <p className="relative">
                  <strong className="text-slate-800">Doctor:</strong> {displayName}
                </p>
                <p className="relative">
                  <strong className="text-slate-800">Hospital:</strong>{" "}
                  {bookingSlot.hospital?.name}
                </p>
                <p className="relative">
                  <strong className="text-slate-800">Date &amp; Time:</strong>{" "}
                  {bookingSlot.slotDate} ({bookingSlot.startTime?.slice(0, 5)} –{" "}
                  {bookingSlot.endTime?.slice(0, 5)})
                </p>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label
                  htmlFor="dd-reason"
                  className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Reason for Visit
                </label>
                <textarea
                  id="dd-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual physical checkup, headache, follow-up consultation"
                  required
                  rows={3}
                  className="dd-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
                />
              </div>

              {/* Medical history sharing */}
              {myRecords.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Share Medical History
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 border border-slate-100 rounded-lg p-2">
                    {myRecords.map((record) => (
                      <label
                        key={record.id}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer rounded-md p-1.5 transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRecordIds.includes(record.id)}
                          onChange={() => toggleRecord(record.id)}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        {record.title}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeBooking}
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isBooking}>
                  {isBooking ? (
                    <Spinner size="sm" className="text-white" />
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}