import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Calendar,
  MapPin,
  Tag,
  Loader2,
  Sparkles,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'technology', label: 'Technology & AI' },
  { id: 'workshops', label: 'Workshops & Labs' },
  { id: 'cultural', label: 'Cultural & Fests' },
  { id: 'music', label: 'Concerts & Music' },
  { id: 'sports', label: 'Sports & Esports' },
  { id: 'college', label: 'College Events' },
  { id: 'business', label: 'Startup & Business' },
];

const cities = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'];

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || 'All Cities');
  const [sortBy, setSortBy] = useState('date');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const [events, setEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch events based on current query parameters
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category && category !== 'all') params.append('category', category);
      if (city && city !== 'All Cities') params.append('city', city);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.data.success) {
        setEvents(res.data.events || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize state when URL search parameters change (e.g. from homepage category cards or search)
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategory(urlCategory);
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearch(urlSearch);
    const urlCity = searchParams.get('city');
    if (urlCity) setCity(urlCity);
    const urlMaxPrice = searchParams.get('maxPrice');
    if (urlMaxPrice !== null) setMaxPrice(urlMaxPrice);
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [category, city, sortBy, maxPrice, page, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }

    setPage(1);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setCity('All Cities');
    setSortBy('date');
    setMaxPrice('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Discover Live Events</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Find and reserve verified seats for technology summits, cultural fests, workshops, and concerts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-4">
        {/* Search input + Sort selector */}
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-slate-800/70 border border-slate-700/60 rounded-xl">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event name, keyword, or speaker..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition shrink-0"
            >
              Search
            </button>
          </form>

          {/* Sort By */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl shrink-0">
            <span className="text-[11px] font-bold uppercase text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="date" className="bg-slate-900 text-white">Upcoming Date</option>
              <option value="popularity" className="bg-slate-900 text-white">Most Popular</option>
              <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
              <option value="newest" className="bg-slate-900 text-white">Newly Listed</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 text-xs transition shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setPage(1);
              }}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition border ${category === cat.id
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white border-slate-700/60 hover:bg-slate-800'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter Line (City & Max Price) */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">City:</span>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Max Budget:</span>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="ml-auto text-slate-400 text-xs">
            Showing <span className="font-bold text-white">{events.length}</span> of <span className="font-bold text-white">{totalCount}</span> events
          </div>
        </div>
      </div>

      {/* Events Results Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 text-xs">Loading verified event listings...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-2xl max-w-lg mx-auto">
          <p className="text-base font-semibold text-white mb-2">No matching events found</p>
          <p className="text-xs text-slate-400 mb-6">
            Try adjusting your category, city filter, or price limit to see more listings.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
