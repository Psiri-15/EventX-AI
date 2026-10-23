import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { eventId, items } = location.state || {};

  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('demo_card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [upiId, setUpiId] = useState('alex@okaxis');

  const [processing, setProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Validate and prepare checkout on mount
  useEffect(() => {
    if (!eventId || !items || items.length === 0) {
      navigate('/events');
      return;
    }

    const prepareOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.post('/bookings/checkout', {
          eventId,
          items,
        });

        if (res.data.success) {
          setCheckoutData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to prepare order checkout. Tickets may have sold out.');
      } finally {
        setLoading(false);
      }
    };

    prepareOrder();
  }, [eventId, items]);

  const handlePayAndConfirm = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Execute final booking with atomic inventory reservation on backend
      const res = await api.post('/bookings', {
        eventId,
        items,
        paymentMethod,
        paymentDetails: {
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        },
      });

      if (res.data.success) {
        setBookingSuccess(res.data.booking);

        // Confetti celebration!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      setError(err.message || 'Payment processing or inventory reservation failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-400 text-xs">Securing ticket reservation lock...</p>
      </div>
    );
  }

  // Booking Confirmation Celebration Screen
  if (bookingSuccess) {
    return (
      <div className="max-w-xl mx-auto my-14 p-8 bg-slate-900 border border-brand-500/50 rounded-3xl shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Booking Confirmed & Verified
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-3">You're All Set! 🎉</h2>
          <p className="text-xs text-slate-400 mt-1">
            Reference: <span className="font-mono font-bold text-white">{bookingSuccess.bookingReference}</span>
          </p>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Total Tickets:</span>
            <span className="text-white font-bold">{bookingSuccess.totalQuantity}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Amount Paid:</span>
            <span className="text-brand-300 font-bold">₹{bookingSuccess.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Payment Method:</span>
            <span className="text-slate-200 font-semibold uppercase">{bookingSuccess.payment?.method}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-tickets"
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>View Digital QR Tickets</span>
          </Link>
          <Link
            to="/my-bookings"
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 text-center"
          >
            Booking History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Confirm Your Ticket Order</h1>
        <p className="text-xs text-slate-400">Review selected tiers, attendee details, and select payment gateway.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Summary & Payment Mode */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Summary Pill */}
          {checkoutData?.event && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-white truncate">{checkoutData.event.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{checkoutData.event.venue?.name}, {checkoutData.event.venue?.city}</span>
                </p>
              </div>
            </div>
          )}

          {/* Tier Items Breakdown */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</h3>
            <div className="divide-y divide-slate-800">
              {checkoutData?.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{item.tierName}</p>
                    <p className="text-slate-500">
                      ₹{item.unitPrice.toLocaleString()} × {item.quantity} ticket{item.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="font-bold text-slate-200">₹{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Gateway</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Test Mode Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('demo_card')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  paymentMethod === 'demo_card'
                    ? 'bg-brand-950/40 border-brand-500 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-400" />
                <div>
                  <p className="text-xs font-bold">Credit/Debit Card</p>
                  <p className="text-[10px] text-slate-500">Simulated Instant Mode</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('demo_upi')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  paymentMethod === 'demo_upi'
                    ? 'bg-brand-950/40 border-brand-500 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                <div>
                  <p className="text-xs font-bold">UPI / QR Payment</p>
                  <p className="text-[10px] text-slate-500">Google Pay, PhonePe</p>
                </div>
              </button>
            </div>

            {/* Simulated Payment Input Details */}
            {paymentMethod === 'demo_card' && (
              <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Card Number (Demo prefilled)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'demo_upi' && (
              <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-3 text-xs">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Summary & Pay Button */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Items:</span>
                <span className="text-white font-semibold">{checkoutData?.totalQuantity}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Booking Fee:</span>
                <span className="text-emerald-400 font-semibold">FREE (₹0)</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                <span>Grand Total:</span>
                <span className="text-brand-300">₹{checkoutData?.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePayAndConfirm}
              disabled={processing}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving & Verifying...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{checkoutData?.totalAmount.toLocaleString()} & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit Encrypted Transaction Lock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
