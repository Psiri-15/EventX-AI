import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Sparkles,
  Ticket,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  CheckCheck,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000); // Poll every 25s for live updates
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // ignore
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        // ignore
      }
    }
    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const roleBadgeColor = {
    admin: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    organizer: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    attendee: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
  }[user?.role || 'attendee'];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                  EventX
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Intelligent Ticketing</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === '/events'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Discover Events
            </Link>

            {isAuthenticated && user?.role === 'attendee' && (
              <>
                <Link
                  to="/my-tickets"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/my-tickets'
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-brand-400" />
                  My Tickets
                </Link>
                <Link
                  to="/my-bookings"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/my-bookings'
                      ? 'text-white bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-accent-cyan" />
                  Bookings
                </Link>
              </>
            )}

            {isAuthenticated && (user?.role === 'organizer' || user?.role === 'admin') && (
              <Link
                to="/organizer"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname.startsWith('/organizer')
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                Organizer Portal
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/admin'
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Admin Center
              </Link>
            )}
          </nav>

          {/* Right Header Action Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Create Event CTA for Organizers / Admins */}
                {(user?.role === 'organizer' || user?.role === 'admin') && (
                  <Link
                    to="/create-event"
                    className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition"
                  >
                    <PlusCircle className="w-4 h-4 text-brand-400" />
                    Create Event
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="relative p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Drawer */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 cursor-pointer transition text-left hover:bg-slate-800/50 ${
                                !notif.isRead ? 'bg-brand-950/20 border-l-2 border-brand-500' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-white">{notif.title}</p>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                  {new Date(notif.createdAt).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar & Menu */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition group"
                  >
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.name}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{user?.role}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
                  </button>

                  {/* User Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <span className={`inline-block mt-1.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                      >
                        <User className="w-4 h-4 text-brand-400" />
                        Account Profile
                      </Link>

                      {user?.role === 'attendee' && (
                        <>
                          <Link
                            to="/my-tickets"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                          >
                            <Ticket className="w-4 h-4 text-accent-emerald" />
                            My QR Tickets
                          </Link>
                          <Link
                            to="/my-bookings"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                          >
                            <Calendar className="w-4 h-4 text-accent-cyan" />
                            Booking History
                          </Link>
                        </>
                      )}

                      {(user?.role === 'organizer' || user?.role === 'admin') && (
                        <Link
                          to="/organizer"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-400" />
                          Organizer Dashboard
                        </Link>
                      )}

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-rose-400" />
                          Platform Admin
                        </Link>
                      )}

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition shadow-md shadow-brand-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800/70 text-slate-300 hover:text-white border border-slate-700/60"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1.5 backdrop-blur-xl">
          <Link
            to="/events"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Discover Events
          </Link>
          {isAuthenticated && (
            <>
              {user?.role === 'attendee' && (
                <>
                  <Link
                    to="/my-tickets"
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    My QR Tickets
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Booking History
                  </Link>
                </>
              )}
              {(user?.role === 'organizer' || user?.role === 'admin') && (
                <Link
                  to="/organizer"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Organizer Portal
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Admin Center
                </Link>
              )}
              <Link
                to="/profile"
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Profile Settings
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
