import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
            Contact
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-600 leading-relaxed max-w-2xl mb-10">
            Have a question about booking, an account issue, or a partnership inquiry?
            Reach out to us directly using the details below.
          </p>

          <div className="bg-slate-50 rounded-xl p-8 space-y-6">
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Phone
              </span>
              <a href="tel:+97714440000" className="text-lg font-semibold text-slate-800 hover:text-primary transition-colors">
                +977-1-4440000
              </a>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email
              </span>
              <a href="mailto:support@zeneva.com" className="text-lg font-semibold text-slate-800 hover:text-primary transition-colors">
                support@zeneva.com
              </a>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Location
              </span>
              <span className="text-lg font-semibold text-slate-800">
                Kathmandu, Nepal
              </span>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}