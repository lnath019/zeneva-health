"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  const parts = [m.name, m.district?.name, m.district?.province?.name].filter(Boolean);
  return parts.join(", ");
}

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

  // cascading options
  const districts = useMemo<District[]>(() => {
    if (!locationTree || !form.provinceId) return [];
    return locationTree.find((p: Province) => p.id === form.provinceId)?.districts ?? [];
  }, [locationTree, form.provinceId]);

  const municipalities = useMemo<Municipality[]>(() => {
    if (!form.districtId) return [];
    return districts.find((d: District) => d.id === form.districtId)?.municipalities ?? [];
  }, [districts, form.districtId]);

  const openCreateModal = () => {
    fetchTree();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ambulance: Ambulance) => {
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
  };

  const handleProvinceChange = (id: string) => {
    setForm((f) => ({ ...f, provinceId: id, districtId: "", municipalityId: "" }));
  };

  const handleDistrictChange = (id: string) => {
    setForm((f) => ({ ...f, districtId: id, municipalityId: "" }));
  };

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

  const handleDelete = async (id: string) => {
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
  };

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

        <div className="flex items-center gap-3">
          {role === "admin" && (
            <Button onClick={openCreateModal} size="sm">Add Ambulance</Button>
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
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
                        {locationLabel(ambulance)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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

                    {role === "admin" && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(ambulance);
                          }}
                          aria-label={`Edit ${ambulance.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary-light transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ambulance.id);
                          }}
                          disabled={deletingId === ambulance.id}
                          aria-label={`Delete ${ambulance.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
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

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 text-primary shrink-0 mt-0.5"
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
                    <div>
                      <span className="text-slate-600">{locationLabel(ambulance)}</span>
                      {ambulance.address && ambulance.municipality && (
                        <p className="text-xs text-slate-400 mt-0.5">{ambulance.address}</p>
                      )}
                    </div>
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Ambulance" : "Add New Ambulance"}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {editingId ? "Update this ambulance's details." : "Register a new ambulance service."}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-4">{formError}</div>
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
              {/* Province */}
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
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <FieldLabel>District</FieldLabel>
                <select
                  value={form.districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isSaving || !form.provinceId}
                  required
                >
                  <option value="">{!form.provinceId ? "Select a province first" : "Select District"}</option>
                  {districts.map((d: District) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Municipality */}
              <div>
                <FieldLabel>Municipality / Local Body</FieldLabel>
                <select
                  value={form.municipalityId}
                  onChange={(e) => setForm((f) => ({ ...f, municipalityId: e.target.value }))}
                  className={SELECT_CLS}
                  disabled={isSaving || !form.districtId}
                  required
                >
                  <option value="">{!form.districtId ? "Select a district first" : "Select Municipality"}</option>
                  {municipalities.map((m: Municipality) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
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
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
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
