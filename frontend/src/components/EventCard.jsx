import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Tag, Sparkles } from 'lucide-react';

const categoryColors = {
  technology: 'from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30',
  workshops: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30',
  cultural: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30',
  music: 'from-violet-500/20 to-brand-500/20 text-violet-300 border-violet-500/30',
  sports: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
  college: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
  business: 'from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/30',
  other: 'from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-500/30',
};

const EventCard = ({ event }) => {
  const minPrice = event.ticketTiers && event.ticketTiers.length > 0
    ? Math.min(...event.ticketTiers.map((t) => t.price))
    : 0;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const catStyle = categoryColors[event.category?.toLowerCase()] || categoryColors.other;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex flex-col bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-brand-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1"
    >
      {/* Banner Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Category Pill */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md bg-gradient-to-r ${catStyle}`}
        >
          {event.category}
        </span>

        {/* Featured Tag */}
        {event.featured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/90 text-slate-950 shadow-md">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            Featured
          </span>
        )}

        {/* Date Overlay Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50">
          <Calendar className="w-3.5 h-3.5 text-brand-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* AI Recommendation Reason Tag (if present) */}
          {event.recommendationReason && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">{event.recommendationReason}</span>
            </div>
          )}

          <h3 className="font-bold text-base text-white group-hover:text-brand-300 transition-colors line-clamp-2 mb-2 leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {event.shortDescription || event.description}
          </p>
        </div>

        <div>
          {/* Location / Venue */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              {event.venue?.city ? `${event.venue.city} • ${event.venue.name}` : event.venue?.name}
            </span>
          </div>

          {/* Pricing & Rating Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Starts from</span>
              <span className="text-sm font-extrabold text-white">
                {minPrice === 0 ? (
                  <span className="text-emerald-400">FREE</span>
                ) : (
                  `₹${minPrice.toLocaleString()}`
                )}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{event.averageRating > 0 ? event.averageRating.toFixed(1) : 'New'}</span>
              {event.totalReviews > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">({event.totalReviews})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
