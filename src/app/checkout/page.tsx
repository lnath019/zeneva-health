"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { addressApi, orderApi, BackendAddress } from "@/lib/api";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const emptyAddressForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
};

export default function CheckoutPage() {
  const { token } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<BackendAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [form, setForm] = useState(emptyAddressForm);
  const [guestEmail, setGuestEmail] = useState("");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 && !placedOrderId) {
      router.push("/buy-medicines");
    }
  }, [items.length, placedOrderId, router]);

  useEffect(() => {
    if (!token) return;
    setAddressesLoading(true);
    addressApi
      .getAll()
      .then((res) => {
        const list = res.addresses ?? [];
        setAddresses(list);
        if (list.length === 0) {
          setUseNewAddress(true);
        } else {
          const defaultAddress = list.find((a) => a.isDefault) ?? list[0];
          setSelectedAddressId(defaultAddress.id);
        }
      })
      .catch(() => {
        setUseNewAddress(true);
      })
      .finally(() => setAddressesLoading(false));
  }, [token]);

  const updateForm = (field: keyof typeof emptyAddressForm) =>
    ((e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value })));

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (token) {
      if (!useNewAddress && !selectedAddressId) {
        setError("Please select a delivery address.");
        return;
      }
      if (useNewAddress && (!form.fullName.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.district.trim())) {
        setError("Please fill in all required fields.");
        return;
      }

      setPlacing(true);
      try {
        let addressId = selectedAddressId;
        if (useNewAddress || !addressId) {
          const { address } = await addressApi.create({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim() || undefined,
            city: form.city.trim(),
            district: form.district.trim(),
          });
          addressId = address.id;
        }

        const { order } = await orderApi.create(addressId);
        clearCart();
        setPlacedOrderId(order.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
      } finally {
        setPlacing(false);
      }
      return;
    }

    // Guest checkout
    if (!form.fullName.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.district.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setPlacing(true);
    try {
      const { order } = await orderApi.guestCheckout({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: guestEmail.trim() || undefined,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim(),
        district: form.district.trim(),
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      setPlacedOrderId(order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  const addressFormFields = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Full name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={updateForm("fullName")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={updateForm("phone")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Address line 1</label>
        <input
          type="text"
          value={form.addressLine1}
          onChange={updateForm("addressLine1")}
          placeholder="House no., street, area"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Address line 2 (optional)</label>
        <input
          type="text"
          value={form.addressLine2}
          onChange={updateForm("addressLine2")}
          placeholder="Landmark, apartment, etc."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={updateForm("city")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">District</label>
          <input
            type="text"
            value={form.district}
            onChange={updateForm("district")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>
      </div>
    </>
  );

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
              Your order has been placed successfully. We&apos;ll notify you once it&apos;s on its way.
            </p>
            <button
              onClick={() => router.push("/dashboard/my-orders")}
              className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors"
            >
              View my orders
            </button>
            <button
              onClick={() => router.push("/buy-medicines")}
              className="w-full py-3 mt-3 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
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
              <p className="text-slate-500 text-sm">Confirm your delivery details. Pay cash on delivery.</p>
            </div>

            {token ? (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Delivery address</h2>

                {addressesLoading ? (
                  <p className="text-slate-400 text-sm">Loading your addresses…</p>
                ) : (
                  <>
                    {addresses.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(address.id);
                              setUseNewAddress(false);
                            }}
                            className={`px-4 py-3 rounded-lg border text-left text-sm transition-colors ${
                              !useNewAddress && selectedAddressId === address.id
                                ? "border-primary bg-primary/5 text-slate-800"
                                : "border-slate-200 text-slate-600 hover:border-primary/40"
                            }`}
                          >
                            <p className="font-semibold">{address.fullName} — {address.phone}</p>
                            <p className="text-xs mt-1 text-slate-500">
                              {address.addressLine1}
                              {address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city}, {address.district}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseNewAddress((v) => !v)}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {useNewAddress ? "Choose a saved address instead" : "+ Use a new address"}
                      </button>
                    )}

                    {useNewAddress && <div className="space-y-4">{addressFormFields}</div>}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Delivery details</h2>

                {addressFormFields}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="For order updates"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Payment</h2>
              <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                Cash on Delivery
              </div>
            </div>

            {!token && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-slate-600">
                Checking out creates an account with your phone number so you can track your order.
                You&apos;ll set a password when you first log in.
              </div>
            )}

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
