import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Building,
  Phone,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const availableInterests = [
  { id: 'technology', label: 'Technology & AI' },
  { id: 'workshops', label: 'Workshops & Labs' },
  { id: 'cultural', label: 'Cultural & Fiestas' },
  { id: 'music', label: 'Concerts & Music' },
  { id: 'sports', label: 'Sports & Esports' },
  { id: 'college', label: 'College Events' },
  { id: 'business', label: 'Startup & Business' },
];

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState(user?.interests || ['technology']);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateProfile({
        name,
        phone,
        organization,
        bio,
        interests,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Account Profile</h1>
        <p className="text-xs text-slate-400">
          Manage your personal information, organization details, and AI event interest preferences.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
        {/* Role & Email badges */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center text-white font-extrabold text-base shadow-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {user?.role}
          </span>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Name</label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
            <User className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Phone Number</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
              <Phone className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Organization / College</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
              <Building className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Tech Club, University, or Company"
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Bio / Profile Headline</label>
          <textarea
            rows={2}
            maxLength={250}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short description about yourself or your organization..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
          />
        </div>

        {/* AI Recommendations Interests */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Recommendation Interest Tags</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => toggleInterest(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                  interests.includes(item.id)
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-brand-500/25 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
