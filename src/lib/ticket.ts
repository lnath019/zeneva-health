import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { AppointmentTicket } from '@/types';

export function getTicketVerificationUrl(appointmentId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/verify-appointment/${appointmentId}`;
}

export async function generateTicketQrDataUrl(appointmentId: string): Promise<string> {
  return QRCode.toDataURL(getTicketVerificationUrl(appointmentId), {
    margin: 1,
    width: 240,
  });
}

function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : '—';
}

export async function downloadTicketPdf(ticket: AppointmentTicket): Promise<void> {
  const qrDataUrl = await generateTicketQrDataUrl(ticket.id);

  const pageWidth = 360;
  const doc = new jsPDF({ unit: 'pt', format: [pageWidth, 560] });

  doc.setFillColor(13, 109, 100);
  doc.rect(0, 0, pageWidth, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Zeneva Healthcare', 24, 32);
  doc.setFontSize(10);
  doc.text('Appointment Ticket', 24, 50);

  let y = 110;
  const addRow = (label: string, value: string) => {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label.toUpperCase(), 24, y);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(value || '—', 24, y + 16);
    y += 40;
  };

  addRow('Patient', ticket.patientName);
  addRow('Doctor', `Dr. ${ticket.doctorName}${ticket.specialisation ? ` (${ticket.specialisation})` : ''}`);
  addRow('Hospital', `${ticket.hospitalName ?? '—'}${ticket.hospitalAddress ? `, ${ticket.hospitalAddress}` : ''}`);
  addRow('Date & Time', `${ticket.slotDate ?? '—'}   ${formatTime(ticket.startTime)} - ${formatTime(ticket.endTime)}`);
  addRow('Token Number', String(ticket.tokenNumber));
  addRow('Status', ticket.status.replace('_', ' ').toUpperCase());

  const qrSize = 140;
  doc.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, y, qrSize, qrSize);
  y += qrSize + 20;

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Scan to verify this ticket', pageWidth / 2, y, { align: 'center' });

  doc.save(`appointment-ticket-${ticket.tokenNumber}.pdf`);
}
