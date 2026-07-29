"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { addressApi, orderApi } from "@/lib/api";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

type PaymentMethod = "cod" | "esewa" | "card";

export default function CheckoutPage() {
  const { token } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login?redirect=/checkout");
    }
  }, [token, router]);

  useEffect(() => {
    if (token && items.length === 0 && !placedOrderId) {
      router.push("/buy-medicines");
    }
  }, [token, items.length, placedOrderId, router]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocationError("Couldn't get your location. You can still enter the address manually.");
        setLocating(false);
      }
    );
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !district.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setPlacing(true);
    try {
      const { address } = await addressApi.create({
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        district,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      });

      const { order } = await orderApi.create(address.id, paymentMethod);

      clearCart();
      setPlacedOrderId(order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (placedOrderId) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <MarketingHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Order placed!</h1>
            <p className="text-slate-500 mb-8">
              Your order has been placed successfully. We'll notify you once it's on its way.
            </p>
            <button
              onClick={() => router.push("/buy-medicines")}
              className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors"
            >
              Continue shopping
            </button>
          </div>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Checkout</h1>
              <p className="text-slate-500 text-sm">Confirm your delivery details and payment method.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Delivery address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address line 1</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House no., street, area"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address line 2 (optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Landmark, apartment, etc."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Pin your exact location</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Helps our delivery rider find you faster. Optional but recommended.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="shrink-0 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    {locating ? "Locating..." : "Use my current location"}
                  </button>
                </div>

                {locationError && <p className="text-xs text-red-500 mt-2">{locationError}</p>}

                {latitude !== null && longitude !== null && (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Pinned at {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Payment method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["cod", "esewa", "card"] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-3 rounded-lg border text-sm font-semibold text-left transition-colors ${
                      paymentMethod === method
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-600 hover:border-primary/40"
                    }`}
                  >
                    {method === "cod" ? "Cash on Delivery" : method === "esewa" ? "eSewa" : "Card"}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={placing}
              className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {placing ? "Placing order..." : `Place order - Rs. ${totalPrice + 100}`}
            </button>
          </form>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-100 p-5 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Order summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-800">Rs. {item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>Rs. {totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Delivery</span>
                  <span>Rs. 100</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                  <span>Total</span>
                  <span>Rs. {totalPrice + 100}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
