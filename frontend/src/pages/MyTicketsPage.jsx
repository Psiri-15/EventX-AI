import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tickets/my-tickets');
        if (res.data.success) {
          setTickets(res.data.tickets || []);
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handlePrintTicket = (ticketCode) => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            Valid Entry Pass
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle className="w-3 h-3" />
            Checked In
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">My Digital QR Tickets</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Present your QR code at the event entrance for seamless digital check-in.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 text-xs">Loading your digital entry passes...</p>
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tickets.map((t) => (
            <div
              key={t._id}
              className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all ${
                t.status === 'valid'
                  ? 'border-slate-700/80 hover:border-brand-500/50'
                  : 'border-slate-800 opacity-75'
              }`}
            >
              {/* Event Banner & Top Info */}
              <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/20 border-b border-slate-800/80">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400 block mb-1">
                      {t.ticketTierName}
                    </span>
                    <h3 className="font-extrabold text-lg text-white leading-snug">{t.event?.title}</h3>
                  </div>
                  {getStatusBadge(t.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>
                      {t.event?.date
                        ? new Date(t.event.date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'TBA'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-accent-cyan shrink-0" />
                    <span>
                      {t.event?.date
                        ? new Date(t.event.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">
                      {t.event?.venue?.name}, {t.event?.venue?.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Presentation Area */}
              <div className="p-6 flex flex-col sm:flex-row items-center gap-6 bg-slate-950/60">
                <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0">
                  <img
                    src={t.qrCodeData}
                    alt={`QR Code for ${t.ticketCode}`}
                    className="w-36 h-36 object-contain"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Ticket Code</span>
                    <span className="font-mono text-sm font-bold text-white tracking-wider">{t.ticketCode}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Booking Reference</span>
                    <span className="font-mono text-xs text-slate-300">{t.booking?.bookingReference}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Gate Access</span>
                    <span className="text-xs text-brand-300 font-semibold">{t.checkInDetails?.gate || 'Main Entrance'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Price Paid: ₹{t.price}</span>
                <button
                  onClick={() => handlePrintTicket(t.ticketCode)}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-900/60 border border-slate-800 rounded-3xl max-w-lg mx-auto p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
            <TicketIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Tickets Booked Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            You haven't reserved tickets for any upcoming events. Explore our live events catalog and get your passes today!
          </p>
          <Link
            to="/events"
            className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-brand-500/25"
          >
            Explore Live Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
