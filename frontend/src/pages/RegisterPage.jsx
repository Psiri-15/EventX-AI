import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tag,
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(searchParams.get('role') === 'organizer' ? 'organizer' : 'attendee');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedInterests, setSelectedInterests] = useState(['technology', 'workshops']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const user = await register({
        name,
        email,
        password,
        role,
        organization: role === 'organizer' ? organization : '',
        phone,
        interests: selectedInterests,
      });

      if (user.role === 'organizer') {
        navigate('/organizer');
      } else {
        navigate('/events');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Join EventX AI</h1>
          <p className="text-xs text-slate-400">Create your account to discover or host premier events.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Switcher */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">I want to:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('attendee')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  role === 'attendee'
                    ? 'bg-brand-600 text-white border-brand-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                Attend Events
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  role === 'organizer'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                Host / Organize Events
              </button>
            </div>
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
                placeholder="Alex Johnson"
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email Address</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Password</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {role === 'organizer' && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Organization / Brand</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
                <Building className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Apex Tech Club"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Interests selection for AI recommendations */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Personalize AI Recommendations (Select Interests)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableInterests.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                    selectedInterests.includes(item.id)
                      ? 'bg-brand-600/30 text-brand-200 border-brand-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
