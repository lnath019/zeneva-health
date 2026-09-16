'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { orderApi, BackendOrder, OrderStatus } from '@/lib/api';
import { Spinner } from '../ui/Spinner';

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export function MyOrders() {
  const { data, isLoading, error, execute: fetchOrders } = useApi(orderApi.getAll);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orders = (data?.orders ?? []).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">My Orders</h2>
        <p className="text-slate-500 text-xs mt-1">Track everything you&apos;ve ordered from the pharmacy.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading orders: {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center">
          <p className="text-slate-500 font-medium">No orders yet</p>
          <Link
            href="/buy-medicines"
            className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Browse medicines &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: BackendOrder) => (
            <div key={order.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_BADGE[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-1.5 text-sm text-slate-600 border-t border-slate-50 pt-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="font-semibold text-slate-800">Rs. {item.unitPrice * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-50 mt-3 pt-3 flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal Rs. {order.subtotal} + Delivery Rs. {order.deliveryCharge}
                </span>
                <span className="font-extrabold text-slate-900">Rs. {order.grandTotal}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
