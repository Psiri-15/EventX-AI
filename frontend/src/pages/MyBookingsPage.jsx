import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Ticket,
  ArrowRight,
  RotateCcw,
  Clock,
} from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancelError(null);
    setCancelSuccess(null);
    setCancelReason('Change of schedule');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      setCancelLoading(true);
      setCancelError(null);

      const res = await api.put(`/bookings/${cancellingBooking._id}/cancel`, {
        reason: cancelReason,
      });

      if (res.data.success) {
        setCancelSuccess(res.data.message);
        // Refresh bookings
        await fetchBookings();
        setTimeout(() => {
          setCancellingBooking(null);
          setCancelSuccess(null);
        }, 2000);
      }
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking. It may exceed cutoff limit.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Booking History</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Review all your confirmed ticket reservations, transactions, and manage cancellations.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 text-xs">Loading transaction history...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="p-6 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
                    {b.bookingReference}
                  </span>
                  <span className="text-xs text-slate-400">
                    Booked on {new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {b.status === 'confirmed' ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Confirmed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Cancelled & Refunded
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{b.event?.title}</h3>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>Tickets: <strong className="text-white">{b.totalQuantity}</strong></span>
                  <span>Total Amount: <strong className="text-brand-300">₹{b.totalAmount.toLocaleString()}</strong></span>
                  <span>Payment: <strong className="text-slate-200 uppercase">{b.payment?.method}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  to="/my-tickets"
                  className="flex-1 md:flex-none px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition text-center shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>View Tickets</span>
                </Link>

                {b.status === 'confirmed' && (
                  <button
                    onClick={() => handleOpenCancelModal(b)}
                    className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-900/60 border border-slate-800 rounded-3xl max-w-lg mx-auto p-8 space-y-4">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">You haven't made any ticket reservations on EventX AI yet.</p>
          <Link
            to="/events"
            className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition"
          >
            Discover Events
          </Link>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ref: <span className="font-mono text-white">{cancellingBooking.bookingReference}</span> for "{cancellingBooking.event?.title}"
              </p>
            </div>

            {cancelSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs text-center font-medium">
                {cancelSuccess}
              </div>
            )}

            {cancelError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs text-center">
                {cancelError}
              </div>
            )}

            {!cancelSuccess && (
              <>
                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Total Amount Paid:</span>
                    <span className="font-bold text-white">₹{cancellingBooking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund Percentage:</span>
                    <span className="font-bold text-emerald-400">
                      {cancellingBooking.event?.cancellationPolicy?.refundPercentage || 100}%
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-700/60">
                    <span>Estimated Refund:</span>
                    <span className="font-bold text-brand-300">
                      ₹{Math.round((cancellingBooking.totalAmount * (cancellingBooking.event?.cancellationPolicy?.refundPercentage || 100)) / 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Reason for Cancellation
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Change of schedule">Change of personal schedule</option>
                    <option value="Booked wrong event/date">Booked by mistake</option>
                    <option value="Travel logistics issue">Travel logistics issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCancellingBooking(null)}
                    disabled={cancelLoading}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition border border-slate-700"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                  >
                    {cancelLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      'Confirm Cancellation'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
