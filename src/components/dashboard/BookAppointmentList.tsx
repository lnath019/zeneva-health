"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { slotApi, appointmentApi, medicalHistoryApi, doctorApi } from "@/lib/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import { Slot } from "@/types";

interface DoctorGroup {
  doctorId: string;
  doctorUserId: string | null;
  doctorName: string;
  specialisationName: string;
  imageUrl: string | null;
  slots: Slot[];
}

export function BookAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, userId, role } = useAuth();
  const {
    data: slots,
    isLoading,
    error,
    execute: fetchSlots,
  } = useApi(slotApi.getAll);
  const { isLoading: isBooking, execute: bookAppointment } = useApi(
    appointmentApi.book,
  );
  const { data: myRecords, execute: fetchMyRecords } = useApi(medicalHistoryApi.getMy);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedSpecialisation, setSelectedSpecialisation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState("");
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [expandedDoctorIds, setExpandedDoctorIds] = useState<Set<string>>(new Set());

  // local override so the photo updates instantly after upload, without a full refetch
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [uploadingDoctorId, setUploadingDoctorId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggleDoctorExpanded = (doctorId: string) => {
    setExpandedDoctorIds((prev) => {
      const next = new Set(prev);
      if (next.has(doctorId)) {
        next.delete(doctorId);
      } else {
        next.add(doctorId);
      }
      return next;
    });
  };

  const handleAvatarClick = (e: React.MouseEvent, doctorId: string) => {
    e.stopPropagation();
    fileInputRefs.current[doctorId]?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, doctorId: string) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploadError(null);
    setUploadingDoctorId(doctorId);
    try {
      const imageUrl = await doctorApi.uploadImage(file);
      await doctorApi.updateMyProfile({ imageUrl });
      setImageOverrides((prev) => ({ ...prev, [doctorId]: imageUrl }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingDoctorId(null);
    }
  };

useEffect(() => {
    fetchSlots();
    if (token) {
      fetchMyRecords();
    }
  }, [fetchSlots, fetchMyRecords, token]);

  // After a login redirect, reopen the specific slot the user tried to book
  useEffect(() => {
    const pendingSlotId = searchParams.get("slot");
    if (!pendingSlotId || !token || !slots) return;

    const pendingSlot = slots.find((s: Slot) => s.id === pendingSlotId);
    if (pendingSlot) {
      setBookingSlot(pendingSlot);
      setReason("");
      setSelectedRecordIds([]);
      setBookingError(null);
      const doctorId = pendingSlot.doctor?.id ?? pendingSlot.doctorId;
      if (doctorId) {
        setExpandedDoctorIds((prev) => new Set(prev).add(doctorId));
      }
    }
    router.replace("/book-doctor");
  }, [searchParams, token, slots, router]);

 const handleOpenBookingModal = (slot: Slot) => {
    if (!token) {
      const target = `/book-doctor?slot=${slot.id}`;
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }
    setBookingSlot(slot);
    setReason("");
    setSelectedRecordIds([]);
    setBookingError(null);
  };
  const toggleRecord = (id: string) => {
    setSelectedRecordIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (!myRecords) return;
    setSelectedRecordIds((prev) => (prev.length === myRecords.length ? [] : myRecords.map((r) => r.id)));
  };

  const handleCloseBookingModal = () => {
    setBookingSlot(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!bookingSlot) {
      setBookingError("No slot selected.");
      return;
    }

    if (!reason.trim()) {
      setBookingError("Please specify a reason for your visit.");
      return;
    }

    try {
      await bookAppointment(bookingSlot.id, reason, selectedRecordIds);
      setBookingSlot(null);
      // Redirect to patient appointments tab
      router.push("/dashboard?tab=patient-appointments");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to book appointment";
      setBookingError(msg);
    }
  };

  // Extract unique hospital names for filter dropdown
  const uniqueHospitals = Array.from(
    new Set(slots?.map((s: Slot) => s.hospital?.name).filter(Boolean)),
  ) as string[];

  // Extract unique specialisation names for filter dropdown
  const uniqueSpecialisations = Array.from(
    new Set(
      slots?.map((s: Slot) => s.doctor?.specialisation?.name).filter(Boolean),
    ),
  ) as string[];

  // Filter slots
  const filteredSlots = slots?.filter((slot: Slot) => {
    if (slot.status !== "active") return false;

    // Doctor name, hospital, or speciality match
    const doctorName = slot.doctor?.user?.fullName || "";
    const specialisationName = slot.doctor?.specialisation?.name || "";
    const query = searchQuery.toLowerCase();
    const matchSearch =
      doctorName.toLowerCase().includes(query) ||
      slot.hospital?.name?.toLowerCase().includes(query) ||
      specialisationName.toLowerCase().includes(query);

    // Hospital match
    const matchHospital = selectedHospital
      ? slot.hospital?.name === selectedHospital
      : true;

    // Speciality match
    const matchSpecialisation = selectedSpecialisation
      ? specialisationName === selectedSpecialisation
      : true;

    // Date match
    const matchDate = selectedDate ? slot.slotDate === selectedDate : true;

    return matchSearch && matchHospital && matchSpecialisation && matchDate;
  });

  // Group filtered slots by doctor, so each doctor appears once with all their slots listed together
  const doctorGroups = useMemo<DoctorGroup[]>(() => {
    if (!filteredSlots) return [];
    const map = new Map<string, DoctorGroup>();

    for (const slot of filteredSlots) {
      const doctorId = slot.doctor?.id ?? slot.doctorId ?? "unknown";
      if (!map.has(doctorId)) {
        map.set(doctorId, {
          doctorId,
          doctorUserId: slot.doctor?.user?.id ?? null,
          doctorName: slot.doctor?.user?.fullName || "Specialist Doctor",
          specialisationName: slot.doctor?.specialisation?.name || "General Practitioner",
          imageUrl: slot.doctor?.imageUrl ?? null,
          slots: [],
        });
      }
      map.get(doctorId)!.slots.push(slot);
    }

    // sort each doctor's slots chronologically
    Array.from(map.values()).forEach((group) => {
      group.slots.sort((a: Slot, b: Slot) => {
        const dateCompare = a.slotDate.localeCompare(b.slotDate);
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || "").localeCompare(b.startTime || "");
      });
    });

    return Array.from(map.values());
  }, [filteredSlots]);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Book New Appointment
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Select an available doctor slot and schedule your consultation.
        </p>
      </div>

      {uploadError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
          {uploadError}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Search Doctor, Hospital or Speciality
          </label>
          <Input
            placeholder="Type name, hospital or speciality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Hospital
          </label>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[38px]"
          >
            <option value="">All Hospitals</option>
            {uniqueHospitals.map((hName) => (
              <option key={hName} value={hName}>
                {hName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Speciality
          </label>
          <select
            value={selectedSpecialisation}
            onChange={(e) => setSelectedSpecialisation(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[38px]"
          >
            <option value="">All Specialities</option>
            {uniqueSpecialisations.map((sName) => (
              <option key={sName} value={sName}>
                {sName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Date
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content — grouped by doctor, expandable */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading availability slots: {error}
        </div>
      ) : doctorGroups.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No available slots match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {doctorGroups.map((group) => {
            const isExpanded = expandedDoctorIds.has(group.doctorId);
            const isOwnDoctor = role === "doctor" && !!userId && userId === group.doctorUserId;
            const displayImageUrl = imageOverrides[group.doctorId] ?? group.imageUrl;
            const isUploadingThis = uploadingDoctorId === group.doctorId;

            return (
              <div
                key={group.doctorId}
                className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Doctor header — click to expand/collapse */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleDoctorExpanded(group.doctorId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleDoctorExpanded(group.doctorId);
                  }}
                  className="w-full text-left p-6 flex items-center gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  {/* Avatar — shows real photo when set, initial otherwise. Clickable only for the doctor's own card. */}
                  <div
                    onClick={isOwnDoctor ? (e) => handleAvatarClick(e, group.doctorId) : undefined}
                    className={`w-16 h-16 rounded-full bg-primary-light flex items-center justify-center shrink-0 text-primary font-bold text-xl relative overflow-hidden ${isOwnDoctor ? "cursor-pointer group" : ""}`}
                  >
                    {displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={group.doctorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      group.doctorName.replace(/^Dr\.?\s*/i, "").slice(0, 1).toUpperCase() || "D"
                    )}

                    {isOwnDoctor && (
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                        {isUploadingThis ? (
                          <Spinner size="sm" className="text-white" />
                        ) : (
                          <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {isOwnDoctor && (
                    <input
                      ref={(el) => { fileInputRefs.current[group.doctorId] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleFileSelected(e, group.doctorId)}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate">
                      Dr. {group.doctorName.replace(/^Dr\.?\s*/i, "")}
                    </h3>
                    <p className="text-primary text-xs font-semibold mt-0.5">
                      {group.specialisationName}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {group.slots.length} available slot{group.slots.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <svg
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Slot list — only rendered when expanded */}
                {isExpanded && (
                  <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto border-t border-slate-50">
                    {group.slots.map((slot) => {
                      const booked = slot.bookedTokens ?? 0;
                      const max = slot.maxTokens ?? 0;
                      const isFull = booked >= max;

                      return (
                        <div key={slot.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-neutralBrand uppercase tracking-wider">
                                {slot.slotDate}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider text-emerald-700 bg-emerald-50">
                                {isFull ? "Fully Booked" : "Available"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                              {slot.hospital?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Tokens: <span className="font-semibold text-slate-700">{booked}/{max}</span>
                            </p>
                          </div>
                          <Button
                            onClick={() => handleOpenBookingModal(slot)}
                            disabled={isFull}
                            size="sm"
                          >
                            Book Now
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                Confirm Appointment
              </h3>
              <button
                onClick={handleCloseBookingModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
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

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {bookingError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-700">
                <p>
                  <strong>Doctor:</strong> Dr.{" "}
                  {bookingSlot.doctor?.user?.fullName}
                </p>
                <p>
                  <strong>Hospital:</strong> {bookingSlot.hospital?.name}
                </p>
                <p>
                  <strong>Date & Time:</strong> {bookingSlot.slotDate} (
                  {bookingSlot.startTime?.slice(0, 5)} -{" "}
                  {bookingSlot.endTime?.slice(0, 5)})
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Reason for Visit
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual physical checkup, headache, follow-up consultation"
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {myRecords && myRecords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Share Medical History
                    </label>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {selectedRecordIds.length === myRecords.length ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 border border-slate-100 rounded-lg p-2">
                    {myRecords.map((record) => (
                      <label key={record.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRecordIds.includes(record.id)}
                          onChange={() => toggleRecord(record.id)}
                        />
                        {record.title}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseBookingModal}
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