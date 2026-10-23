import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tag,
  Share2,
} from 'lucide-react';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [demandInsights, setDemandInsights] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected ticket quantities map: { [tierName]: quantity }
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Fetch Event, Insights, and Reviews
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [eventRes, reviewsRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/reviews/event/${id}`),
        ]);

        if (eventRes.data.success) {
          setEvent(eventRes.data.event);

          // Initialize ticket quantities to 0
          const initialQty = {};
          eventRes.data.event.ticketTiers.forEach((tier) => {
            initialQty[tier.name] = 0;
          });
          setSelectedQuantities(initialQty);
        }

        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.reviews || []);
        }

        // Fetch AI demand insights
        try {
          const insightRes = await api.get(`/ai/demand-insights/${id}`);
          if (insightRes.data.success) {
            setDemandInsights(insightRes.data.insights);
          }
        } catch (e) {
          // ignore insight failure
        }
      } catch (err) {
        setError(err.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleQuantityChange = (tierName, delta, maxAvailable) => {
    setSelectedQuantities((prev) => {
      const current = prev[tierName] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [tierName]: next };
    });
  };

  // Calculate totals
  const totalTickets = Object.values(selectedQuantities).reduce((a, b) => a + b, 0);
  const totalPrice = event?.ticketTiers
    ? event.ticketTiers.reduce((acc, tier) => {
        return acc + tier.price * (selectedQuantities[tier.name] || 0);
      }, 0)
    : 0;

  const handleProceedToCheckout = () => {
    if (totalTickets === 0) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    const items = Object.keys(selectedQuantities)
      .filter((tierName) => selectedQuantities[tierName] > 0)
      .map((tierName) => ({
        tierName,
        quantity: selectedQuantities[tierName],
      }));

    navigate('/checkout', {
      state: {
        eventId: event._id,
        eventTitle: event.title,
        items,
      },
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      setSubmittingReview(true);
      setReviewSuccessMsg('');
      setReviewErrorMsg('');

      const res = await api.post('/reviews', {
        eventId: event._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.data.success) {
        setReviewSuccessMsg('Your review has been verified and published! Thank you.');
        setReviewTitle('');
        setReviewComment('');
        // Refresh reviews list
        const refreshedReviews = await api.get(`/reviews/event/${id}`);
        if (refreshedReviews.data.success) {
          setReviews(refreshedReviews.data.reviews || []);
        }
      }
    } catch (err) {
      setReviewErrorMsg(err.message || 'Failed to submit review. You must have a confirmed booking to post a review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Retrieving event specification & ticket availability...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-slate-400 text-xs mb-6">{error || 'This event does not exist or may have been unlisted.'}</p>
        <Link to="/events" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold">
          Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.date);
  const endDate = new Date(event.endDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-2xl">
        <div className="aspect-[21/9] sm:aspect-[24/9] w-full relative">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-10 relative -mt-32 sm:-mt-44 z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 backdrop-blur-md">
              {event.category}
            </span>
            {event.featured && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                Featured Highlight
              </span>
            )}
            <span className="text-xs font-medium text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 backdrop-blur-md">
              Organized by {event.organizer?.name || 'Authorized Host'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {event.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {event.shortDescription}
          </p>

          {/* Quick Date, Time & Venue Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-cyan" />
              <span>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>
                {event.venue?.name}, {event.venue?.city}
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-auto text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-bold">{event.averageRating > 0 ? event.averageRating.toFixed(1) : 'New'}</span>
              <span className="text-slate-400 text-xs">({event.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Details / Right Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Details, AI Demand Insights, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* About Event Description */}
          <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-white">About This Event</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Event Demand Insights Card */}
          {demandInsights && (
            <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/30 border border-brand-500/30 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Real-Time Event Demand Analytics</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {demandInsights.metrics?.trendBadge}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Capacity Booked:</span>
                  <span className="text-white font-bold">{demandInsights.metrics?.fillRatePercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan rounded-full transition-all duration-500"
                    style={{ width: `${demandInsights.metrics?.fillRatePercent || 0}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {demandInsights.insightsSummary}
              </p>

              <p className="text-[10px] text-slate-400 font-mono">
                {demandInsights.note}
              </p>
            </div>
          )}

          {/* Venue & Organizer Details */}
          <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                Venue & Address
              </h3>
              <p className="text-sm font-semibold text-slate-200">{event.venue?.name}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {event.venue?.address ? `${event.venue.address}, ` : ''}
                {event.venue?.city}, {event.venue?.state} {event.venue?.postalCode}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cancellation Guarantee
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {event.cancellationPolicy?.allowed
                  ? `Tickets can be cancelled up to ${event.cancellationPolicy.cutoffHours} hours prior to event start for a ${event.cancellationPolicy.refundPercentage}% instant refund.`
                  : 'Tickets for this event are non-refundable as per host policy.'}
              </p>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Attendee Reviews</h3>
                <p className="text-xs text-slate-400 mt-0.5">Verified feedback from attendees who booked tickets</p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20 text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{event.averageRating > 0 ? event.averageRating.toFixed(1) : '5.0'}</span>
              </div>
            </div>

            {/* Write a Review Box (for attendees) */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Leave Verified Feedback</h4>

                {reviewSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs">
                    {reviewSuccessMsg}
                  </div>
                )}

                {reviewErrorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs">
                    {reviewErrorMsg}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`p-1 ${reviewRating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Review title (e.g. Great speaker lineup!)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />

                <textarea
                  rows={3}
                  placeholder="Share your experience regarding session quality, venue, or ticketing..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-400">
                <Link to="/login" className="text-brand-400 hover:underline">Log in</Link> with an attendee account that has booked tickets to submit a review.
              </p>
            )}

            {/* Reviews List */}
            <div className="space-y-4 pt-2">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No reviews posted yet. Be the first to share your experience!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white">
                          {rev.user?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-xs font-semibold text-white">{rev.user?.name || 'Verified Attendee'}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {rev.title && <p className="text-xs font-semibold text-slate-200">{rev.title}</p>}
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sticky Ticket Reservation Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Select Ticket Tiers
              </span>
              <h3 className="text-lg font-extrabold text-white">Reserve Your Seats</h3>
            </div>

            {/* Ticket Tier Cards */}
            <div className="space-y-3.5">
              {event.ticketTiers.map((tier) => {
                const available = tier.capacity - (tier.soldCount || 0);
                const isSoldOut = available <= 0;
                const qty = selectedQuantities[tier.name] || 0;

                return (
                  <div
                    key={tier._id || tier.name}
                    className={`p-4 rounded-2xl border transition-all ${
                      qty > 0
                        ? 'bg-brand-950/30 border-brand-500 shadow-md shadow-brand-500/10'
                        : 'bg-slate-800/50 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="text-xs font-bold text-white">{tier.name}</h4>
                        <p className="text-xs text-brand-400 font-extrabold mt-0.5">
                          {tier.price === 0 ? 'FREE' : `₹${tier.price.toLocaleString()}`}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      {isSoldOut ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                          Sold Out
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(tier.name, -1, available)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-white">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(tier.name, 1, available)}
                            disabled={qty >= available || qty >= 10}
                            className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {tier.description && (
                      <p className="text-[11px] text-slate-400 leading-snug mb-2">{tier.description}</p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-700/40">
                      <span>Available: {available} seats</span>
                      {available < 15 && available > 0 && (
                        <span className="text-amber-400 font-semibold">Selling Fast!</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Price Breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Selected Tickets:</span>
                <span className="font-semibold text-white">{totalTickets}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white">
                <span>Total Amount:</span>
                <span className="text-brand-300">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={totalTickets === 0}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white rounded-xl font-bold text-xs transition shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{totalTickets === 0 ? 'Select Tickets Above' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Digital QR Pass Issued Upon Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
