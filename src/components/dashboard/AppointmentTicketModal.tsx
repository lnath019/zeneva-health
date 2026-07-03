'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { appointmentApi } from '@/lib/api';
import { downloadTicketPdf, getTicketVerificationUrl, generateTicketQrDataUrl } from '@/lib/ticket';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface AppointmentTicketModalProps {
  appointmentId: string;
  onClose: () => void;
}

export function AppointmentTicketModal({ appointmentId, onClose }: AppointmentTicketModalProps) {
  const { data: ticket, isLoading, error, execute: fetchTicket } = useApi(appointmentApi.getTicket);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicket(appointmentId);
    generateTicketQrDataUrl(appointmentId).then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [appointmentId, fetchTicket]);

  const handleDownload = async () => {
    if (!ticket) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadTicketPdf(ticket);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Appointment Ticket</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error || !ticket ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm font-medium">
              Failed to load ticket: {error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary-light/40 rounded-xl p-4 space-y-2.5 text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
                  <span className="text-slate-800 font-semibold">{ticket.patientName}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doctor</span>
                  <span className="text-slate-800 font-semibold">
                    Dr. {ticket.doctorName}
                    {ticket.specialisation && (
                      <span className="text-primary font-medium"> ({ticket.specialisation})</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hospital</span>
                  <span className="text-slate-800">
                    {ticket.hospitalName}
                    {ticket.hospitalAddress ? `, ${ticket.hospitalAddress}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>
                    <span className="text-slate-800">
                      {ticket.slotDate} · {ticket.startTime?.slice(0, 5)} - {ticket.endTime?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Token</span>
                    <span className="text-slate-800 font-bold text-lg">{ticket.tokenNumber}</span>
                  </div>
                </div>
                <div>
                  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary uppercase tracking-wider">
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="Ticket verification QR code" className="w-40 h-40" />
                )}
                <p className="text-xs text-slate-400 text-center">
                  Scan this code to verify the ticket. Verification link:
                  <br />
                  <span className="break-all">{getTicketVerificationUrl(ticket.id)}</span>
                </p>
              </div>

              {downloadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs font-medium">
                  {downloadError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button type="button" onClick={handleDownload} isLoading={isDownloading}>
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
