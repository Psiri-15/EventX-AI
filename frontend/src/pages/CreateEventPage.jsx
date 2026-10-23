import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const bannerPresets = [
  { name: 'Tech Conference', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Hackathon / Coding', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cultural Fest', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Concert & Music', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Workshop & Hardware', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80' },
];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('technology');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bannerImage, setBannerImage] = useState(bannerPresets[0].url);

  // Venue
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('Bengaluru');

  // Ticket Tiers
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Admission', price: 499, capacity: 150, description: 'Standard entry with full access' },
    { name: 'VIP Pass', price: 1499, capacity: 40, description: 'Priority seating and refreshments' },
  ]);

  // Tags
  const [tagInput, setTagInput] = useState('technology, ai, summit');

  // Policy
  const [cutoffHours, setCutoffHours] = useState(24);
  const [refundPercentage, setRefundPercentage] = useState(100);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAddTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      { name: 'Tier ' + (prev.length + 1), price: 299, capacity: 50, description: '' },
    ]);
  };

  const handleRemoveTier = (index) => {
    if (ticketTiers.length === 1) return;
    setTicketTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index, field, value) => {
    setTicketTiers((prev) => {
      const updated = [...prev];
      updated[index][field] = field === 'price' || field === 'capacity' ? Number(value) : value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const tags = tagInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

      const payload = {
        title,
        shortDescription,
        description,
        category,
        date: new Date(date),
        endDate: new Date(endDate || date),
        venue: {
          name: venueName,
          address: venueAddress,
          city: venueCity,
        },
        bannerImage,
        ticketTiers,
        tags,
        cancellationPolicy: {
          allowed: true,
          cutoffHours: Number(cutoffHours),
          refundPercentage: Number(refundPercentage),
        },
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => {
          navigate('/organizer');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Create & Publish Event</h1>
        <p className="text-xs text-slate-400">
          Configure event details, ticket categories, capacity, pricing, and submission for admin review.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">General Information</h2>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI & Robotics Global Summit 2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="technology">Technology & AI</option>
                <option value="workshops">Workshops & Labs</option>
                <option value="cultural">Cultural & Arts</option>
                <option value="music">Concerts & Music</option>
                <option value="sports">Sports & Esports</option>
                <option value="college">College Events</option>
                <option value="business">Startup & Business</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="ai, python, robotics"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Short Summary (Headline) *</label>
            <input
              type="text"
              required
              maxLength={200}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-2 sentence overview for cards and discovery..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Description & Schedule *</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive agenda, keynote speakers, prerequisite knowledge..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Schedule & Venue */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Date & Venue Logistics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Venue / Auditorium Name *</label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Nimhans Convention Centre"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Street Address</label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Hosur Road, Lakkasandra"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">City *</label>
              <input
                type="text"
                required
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Banner Image Selection */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Banner Artwork</h2>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Image URL</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none mb-2"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 text-xs self-center">Presets:</span>
            {bannerPresets.map((bp, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setBannerImage(bp.url)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-[11px]"
              >
                {bp.name}
              </button>
            ))}
          </div>

          {bannerImage && (
            <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-slate-800 mt-2">
              <img src={bannerImage} alt="Banner preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Ticket Tiers Builder */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ticket Categories & Inventory</h2>
              <p className="text-xs text-slate-400">Configure tier names, prices (₹0 for free), and capacity limits.</p>
            </div>
            <button
              type="button"
              onClick={handleAddTier}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/30 hover:bg-brand-600 text-brand-200 hover:text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="space-y-3">
            {ticketTiers.map((tier, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tier Name</label>
                  <input
                    type="text"
                    required
                    value={tier.name}
                    onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                    placeholder="e.g. Student Pass"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={tier.price}
                    onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={tier.capacity}
                    onChange={(e) => handleTierChange(idx, 'capacity', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end pt-4 md:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    disabled={ticketTiers.length === 1}
                    className="p-2 text-rose-400 hover:text-rose-300 disabled:opacity-30"
                    title="Remove Tier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cancellation & Refund Policy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cutoff Time (Hours before event)</label>
              <input
                type="number"
                value={cutoffHours}
                onChange={(e) => setCutoffHours(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Refund Percentage (%)</label>
              <input
                type="number"
                max={100}
                min={0}
                value={refundPercentage}
                onChange={(e) => setRefundPercentage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/organizer')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-xl shadow-brand-500/25 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
