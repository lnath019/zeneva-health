'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminApi, BackendOrder, OrderStatus } from '@/lib/api';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'delivered', 'cancelled'];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export function ManageOrders() {
  const { data, isLoading, error, execute: fetchOrders } = useApi(adminApi.getOrders);
  const { isLoading: isSaving, execute: updateOrderStatus } = useApi(adminApi.updateOrderStatus);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<OrderStatus>('pending');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleExpand = (order: BackendOrder) => {
    if (expandedId === order.id) {
      setExpandedId(null);
      setSaveError(null);
      return;
    }
    setExpandedId(order.id);
    setDraftStatus(order.status);
    setSaveError(null);
  };

  const handleSave = async (order: BackendOrder) => {
    setSaveError(null);
    setSavingId(order.id);
    try {
      await updateOrderStatus(order.id, draftStatus);
      setExpandedId(null);
      await fetchOrders();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSavingId(null);
    }
  };

  const orders = (data?.orders ?? []).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Orders</h2>
        <p className="text-slate-500 text-xs mt-1">Review pharmacy orders and update their delivery status.</p>
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
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No orders yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: BackendOrder) => (
                <React.Fragment key={order.id}>
                  <tr className="border-t border-slate-50 align-top">
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{order.user?.fullName ?? 'Guest'}</p>
                      <p className="text-xs text-slate-500">{order.user?.phone || '—'}</p>
                      <p className="text-xs text-slate-400">{order.user?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px]">
                      {order.address
                        ? `${order.address.addressLine1}${order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}, ${order.address.city}, ${order.address.district}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">Rs. {order.grandTotal}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_BADGE[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleExpand(order)}>
                        {expandedId === order.id ? 'Close' : 'Manage'}
                      </Button>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="border-t border-slate-50">
                      <td colSpan={7} className="px-6 py-4 bg-slate-50/50">
                        {saveError && (
                          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold mb-4">
                            {saveError}
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items</p>
                          <div className="space-y-1 text-sm text-slate-600">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.productName} × {item.quantity}</span>
                                <span className="font-semibold text-slate-800">Rs. {item.unitPrice * item.quantity}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                              <span>Subtotal Rs. {order.subtotal} + Delivery Rs. {order.deliveryCharge}</span>
                              <span>Total Rs. {order.grandTotal}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 md:items-end">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <select
                              value={draftStatus}
                              onChange={(e) => setDraftStatus(e.target.value as OrderStatus)}
                              className={cn(
                                'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm',
                                'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                              )}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button size="sm" isLoading={isSaving && savingId === order.id} onClick={() => handleSave(order)}>
                            Save
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
