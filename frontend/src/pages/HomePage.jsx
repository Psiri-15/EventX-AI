import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import {
  Sparkles,
  Search,
  Calendar,
  Ticket,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  CheckCircle,
  Cpu,
  Layers,
  Users,
} from 'lucide-react';

const categoriesList = [
  { id: 'technology', name: 'Technology & AI', icon: '💻', count: 'Summit, Hackathons & Cloud' },
  { id: 'workshops', name: 'Workshops & Labs', icon: '🛠️', count: 'Robotics, Design & Hands-on' },
  { id: 'cultural', name: 'Cultural Fiestas', icon: '🎭', count: 'College Fests, Art & Drama' },
  { id: 'music', name: 'Concerts & Music', icon: '🎵', count: 'Symphonies, Live Bands & Indie' },
  { id: 'sports', name: 'Sports & Esports', icon: '🏆', count: 'Tournaments & Athletics' },
  { id: 'business', name: 'Startup & Business', icon: '🚀', count: 'Pitch Arenas & Networking' },
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch featured events
        const featRes = await api.get('/events/featured');
        if (featRes.data.success) {
          setFeaturedEvents(featRes.data.events || []);
        }

        // Fetch AI recommendations
        const recRes = await api.get('/ai/recommendations?limit=4');
        if (recRes.data.success) {
          setRecommendedEvents(recRes.data.recommendations || []);
        }
      } catch (err) {
        console.error('Failed to load home events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [isAuthenticated]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append('search', searchKeyword.trim());
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Background ambient glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>AI-Powered Event Discovery & Concurrency Ticketing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Experience Events That <br />
            <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-brand-200 bg-clip-text text-transparent">
              Inspire Tomorrow
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-10">
            Intelligent recommendations tailored to your passions. Lock in tickets with atomic concurrency guarantees and check in seamlessly with cryptographic QR digital passes.
          </p>

          {/* Search Box Card */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-3xl mx-auto p-2 sm:p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search summits, hackathons, concerts, workshops..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="sm:w-48 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Categories</option>
                <option value="technology" className="bg-slate-900 text-white">Technology & AI</option>
                <option value="workshops" className="bg-slate-900 text-white">Workshops</option>
                <option value="cultural" className="bg-slate-900 text-white">Cultural & Arts</option>
                <option value="music" className="bg-slate-900 text-white">Concerts & Music</option>
                <option value="sports" className="bg-slate-900 text-white">Sports & Esports</option>
                <option value="business" className="bg-slate-900 text-white">Startup & Business</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Key Metrics Counters */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">8,500+</p>
              <p className="text-xs text-slate-400 font-medium">Tickets Reserved</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-400">100%</p>
              <p className="text-xs text-slate-400 font-medium">Zero Overselling</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-accent-cyan">&lt; 0.5s</p>
              <p className="text-xs text-slate-400 font-medium">QR Gate Validation</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">4.9 / 5</p>
              <p className="text-xs text-slate-400 font-medium">Attendee Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Personalized Recommendations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Intelligent Recommendations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isAuthenticated ? `Curated for You, ${user?.name}` : 'Trending & High-Affinity Events'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Derived from interest vectors, sales velocity, and community reviews.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
          >
            <span>View all live events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-slate-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recommendedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No events available right now.</p>
        )}
      </section>

      {/* Featured Events Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>Editor's Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Global Highlights</h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            <span>Explore all categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </section>

      {/* Category Explorer Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Explore by Category</h2>
          <p className="text-xs text-slate-400">
            From technical summits and competitive hackathons to acoustic concerts and college fests.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              to={`/events?category=${cat.id}`}
              className="p-5 bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/60 hover:border-brand-500/50 rounded-2xl text-center transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/10"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-brand-300 transition">{cat.name}</h4>
              <p className="text-[10px] text-slate-400 line-clamp-1">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Enterprise Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40 border border-slate-700/80 rounded-3xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Cryptographic QR Passes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unique tamper-evident ticket codes with high-density QR matrices. Organizers scan and validate entry in under half a second with anti-reuse protection.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Atomic Concurrency Safety</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engineered with MongoDB transactional atomic tier decrements. Prevents overselling and race conditions when hundreds of users book seats simultaneously.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Role-Specific Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated dashboards for Attendees, Organizers, and Platform Admins featuring live sales velocity, revenue trends, and event moderation workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Host CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 bg-gradient-to-r from-brand-900 via-brand-950 to-slate-950 border border-brand-500/30 rounded-3xl text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Organizing a Conference, Fest, or Workshop?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Publish events with custom tier pricing, track ticket orders in real time, and scan attendees at the entrance using any smartphone or webcam.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to={isAuthenticated ? '/create-event' : '/register?role=organizer'}
                className="px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs transition shadow-xl"
              >
                Host an Event Today
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold transition"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
