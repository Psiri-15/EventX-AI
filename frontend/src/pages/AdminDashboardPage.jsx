import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Sparkles,
  Loader2,
  Lock,
  Unlock,
  Check,
  Ban,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'users' | 'bookings'

  // Filter & Search states
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Rejection modal state
  const [rejectingEventId, setRejectingEventId] = useState(null);
  const [rejectReason, setRejectReason] = useState('Does not meet technical guidelines');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes, usersRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/events'),
        api.get('/admin/users'),
        api.get('/admin/bookings'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setCategoryDistribution(statsRes.data.categoryDistribution || []);
      }
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events || []);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load admin platform records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (eventId, status, reason = '') => {
    try {
      setActionLoading(true);
      await api.put(`/admin/events/${eventId}/status`, {
        status,
        rejectionReason: reason,
      });

      // Update state locally
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status } : e))
      );
      setRejectingEventId(null);
    } catch (err) {
      alert(err.message || 'Failed to update event status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (eventId, currentFeatured) => {
    try {
      await api.put(`/admin/events/${eventId}/status`, {
        featured: !currentFeatured,
      });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, featured: !currentFeatured } : e))
      );
    } catch (err) {
      alert(err.message || 'Failed to toggle featured state');
    }
  };

  const handleToggleUserActive = async (userId, currentActive) => {
    try {
      await api.put(`/admin/users/${userId}`, {
        isActive: !currentActive,
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentActive } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const filteredEvents = events.filter((e) => {
    if (eventStatusFilter === 'all') return true;
    return e.status === eventStatusFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const term = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
  });

  const filteredBookings = bookings.filter((b) => {
    if (!bookingSearch.trim()) return true;
    const term = bookingSearch.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(term) ||
      b.user?.name?.toLowerCase().includes(term) ||
      b.event?.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>System Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">EventX AI Admin Center</h1>
        <p className="text-xs text-slate-400">
          Moderate submitted events, manage role governance, and monitor platform-wide bookings.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Platform Users</span>
          <p className="text-2xl font-extrabold text-white">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-slate-500">
            {stats?.attendeesCount || 0} attendees • {stats?.organizersCount || 0} organizers
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Moderation Queue</span>
          <p className="text-2xl font-extrabold text-amber-400">{stats?.pendingEventsCount || 0}</p>
          <p className="text-[11px] text-slate-500">
            {stats?.approvedEventsCount || 0} approved • {stats?.rejectedEventsCount || 0} rejected
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Gross Platform Vol</span>
          <p className="text-2xl font-extrabold text-emerald-400">
            ₹{(stats?.totalPlatformRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">
            {stats?.totalTicketsSold || 0} tickets reserved
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Total Bookings</span>
          <p className="text-2xl font-extrabold text-white">{stats?.totalBookings || 0}</p>
          <p className="text-[11px] text-rose-400">
            {stats?.cancelledBookingsCount || 0} cancelled (₹{(stats?.totalRefundedAmount || 0).toLocaleString()} refunded)
          </p>
        </div>
      </div>

      {/* Category Revenue Distribution Chart */}
      {categoryDistribution.length > 0 && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Gross Ticket Sales by Event Category
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
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
                <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Admin Tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'moderation'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Event Approvals & Moderation ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Governance ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'bookings'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>All Bookings ({bookings.length})</span>
        </button>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Filter:</span>
              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="all">All Events</option>
                <option value="pending">Pending Approval Only</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((e) => (
              <div
                key={e._id}
                className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {e.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        e.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : e.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {e.status}
                    </span>
                    {e.featured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white">{e.title}</h3>
                  <p className="text-xs text-slate-400">
                    Host: <strong>{e.organizer?.name}</strong> ({e.organizer?.email}) •{' '}
                    {new Date(e.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Moderation Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleToggleFeatured(e._id, e.featured)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      e.featured
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {e.featured ? '★ Featured' : '☆ Feature'}
                  </button>

                  {e.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(e._id, 'approved')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}

                  {e.status !== 'rejected' && (
                    <button
                      onClick={() => setRejectingEventId(e._id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: User Governance Directory */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by user name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5 font-bold uppercase text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-400'
                            : u.role === 'organizer'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-brand-500/20 text-brand-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserActive(u._id, u.isActive)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs transition"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: All Bookings Oversight */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, attendee, or event..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Booking Ref</th>
                  <th className="px-5 py-3.5">Attendee</th>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Tickets</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-white">{b.bookingReference}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-white">{b.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{b.user?.email}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-200">{b.event?.title}</td>
                    <td className="px-5 py-3.5">{b.totalQuantity}</td>
                    <td className="px-5 py-3.5 font-bold text-brand-300">₹{b.totalAmount}</td>
                    <td className="px-5 py-3.5 uppercase text-slate-400">{b.payment?.method}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingEventId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Event Rejection Reason</h3>
            <p className="text-xs text-slate-400">Please provide a reason to notify the event organizer.</p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingEventId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(rejectingEventId, 'rejected', rejectReason)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
