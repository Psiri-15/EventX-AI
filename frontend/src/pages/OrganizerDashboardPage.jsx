import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  Ticket,
  TrendingUp,
  DollarSign,
  QrCode,
  Users,
  PlusCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Scan,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

const OrganizerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [salesByEvent, setSalesByEvent] = useState([]);
  const [revenueTimeline, setRevenueTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'scanner' | 'attendees'

  // Scanner state
  const [ticketInputCode, setTicketInputCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [gateName, setGateName] = useState('Main Entrance');

  // Attendee list state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/organizer/stats'),
        api.get('/organizer/events'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setSalesByEvent(statsRes.data.salesByEvent || []);
        setRevenueTimeline(statsRes.data.revenueChartData || []);
      }

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events || []);
        if (eventsRes.data.events?.length > 0 && !selectedEventId) {
          setSelectedEventId(eventsRes.data.events[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load organizer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  // Fetch attendees when selected event changes or when switching to attendees tab
  useEffect(() => {
    if (selectedEventId && activeTab === 'attendees') {
      const fetchAttendees = async () => {
        try {
          setAttendeesLoading(true);
          const res = await api.get(`/organizer/events/${selectedEventId}/attendees`);
          if (res.data.success) {
            setAttendees(res.data.tickets || []);
          }
        } catch (err) {
          console.error('Failed to load attendees:', err);
        } finally {
          setAttendeesLoading(false);
        }
      };
      fetchAttendees();
    }
  }, [selectedEventId, activeTab]);

  const handleValidateTicket = async (e) => {
    e?.preventDefault();
    if (!ticketInputCode.trim()) return;

    try {
      setValidationLoading(true);
      setValidationResult(null);

      const res = await api.post('/tickets/validate', {
        ticketCode: ticketInputCode.trim(),
      });

      setValidationResult(res.data);
    } catch (err) {
      setValidationResult({
        isValid: false,
        message: err.message || 'Ticket validation rejected.',
      });
    } finally {
      setValidationLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!validationResult?.ticket?.ticketCode) return;

    try {
      setCheckInLoading(true);
      const res = await api.post('/tickets/check-in', {
        ticketCode: validationResult.ticket.ticketCode,
        gate: gateName,
      });

      if (res.data.success) {
        setValidationResult({
          isValid: true,
          checkedInSuccess: true,
          message: res.data.message,
          ticket: res.data.ticket,
        });
        setTicketInputCode('');
      }
    } catch (err) {
      setValidationResult((prev) => ({
        ...prev,
        message: err.message || 'Check-in failed.',
      }));
    } finally {
      setCheckInLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((t) => {
    if (!attendeeSearch.trim()) return true;
    const term = attendeeSearch.toLowerCase();
    return (
      t.user?.name?.toLowerCase().includes(term) ||
      t.user?.email?.toLowerCase().includes(term) ||
      t.ticketCode?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Host Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Organizer Dashboard</h1>
          <p className="text-xs text-slate-400">Monitor sales performance, manage listings, and scan gate passes.</p>
        </div>
        <Link
          to="/create-event"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-brand-500/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Event</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Events</span>
            <Calendar className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalEvents || 0}</p>
          <p className="text-[11px] text-slate-500">
            {stats?.upcomingEvents || 0} upcoming • {stats?.completedEvents || 0} completed
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Tickets Sold</span>
            <Ticket className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalTicketsSold || 0}</p>
          <p className="text-[11px] text-emerald-400 font-semibold">Across active categories</p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Verified payment orders</p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Gate Scanner</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">Active</p>
          <button
            onClick={() => setActiveTab('scanner')}
            className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
          >
            Launch QR Validator →
          </button>
        </div>
      </div>

      {/* Analytics Chart */}
      {salesByEvent.length > 0 && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ticket Sales by Event
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByEvent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="title" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="ticketsSold" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Tickets Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'events'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'scanner'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>QR Ticket Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('attendees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'attendees'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Attendee Directory</span>
        </button>
      </div>

      {/* Tab 1: My Events Listing */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400 mb-4">You haven't created any events yet.</p>
              <Link to="/create-event" className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl">
                Create First Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e) => (
                <div
                  key={e._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {e.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          e.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : e.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base line-clamp-1">{e.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(e.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Capacity:</span>
                      <span className="font-bold text-white">{e.totalCapacity}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tickets Sold:</span>
                      <span className="font-bold text-brand-300">{e.totalSold || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to={`/events/${e._id}`}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-center rounded-xl text-xs font-semibold transition"
                    >
                      View Live Page
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedEventId(e._id);
                        setActiveTab('attendees');
                      }}
                      className="flex-1 py-2 bg-brand-600/30 hover:bg-brand-600 text-brand-200 hover:text-white text-center rounded-xl text-xs font-semibold transition"
                    >
                      Attendees
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: QR Ticket Scanner & Gate Validator */}
      {activeTab === 'scanner' && (
        <div className="max-w-xl mx-auto p-8 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-2">
              <Scan className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-white">QR Gate Check-In Validator</h2>
            <p className="text-xs text-slate-400">Scan or paste ticket code to verify access eligibility.</p>
          </div>

          <form onSubmit={handleValidateTicket} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Ticket Code / Scanned QR Payload
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticketInputCode}
                  onChange={(e) => setTicketInputCode(e.target.value)}
                  placeholder="e.g. TKT-ALEX-... or JSON payload"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={validationLoading || !ticketInputCode.trim()}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shrink-0"
                >
                  {validationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gate / Entry Point</label>
              <input
                type="text"
                value={gateName}
                onChange={(e) => setGateName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </form>

          {/* Validation Result Box */}
          {validationResult && (
            <div
              className={`p-5 rounded-2xl border text-xs space-y-3 animate-in zoom-in-95 duration-150 ${
                validationResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {validationResult.isValid ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>

              {validationResult.ticket && (
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-slate-200">
                  <p><strong>Attendee:</strong> {validationResult.ticket.attendeeName || validationResult.ticket.user?.name}</p>
                  <p><strong>Tier:</strong> {validationResult.ticket.ticketTierName}</p>
                  <p><strong>Event:</strong> {validationResult.ticket.eventTitle || validationResult.ticket.event?.title}</p>
                  <p><strong>Code:</strong> <span className="font-mono">{validationResult.ticket.ticketCode}</span></p>
                </div>
              )}

              {/* Confirm Check-In CTA Button */}
              {validationResult.isValid && !validationResult.checkedInSuccess && (
                <button
                  type="button"
                  onClick={handleConfirmCheckIn}
                  disabled={checkInLoading}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  {checkInLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Check-In at Gate'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Attendee Directory */}
      {activeTab === 'attendees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase">Select Event:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                {events.map((e) => (
                  <option key={e._id} value={e._id}>{e.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search attendee by name/code..."
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {attendeesLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : filteredAttendees.length > 0 ? (
            <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Attendee</th>
                    <th className="px-5 py-3.5">Tier</th>
                    <th className="px-5 py-3.5">Ticket Code</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Gate Check-in Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAttendees.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-white">{t.user?.name}</p>
                        <p className="text-[11px] text-slate-400">{t.user?.email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-brand-300">{t.ticketTierName}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">{t.ticketCode}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'checked_in'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : t.status === 'valid'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {t.checkInDetails?.checkedInAt
                          ? new Date(t.checkInDetails.checkedInAt).toLocaleString()
                          : 'Not checked in yet'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400 text-xs">No registered attendees found for this event.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboardPage;
