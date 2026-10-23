import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Cpu, ExternalLink, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-white">EventX <span className="text-brand-400">AI</span></span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Next-generation intelligent event management and ticket reservation platform. Built with MongoDB, Express, React, Node.js, and AI automation.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <Cpu className="w-4 h-4" />
              <span>College Final-Year CSE Capstone</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Explore Events</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events?category=technology" className="hover:text-white transition">Technology & AI</Link>
              </li>
              <li>
                <Link to="/events?category=workshops" className="hover:text-white transition">Workshops & Bootcamps</Link>
              </li>
              <li>
                <Link to="/events?category=cultural" className="hover:text-white transition">Cultural & College Fiestas</Link>
              </li>
              <li>
                <Link to="/events?category=music" className="hover:text-white transition">Concerts & Symphonies</Link>
              </li>
              <li>
                <Link to="/events?category=sports" className="hover:text-white transition">Sports & Esports</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Platform Roles</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events" className="hover:text-white transition">Attendee Discovery</Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-white transition">Digital QR Tickets</Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-white transition">Organizer Dashboard</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">Admin Moderation</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Account Access</Link>
              </li>
            </ul>
          </div>

          {/* Security & Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Architecture</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>JWT Authentication & bcrypt</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent-cyan" />
                <span>Atomic Concurrency Reservation</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Contextual AI Recommendations</span>
              </div>
              <p className="pt-2 text-[11px] text-slate-500">
                Demo payment mode active. Full Razorpay test keys supported via .env.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} EventX AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Engineered with modern Full-Stack MERN Architecture
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
