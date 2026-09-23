"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { ambulanceApi, locationApi } from "@/lib/api";
import { Spinner } from "../ui/Spinner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Ambulance, District, Municipality, Province } from "@/types";
import { cn } from "@/lib/utils";

const SELECT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50";

/* ─────────────────────────────────────────────────────────────
   Module-level CSS — cursor-tilt, spotlight, magnetic icons,
   ripple, staggered entry. All GPU-friendly.
   ───────────────────────────────────────────────────────────── */
const AMBULANCE_CSS = `
  @keyframes amx-fade-up {
    from { opacity: 0; transform: translate3d(0, 22px, 0) scale(0.99); }
    to   { opacity: 1; transform: translate3d(0, 0, 0)    scale(1); }
  }
  @keyframes amx-fade-in {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes amx-ping {
    0%   { transform: scale(1);   opacity: 0.65; }
    100% { transform: scale(2.4); opacity: 0;    }
  }
  @keyframes amx-skeleton {
    0%, 100% { opacity: 1;   }
    50%      { opacity: 0.5; }
  }
  @keyframes amx-modal-in {
    from { opacity: 0; transform: translate3d(0, 20px, 0) scale(0.97); }
    to   { opacity: 1; transform: translate3d(0, 0, 0)    scale(1); }
  }
  @keyframes amx-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes amx-ripple {
    from { transform: scale(0);   opacity: 0.35; }
    to   { transform: scale(2.8); opacity: 0;    }
  }
  @keyframes amx-icon-pop {
    0%   { transform: scale(1)    rotate(0deg); }
    50%  { transform: scale(1.18) rotate(-6deg); }
    100% { transform: scale(1)    rotate(0deg); }
  }

  .amx-fade    { animation: amx-fade-in  0.5s ease-out both; }
  .amx-fade-up { animation: amx-fade-up  0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .amx-delay-1 { animation-delay: 80ms;  }
  .amx-delay-2 { animation-delay: 160ms; }
  .amx-delay-3 { animation-delay: 240ms; }

  .amx-cell {
    animation: amx-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i, 0) * 55ms);
  }
  .amx-skeleton { animation: amx-skeleton 1.4s ease-in-out infinite; }
  .amx-ping     { animation: amx-ping     1.8s ease-out    infinite; }
  .amx-modal    { animation: amx-modal-in    0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .amx-backdrop { animation: amx-backdrop-in 0.2s  ease-out both; }
  .amx-ripple   {
    position: absolute;
    border-radius: 9999px;
    pointer-events: none;
    background: currentColor;
    animation: amx-ripple 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  /* ── 3D tilt card ───────────────────────────────────────── */
  .amx-card {
    position: relative;
    transform-style: preserve-3d;
    transform: perspective(900px)
               rotateX(var(--rx, 0deg))
               rotateY(var(--ry, 0deg))
               translate3d(0, var(--lift, 0px), 0);
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s ease,
                border-color 0.25s ease;
    will-change: transform;
    overflow: hidden;
  }
  .amx-card:hover {
    --lift: -4px;
    box-shadow: 0 24px 48px -22px rgba(15, 23, 42, 0.22);
    border-color: rgba(56, 189, 248, 0.35);
  }

  /* Cursor-tracking spotlight */
  .amx-spotlight {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.25s ease;
    background: radial-gradient(
      300px circle at var(--mx, 50%) var(--my, 50%),
      rgba(56, 189, 248, 0.16),
      transparent 65%
    );
  }
  .amx-card:hover .amx-spotlight { opacity: 1; }

  /* Type-coloured accent bar (sweeps in on hover) */
  .amx-accent-bar {
    position: absolute;
    left: 0; bottom: 0;
    height: 3px; width: 100%;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }
  .amx-card:hover .amx-accent-bar { transform: scaleX(1); }

  /* Icon buttons — magnetic + pop */
  .amx-icon-btn {
    position: relative;
    transform: translate3d(
      calc(var(--tx, 0) * 1px),
      calc(var(--ty, 0) * 1px),
      0
    );
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.2s ease, background-color 0.2s ease;
    will-change: transform;
  }
  .amx-icon-btn:hover svg {
    animation: amx-icon-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .amx-fade, .amx-fade-up, .amx-cell, .amx-skeleton,
    .amx-ping, .amx-modal, .amx-backdrop, .amx-ripple {
      animation: none !important;
    }
    .amx-card, .amx-spotlight, .amx-accent-bar, .amx-icon-btn { transition: none !important; }
    .amx-card { transform: none !important; }
    .amx-card:hover .amx-spotlight { opacity: 0 !important; }
    .amx-card:hover .amx-accent-bar { transform: none !important; }
    .amx-icon-btn { transform: none !important; }
    .amx-icon-btn:hover svg { animation: none !important; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

function locationLabel(ambulance: Ambulance): string {
  const m = ambulance.municipality;
  if (!m) return ambulance.address || "—";
  const parts = [m.name, m.district?.name, m.district?.province?.name].filter(
    Boolean
  );
  return parts.join(", ");
}

const typeConfig: Record<
  string,
  { label: string; className: string; dot: string; accent: string }
> = {
  basic: {
    label: "Basic Life Support",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    accent: "bg-blue-500",
  },
  advanced: {
    label: "Advanced Life Support",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    accent: "bg-purple-500",
  },
  neonatal: {
    label: "Neonatal",
    className: "bg-pink-50 text-pink-700 border-pink-200",
    dot: "bg-pink-500",
    accent: "bg-pink-500",
  },
  patient_transport: {
    label: "Patient Transport",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    accent: "bg-amber-500",
  },
};

function getTypeConfig(type: string) {
  const key = type?.toLowerCase().replace(/\s+/g, "_");
  return (
    typeConfig[key] ?? {
      label: type ?? "Unknown",
      className: "bg-slate-100 text-slate-600 border-slate-200 capitalize",
      dot: "bg-slate-400",
      accent: "bg-slate-400",
    }
  );
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  provinceId: "",
  districtId: "",
  municipalityId: "",
  address: "",
  type: "",
  notes: "",
};

/* ─────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────── */

export function AmbulanceList() {
  const { role } = useAuth();
  const {
    data: ambulances,
    isLoading,
    error,
    execute: fetchAmbulances,
    setData: setAmbulances,
  } = useApi(ambulanceApi.getAll);
  const { data: locationTree, execute: fetchTree } = useApi(locationApi.getTree);

  const { isLoading: isSaving, execute: createAmbulance } = useApi(ambulanceApi.create);
  const { execute: updateAmbulance } = useApi(ambulanceApi.update);
  const { execute: removeAmbulance } = useApi(ambulanceApi.remove);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  const districts = useMemo<District[]>(() => {
    if (!locationTree || !form.provinceId) return [];
    return (
      locationTree.find((p: Province) => p.id === form.provinceId)?.districts ?? []
    );
  }, [locationTree, form.provinceId]);

  const municipalities = useMemo<Municipality[]>(() => {
    if (!form.districtId) return [];
    return (
      districts.find((d: District) => d.id === form.districtId)?.municipalities ?? []
    );
  }, [districts, form.districtId]);

  const openCreateModal = useCallback(() => {
    fetchTree();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  }, [fetchTree]);

  const openEditModal = useCallback(
    (ambulance: Ambulance) => {
      fetchTree();
      setEditingId(ambulance.id);
      setForm({
        name: ambulance.name,
        phone: ambulance.phone,
        provinceId: ambulance.municipality?.district?.province?.id ?? "",
        districtId: ambulance.municipality?.district?.id ?? "",
        municipalityId: ambulance.municipalityId ?? "",
        address: ambulance.address ?? "",
        type: ambulance.type,
        notes: ambulance.notes ?? "",
      });
      setFormError(null);
      setIsModalOpen(true);
    },
    [fetchTree]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormError(null);
  }, []);

  const handleProvinceChange = useCallback((id: string) => {
    setForm((f) => ({ ...f, provinceId: id, districtId: "", municipalityId: "" }));
  }, []);

  const handleDistrictChange = useCallback((id: string) => {
    setForm((f) => ({ ...f, districtId: id, municipalityId: "" }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.phone.trim() || !form.type.trim()) {
      setFormError("Name, phone and type are all required.");
      return;
    }
    if (!form.provinceId || !form.districtId || !form.municipalityId) {
      setFormError("Please select a province, district, and municipality.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      provinceId: form.provinceId,
      districtId: form.districtId,
      municipalityId: form.municipalityId,
      address: form.address.trim() || undefined,
      type: form.type.trim(),
      notes: form.notes.trim() || undefined,
    };

    try {
      if (editingId) {
        const result = await updateAmbulance(editingId, payload);
        setAmbulances(
          (ambulances ?? []).map((a) => (a.id === editingId ? result.ambulance : a))
        );
      } else {
        const result = await createAmbulance(payload);
        setAmbulances([...(ambulances ?? []), result.ambulance]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save ambulance");
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this ambulance? This cannot be undone.")) return;
      setDeletingId(id);
      try {
        await removeAmbulance(id);
        setAmbulances((ambulances ?? []).filter((a) => a.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete ambulance");
      } finally {
        setDeletingId(null);
      }
    },
    [ambulances, removeAmbulance, setAmbulances]
  );

  const hasData = !isLoading && !error && ambulances && ambulances.length > 0;

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: AMBULANCE_CSS }} />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="amx-fade-up relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative">
          <h2 className="text-xl font-bold text-slate-800">Emergency Ambulances</h2>
          <p className="text-slate-500 text-xs mt-1">
            All available ambulances across districts.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          {role === "admin" && (
            <Button onClick={openCreateModal} size="sm">
              Add Ambulance
            </Button>
          )}

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="amx-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>
      </div>

      {/* ── Loading ────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-2/3 rounded-full bg-slate-100 amx-skeleton" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-100 amx-skeleton" />
                </div>
                <div className="h-6 w-32 rounded-full bg-slate-100 amx-skeleton" />
              </div>
              <div className="mt-5 pt-4 border-t border-slate-50 space-y-3">
                <div className="h-3 w-2/5 rounded-full bg-slate-100 amx-skeleton" />
                <div className="h-3 w-3/5 rounded-full bg-slate-100 amx-skeleton" />
                <div className="h-3 w-1/3 rounded-full bg-slate-100 amx-skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────── */}
      {!isLoading && error && (
        <div className="amx-fade bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-sm font-medium">
          Error loading ambulances: {error}
        </div>
      )}

      {/* ── Empty ──────────────────────────────────────────── */}
      {!isLoading && !error && (!ambulances || ambulances.length === 0) && (
        <div className="amx-fade bg-white border border-slate-100 rounded-2xl p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
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
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </span>
          <p className="mt-4 text-sm font-medium text-slate-500">
            No ambulance data available.
          </p>
        </div>
      )}

      {/* ── Grid ───────────────────────────────────────────── */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ambulances!.map((ambulance: Ambulance, index: number) => (
            <AmbulanceCard
              key={ambulance.id}
              ambulance={ambulance}
              index={index}
              isAdmin={role === "admin"}
              isDeleting={deletingId === ambulance.id}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="amx-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="amx-modal bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Ambulance" : "Add New Ambulance"}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {editingId
                    ? "Update this ambulance's details."
                    : "Register a new ambulance service."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ambulance Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Nepal Red Cross Ambulance"
                disabled={isSaving}
                required
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. 102"
                disabled={isSaving}
                required
              />

              <div>
                <FieldLabel>Province</FieldLabel>
                <select
                  value={form.provinceId}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isSaving || !locationTree}
                  required
                >
                  <option value="">
                    {!locationTree ? "Loading provinces…" : "Select Province"}
                  </option>
                  {locationTree?.map((p: Province) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>District</FieldLabel>
                <select
                  value={form.districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isSaving || !form.provinceId}
                  required
                >
                  <option value="">
                    {!form.provinceId ? "Select a province first" : "Select District"}
                  </option>
                  {districts.map((d: District) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Municipality / Local Body</FieldLabel>
                <select
                  value={form.municipalityId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, municipalityId: e.target.value }))
                  }
                  className={SELECT_CLS}
                  disabled={isSaving || !form.districtId}
                  required
                >
                  <option value="">
                    {!form.districtId
                      ? "Select a district first"
                      : "Select Municipality"}
                  </option>
                  {municipalities.map((m: Municipality) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Street / Base Address (optional)"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. Sinamangal, Baneshwor"
                disabled={isSaving}
              />
              <Input
                label="Type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                placeholder="e.g. government, private, red_cross"
                disabled={isSaving}
                required
              />
              <Input
                label="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. 24/7, free for emergencies"
                disabled={isSaving}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingId ? "Save Changes" : "Add Ambulance"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AmbulanceCard — 3D tilt, spotlight, magnetic icons, ripple
   ───────────────────────────────────────────────────────────── */

const AmbulanceCard = React.memo(function AmbulanceCard({
  ambulance,
  index,
  isAdmin,
  isDeleting,
  onEdit,
  onDelete,
}: {
  ambulance: Ambulance;
  index: number;
  isAdmin: boolean;
  isDeleting: boolean;
  onEdit: (a: Ambulance) => void;
  onDelete: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const badge = getTypeConfig(ambulance.type);
  const location = locationLabel(ambulance);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>(
    []
  );

  /* 3D tilt + spotlight + accent bar all driven by CSS vars */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Max ±5° rotation
    el.style.setProperty("--rx", `${(y * -5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);

    // Spotlight follows cursor
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  /* Ripple on card click (uses text colour for ripples) */
  const handleCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((it) => it.id !== id)), 700);
  }, []);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(ambulance);
    },
    [ambulance, onEdit]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(ambulance.id);
    },
    [ambulance.id, onDelete]
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className="amx-card amx-cell group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm cursor-pointer"
      style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
    >
      {/* Cursor-tracking spotlight */}
      <div className="amx-spotlight" aria-hidden="true" />

      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className={cn("amx-ripple", badge.accent.replace("bg-", "text-"))}
          style={{
            left: r.x,
            top: r.y,
            width: 28,
            height: 28,
            marginLeft: -14,
            marginTop: -14,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Bottom accent bar */}
      <span className={cn("amx-accent-bar", badge.accent)} aria-hidden="true" />

      {/* Top row */}
      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate">
              {ambulance.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{location}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
              badge.className
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", badge.dot)} />
            {badge.label}
          </span>

          {isAdmin && (
            <div className="flex items-center gap-1">
              <MagneticIconButton
                onClick={handleEditClick}
                ariaLabel={`Edit ${ambulance.name}`}
                tone="primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </MagneticIconButton>
              <MagneticIconButton
                onClick={handleDeleteClick}
                disabled={isDeleting}
                ariaLabel={`Delete ${ambulance.name}`}
                tone="danger"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </MagneticIconButton>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="relative space-y-2.5 text-sm text-slate-500 border-t border-slate-50 pt-4">
        <div className="flex items-center gap-3">
          <svg
            className="w-4 h-4 text-secondary shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <a
            href={`tel:${ambulance.phone.replace(/[^\d+]/g, "")}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-slate-700 hover:text-primary transition-colors"
          >
            {ambulance.phone}
          </a>
        </div>

        <div className="flex items-start gap-3">
          <svg
            className="w-4 h-4 text-primary shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
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
          <div>
            <span className="text-slate-600">{location}</span>
            {ambulance.address && ambulance.municipality && (
              <p className="text-xs text-slate-400 mt-0.5">{ambulance.address}</p>
            )}
          </div>
        </div>

        {ambulance.notes && (
          <div className="flex items-start gap-3">
            <svg
              className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-slate-400 italic">{ambulance.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   MagneticIconButton — small action icons that follow the cursor
   ───────────────────────────────────────────────────────────── */

const MagneticIconButton = React.memo(function MagneticIconButton({
  onClick,
  disabled,
  ariaLabel,
  tone,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  ariaLabel: string;
  tone: "primary" | "danger";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.setProperty("--tx", `${x * 0.35}`);
    el.style.setProperty("--ty", `${y * 0.35}`);
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0");
    el.style.setProperty("--ty", "0");
  }, []);

  const toneCls =
    tone === "primary"
      ? "text-slate-400 hover:text-primary hover:bg-primary-light focus-visible:ring-primary/40"
      : "text-slate-400 hover:text-red-600 hover:bg-red-50 focus-visible:ring-red-300";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "amx-icon-btn p-1.5 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2",
        toneCls
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {children}
      </svg>
    </button>
  );
});