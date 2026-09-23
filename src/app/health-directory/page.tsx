"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HospitalList } from "@/components/dashboard/HospitalList";
import { AmbulanceList } from "@/components/dashboard/AmbulanceList";
import { cn } from "@/lib/utils";

type Tab = "hospitals" | "ambulances";

/* ─────────────────────────────────────────────────────────────
   Module-level CSS. Injected via dangerouslySetInnerHTML so
   SSR and CSR output match byte-for-byte.
   ───────────────────────────────────────────────────────────── */
const DIRECTORY_CSS = `
  @keyframes hd-fade-up {
    from { opacity: 0; transform: translate3d(0, 22px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes hd-fade-in {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes hd-pulse-dot {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%      { opacity: 0.55; transform: scale(1.4); }
  }
  @keyframes hd-skeleton {
    0%, 100% { opacity: 1;   }
    50%      { opacity: 0.5; }
  }
  @keyframes hd-orb {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(0, -22px, 0) scale(1.06); }
  }
  @keyframes hd-ripple {
    from { transform: scale(0); opacity: 0.45; }
    to   { transform: scale(2.6); opacity: 0; }
  }
  @keyframes hd-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }

  .hd-fade        { animation: hd-fade-in  0.5s ease-out both; }
  .hd-fade-up     { animation: hd-fade-up  0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .hd-delay-1     { animation-delay: 90ms;  }
  .hd-delay-2     { animation-delay: 180ms; }
  .hd-dot         { animation: hd-pulse-dot 2s ease-in-out infinite; }
  .hd-skeleton    { animation: hd-skeleton 1.4s ease-in-out infinite; }
  .hd-orb         { animation: hd-orb 9s ease-in-out infinite; }

  /* ── Page shell: cursor-reactive ambient glow + parallax orbs ── */
  .hd-shell {
    position: relative;
    isolation: isolate;
  }
  .hd-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      620px circle at var(--cx, 50%) var(--cy, 30%),
      rgba(56, 189, 248, 0.10),
      transparent 55%
    );
    transition: background 0.12s linear;
  }
  .hd-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      340px circle at var(--cx, 50%) var(--cy, 30%),
      rgba(249, 115, 22, 0.08),
      transparent 60%
    );
    transition: background 0.16s linear;
  }

  /* Parallax orbs — move by cursor position via CSS vars */
  .hd-orb-1 {
    transform: translate3d(calc((var(--cx-n, 0)) * 22px), calc((var(--cy-n, 0)) * 22px), 0);
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .hd-orb-2 {
    transform: translate3d(calc((var(--cx-n, 0)) * -34px), calc((var(--cy-n, 0)) * -28px), 0);
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Magnetic tab buttons */
  .hd-tab-btn {
    position: relative;
    transition: color 0.2s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .hd-tab-btn:hover {
    color: rgb(71, 85, 105);
    transform: translateY(-1px);
  }
  .hd-tab-btn > .hd-tab-inner {
    transform: translate3d(
      calc(var(--tx, 0) * 1px),
      calc(var(--ty, 0) * 1px),
      0
    );
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Ripple */
  .hd-ripple {
    position: absolute;
    border-radius: 9999px;
    pointer-events: none;
    background: currentColor;
    animation: hd-ripple 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    mix-blend-mode: multiply;
  }

  /* Shimmering eyebrow badge */
  .hd-shimmer-text {
    background-image: linear-gradient(
      90deg,
      currentColor 0%,
      currentColor 40%,
      rgba(255, 255, 255, 0.95) 50%,
      currentColor 60%,
      currentColor 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: hd-shimmer 3.4s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .hd-fade, .hd-fade-up, .hd-dot, .hd-skeleton, .hd-orb,
    .hd-ripple, .hd-shimmer-text { animation: none !important; }
    .hd-shell::before, .hd-shell::after { display: none; }
    .hd-orb-1, .hd-orb-2, .hd-tab-btn, .hd-tab-btn > .hd-tab-inner {
      transition: none !important;
      transform: none !important;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Cursor tracking hook — sets CSS custom properties on a ref'd
   element so pure CSS can react. Uses requestAnimationFrame so
   rapid pointer moves coalesce into a single paint per frame.
   ───────────────────────────────────────────────────────────── */
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
        const px = (e.clientX - rect.left) / rect.width;   // 0..1
        const py = (e.clientY - rect.top) / rect.height;   // 0..1
        el.style.setProperty("--cx", `${px * 100}%`);
        el.style.setProperty("--cy", `${py * 100}%`);
        // centred values (-0.5..0.5) for parallax math
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

/* ─────────────────────────────────────────────────────────────
   Count-up animation for stat values. Uses IntersectionObserver
   so it fires only when the stat is actually on screen.
   ───────────────────────────────────────────────────────────── */
function useCountUp(target: string, duration = 1200) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = target.match(/^(\d+)(.*)$/);
    if (!match) {
      setDisplay(target);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(target);
      return;
    }

    const end = Number(match[1]);
    const suffix = match[2];

    let raf = 0;
    let started = false;

    const run = () => {
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(`${Math.round(end * eased)}${suffix}`);
        if (progress < 1) raf = requestAnimationFrame(tick);
        else setDisplay(target);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, display };
}

/* ─────────────────────────────────────────────────────────────
   Tabs + content
   ───────────────────────────────────────────────────────────── */

function DirectoryTabs() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("hospital");
  const [tab, setTab] = useState<Tab>("hospitals");

  return (
    <>
      {/* ── Tab switcher with sliding underline ─────────────── */}
      <div className="hd-fade-up hd-delay-1 relative flex gap-1 mb-6 border-b border-slate-200">
        <TabButton
          active={tab === "hospitals"}
          onClick={() => setTab("hospitals")}
        >
          <BuildingIcon className="h-4 w-4" />
          Hospitals
        </TabButton>
        <TabButton
          active={tab === "ambulances"}
          onClick={() => setTab("ambulances")}
        >
          <AmbulanceIcon className="h-4 w-4" />
          Ambulances
        </TabButton>

        {/* Sliding underline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-px h-[2px] bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            left: tab === "hospitals" ? "0px" : "50%",
            width: "50%",
          }}
        />
      </div>

      <div key={tab} className="hd-fade">
        {tab === "hospitals" && <HospitalList highlightId={highlightId} />}
        {tab === "ambulances" && <AmbulanceList />}
      </div>

      <AmbulanceInfo className={tab === "ambulances" ? "" : "hidden"} />
    </>
  );
}

/* Magnetic + ripple-enabled tab button */
const TabButton = React.memo(function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>(
    []
  );

  const handleMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Magnetic strength: shift up to ~4 px toward cursor
    el.style.setProperty("--tx", `${x * 0.08}`);
    el.style.setProperty("--ty", `${y * 0.08}`);
  }, []);

  const handleLeave = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    el.style.setProperty("--tx", "0");
    el.style.setProperty("--ty", "0");
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = btnRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((r) => [...r, { x, y, id }]);
        setTimeout(
          () => setRipples((r) => r.filter((it) => it.id !== id)),
          700
        );
      }
      onClick();
    },
    [onClick]
  );

  return (
    <button
      ref={btnRef}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "hd-tab-btn relative overflow-hidden flex items-center px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-lg",
        active ? "text-primary" : "text-slate-500"
      )}
    >
      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="hd-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
          }}
        />
      ))}

      <span className="hd-tab-inner">{children}</span>
    </button>
  );
});

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function AmbulanceIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Static SEO copy
   ───────────────────────────────────────────────────────────── */

function AmbulanceInfo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6",
        className
      )}
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Emergency Ambulance Services in Nepal
        </h2>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Zeniva Health Care maintains a directory of verified emergency ambulance services
          across Nepal, spanning national dispatch lines, Red Cross chapters,
          hospital-attached fleets, and local government and community services. In a
          medical emergency, every minute matters — this directory is designed to help you
          find and call the nearest available ambulance service as quickly as possible,
          without searching through outdated contact lists.
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">When to Call an Ambulance</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Call an ambulance immediately for chest pain or suspected heart attack, difficulty
          breathing, severe bleeding, loss of consciousness, major trauma from an accident,
          stroke symptoms (sudden numbness, slurred speech, or facial drooping), severe
          allergic reactions, or any condition where moving the patient without trained
          medical support could make things worse. When you call, be ready to share the
          patient&apos;s location, condition, and a contact number.
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">
          Types of Ambulance Services Available
        </h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-600 leading-relaxed list-disc pl-5">
          <li>
            <span className="font-semibold text-slate-700">
              Basic Life Support (BLS):
            </span>{" "}
            Standard transport with first-aid equipment, oxygen, and trained attendants —
            suitable for stable patients who need transfer to a hospital or clinic.
          </li>
          <li>
            <span className="font-semibold text-slate-700">
              Advanced Life Support (ALS):
            </span>{" "}
            Equipped with cardiac monitors, ventilators, and paramedics trained for critical,
            life-threatening conditions requiring active treatment en route.
          </li>
          <li>
            <span className="font-semibold text-slate-700">Neonatal Transport:</span>{" "}
            Specialised units with incubators and equipment for safely transporting newborns
            and premature infants requiring intensive care.
          </li>
          <li>
            <span className="font-semibold text-slate-700">Patient Transport:</span>{" "}
            Non-emergency transport for scheduled appointments, discharges, or transfers
            between facilities.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">
          National Emergency Ambulance Numbers
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          A few numbers are worth remembering wherever you are in Nepal:{" "}
          <span className="font-semibold text-slate-700">102</span> for the National
          Ambulance Emergency Line (available nationwide, 24/7),{" "}
          <span className="font-semibold text-slate-700">1130</span> for the Nepal Red Cross
          Society&apos;s ambulance and disaster relief coordination, and{" "}
          <span className="font-semibold text-slate-700">1115</span> for the general Health
          Emergency Hotline. Local hospital, municipal, and private ambulance numbers for
          your district are listed above and update as new services are added.
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-800">How to Use This Directory</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Every listing shows the service type, coverage area, and a direct phone number.
          Ambulance coverage is organised by province, district, and municipality so you can
          quickly find the service closest to your location, whether you&apos;re in Kathmandu
          Valley or a rural district. Providers, hospitals, and municipal offices can
          register or update their ambulance listings by reaching out through the Zeniva
          dashboard.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */

export default function HealthDirectoryPage() {
  const shellRef = useCursorTrack<HTMLDivElement>();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-white">
        <style dangerouslySetInnerHTML={{ __html: DIRECTORY_CSS }} />

        <div
          ref={shellRef}
          className="hd-shell relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
        >
          {/* Parallax floating orbs (move with cursor) */}
          <div
            aria-hidden="true"
            className="hd-orb hd-orb-1 pointer-events-none absolute -top-10 -right-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="hd-orb hd-orb-2 pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
            style={{ animationDelay: "1.6s" }}
          />

          {/* ── Hero ──────────────────────────────────────────── */}
          <header className="hd-fade-up relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-sm p-6 sm:p-8 mb-8 shadow-sm">
            <div className="relative">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="hd-dot absolute inline-flex h-full w-full rounded-full bg-secondary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                <span className="hd-shimmer-text">Health Directory</span>
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Hospitals &amp; Emergency Ambulances
              </h1>
              <p className="mt-3 text-slate-500 max-w-2xl leading-relaxed">
                Browse our network of hospitals and clinics, or find an ambulance service
                near you. All listings are reviewed before they go live.
              </p>

              <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip label="Verified hospitals" value="50+" />
                <StatChip label="Districts covered" value="77" />
                <StatChip label="Emergency lines" value="24/7" />
                <StatChip label="Ambulance services" value="100+" />
              </dl>
            </div>
          </header>

          {/* ── Tabs + content ────────────────────────────────── */}
          <Suspense fallback={<DirectoryTabsFallback />}>
            <DirectoryTabs />
          </Suspense>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  const { ref, display } = useCountUp(value, 1300);
  return (
    <div className="group rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-md hover:shadow-primary/5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400 group-hover:text-primary/70 transition-colors">
        {label}
      </dt>
      <dd className="mt-0.5 text-lg font-extrabold text-slate-800 tabular-nums">
        <span ref={ref}>{display}</span>
      </dd>
    </div>
  );
}

function DirectoryTabsFallback() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 rounded-lg bg-slate-100 hd-skeleton" />
      <div className="h-12 w-full rounded-xl bg-slate-100 hd-skeleton" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white overflow-hidden"
          >
            <div className="h-48 bg-slate-100 hd-skeleton" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-2/3 rounded-full bg-slate-100 hd-skeleton" />
              <div className="h-3 w-1/2 rounded-full bg-slate-100 hd-skeleton" />
              <div className="h-3 w-3/4 rounded-full bg-slate-100 hd-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}