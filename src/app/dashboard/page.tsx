"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { appointmentApi, slotApi } from "@/lib/api";
import { ManageSlots } from "@/components/dashboard/ManageSlots";
import { BookAppointment } from "@/components/dashboard/BookAppointmentList";
import { PatientAppointments } from "@/components/dashboard/PatientAppointments";
import { Slot, Appointment } from "@/types";
import { Spinner } from "@/components/ui/Spinner";

type Role = "patient" | "doctor" | "admin";

const doctorStats = [
  {
    label: "Scheduled Today",
    value: "0",
    hint: "No appointments booked for today",
  },
  {
    label: "Active Slots",
    value: "0",
    hint: "Create slots to receive bookings",
  },
  { label: "Total Patients", value: "0", hint: "Unique patients visited" },
];

const adminStats = [
  {
    label: "Total System Users",
    value: "--",
    hint: "Registered patients and doctors",
  },
  {
    label: "Active Doctors",
    value: "--",
    hint: "Granted medical practitioners",
  },
  { label: "Total Bookings", value: "--", hint: "Appointments booked overall" },
];

const adminActivity = [
  { text: "New patient registered", time: "Just now" },
  { text: "Database connection initialized", time: "10m ago" },
];

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="p-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <h3 className="mt-1 text-2xl font-bold text-slate-800">{value}</h3>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </Card>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function PatientOverview() {
  const router = useRouter();
  const {
    data: appointments,
    isLoading: isApptsLoading,
    execute: fetchAppointments,
  } = useApi(appointmentApi.getMyAppointments);
  const { data: slots, execute: fetchSlots } = useApi(slotApi.getAll);

  useEffect(() => {
    fetchAppointments();
    fetchSlots();
  }, [fetchAppointments, fetchSlots]);

  const getSlotDetails = (
    appointment: Appointment,
  ): Slot | null | undefined => {
    if (appointment.doctorSlot) return appointment.doctorSlot;
    if (appointment.slot) return appointment.slot;
    if (slots) {
      return slots.find((s: Slot) => s.id === appointment.doctorSlotId);
    }
    return null;
  };

  // Metric computations
  const totalBookings = appointments ? appointments.length : 0;
  const pendingApprovals = appointments
    ? appointments.filter((a) => a.status === "pending").length
    : 0;

  // Find next upcoming appointment (confirmed or pending, earliest slotDate)
  const upcomingAppointments = appointments
    ? appointments
        .filter((a) => a.status === "confirmed" || a.status === "pending")
        .map((a) => ({
          appt: a,
          slot: getSlotDetails(a),
        }))
        .filter((item) => item.slot)
        .sort((a, b) => {
          const dateA = new Date(`${a.slot!.slotDate}T${a.slot!.startTime}`);
          const dateB = new Date(`${b.slot!.slotDate}T${b.slot!.startTime}`);
          return dateA.getTime() - dateB.getTime();
        })
    : [];

  const nextAppointment = upcomingAppointments[0] || null;

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Welcome to your portal"
        subtitle="Manage your appointments and healthcare resources."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col justify-between p-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Bookings
            </span>
            <h3 className="mt-1 text-3xl font-extrabold text-slate-800">
              {isApptsLoading ? "..." : totalBookings}
            </h3>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            All registered appointments
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Confirmations
            </span>
            <h3 className="mt-1 text-3xl font-extrabold text-amber-600">
              {isApptsLoading ? "..." : pendingApprovals}
            </h3>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Awaiting hospital approval
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Next Consultation
            </span>
            {isApptsLoading ? (
              <h3 className="mt-1 text-lg font-bold text-slate-600">
                Loading...
              </h3>
            ) : nextAppointment ? (
              <div className="mt-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Dr.{" "}
                  {nextAppointment.slot?.doctor?.user?.fullName || "Specialist"}
                </h4>
                <p className="text-xs text-slate-500">
                  {nextAppointment.slot?.slotDate} @{" "}
                  {nextAppointment.slot?.startTime.slice(0, 5)}
                </p>
              </div>
            ) : (
              <h3 className="mt-1 text-base font-bold text-slate-400">
                No upcoming visits
              </h3>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Your next scheduled appointment
          </p>
        </Card>
      </div>

      {/* Upcoming Appointments Card */}
      <Card className="p-8">
        <h3 className="mb-6 text-base font-bold text-slate-800">
          Upcoming Appointments
        </h3>
        {isApptsLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" />
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm font-medium text-slate-400">
              You don&apos;t have any scheduled appointments.
            </p>
            <button
              onClick={() => router.push("/dashboard?tab=book-appointment")}
              className="mt-2 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Book your first appointment &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 3).map(({ appt, slot }) => (
              <div
                key={appt.id}
                className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Dr. {slot?.doctor?.user?.fullName || "Specialist"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {slot?.hospital?.name} &bull; {slot?.slotDate} @{" "}
                    {slot?.startTime.slice(0, 5)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      appt.status === "confirmed"
                        ? "bg-emerald-700"
                        : "bg-amber-700"
                    } `}
                  />

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider `}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function DoctorOverview() {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Doctor Console"
        subtitle="Set up your availability and review incoming bookings."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {doctorStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="p-8">
        <h3 className="mb-6 text-base font-semibold text-slate-800">
          Today&apos;s Active Slots
        </h3>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-slate-400">
            You haven&apos;t created any slots for today.
          </p>
          <button className="mt-2 text-xs font-semibold text-secondary transition-colors hover:text-secondary-hover">
            Create availability slot &rarr;
          </button>
        </div>
      </Card>
    </div>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Admin Control Panel"
        subtitle="Manage system configurations, user validation, and logs."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="p-8">
        <h3 className="mb-6 text-base font-semibold text-slate-800">
          Recent System Activity
        </h3>
        <div className="space-y-4">
          {adminActivity.map((item) => (
            <div
              key={item.text}
              className="flex items-center justify-between border-b border-slate-50 py-2 text-sm"
            >
              <span className="font-medium text-slate-600">{item.text}</span>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const overviewByRole: Record<Role, () => JSX.Element> = {
  patient: PatientOverview,
  doctor: DoctorOverview,
  admin: AdminOverview,
};

export default function DashboardPage() {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  if (activeTab === "overview") {
    const Overview = overviewByRole[role as Role];
    if (!Overview) {
      return (
        <div className="py-12 text-center font-medium text-slate-500">
          Loading details...
        </div>
      );
    }
    return <Overview />;
  }

  if (activeTab === "manage-slots" && role === "doctor") return <ManageSlots />;
  if (activeTab === "book-appointment" && role === "patient")
    return <BookAppointment />;
  if (activeTab === "patient-appointments" && role === "patient")
    return <PatientAppointments />;

  return (
    <Card className="p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800">Module coming soon</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        We&apos;re preparing the{" "}
        <span className="font-semibold capitalize text-primary">
          {activeTab.replace("-", " ")}
        </span>{" "}
        interface.
      </p>
    </Card>
  );
}
