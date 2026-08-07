import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
            About Us
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Nepal&apos;s Complete Health Facilitator
          </h1>
          <p className="text-slate-600 leading-relaxed text-lg max-w-3xl">
            Zeniva Healthcare connects patients with doctors, diagnostic labs, hospitals, and
            emergency services across Nepal — all from one platform. We built Zeniva to remove
            the friction from getting care: no more calling around for appointment slots, no
            more guessing which lab does which test, no more scrambling to find an ambulance
            number when it matters most.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Find &amp; Book Doctors</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Search by specialisation or hospital, see real-time availability, and book a slot
                in minutes.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Diagnostics &amp; Medicines</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Book lab tests at trusted diagnostic centers and order medicines for delivery,
                without leaving home.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">One Health Record</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Keep your medical history, prescriptions, and appointment records in one place,
                shareable with your care team.
              </p>
            </div>
          </div>

          <div className="mt-14 border-t border-slate-100 pt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Built for Nepal</h2>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              We work with hospitals and clinics across all seven provinces, with location data
              down to the municipality level, so wherever you are, you can find care nearby. Our
              hospital and doctor network is growing every week.
            </p>
          </div>

          <div className="mt-14">
            <Link href="/" className="text-primary font-semibold hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

