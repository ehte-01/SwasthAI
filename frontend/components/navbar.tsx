'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/auth-context';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    try { await signOut(); } catch (error) { console.error('Error signing out:', error); }
  };

  // Primary nav — always visible on desktop
  const primaryLinks = [
    { href: '/hero', label: 'Home' },
    { href: '/health-check', label: 'Health Check' },
    { href: '/mental-health', label: 'Mental Health' },
    { href: '/3d-lab', label: '3D Lab' },
    { href: '/find-doctor', label: 'Find Doctor' },
  ];

  // Secondary nav — in "More" dropdown
  const moreLinks = [
    { href: '/news-help', label: 'News' },
    { href: '/test-ai', label: 'AI Assistant' },
    { href: '/simple-profile', label: 'My Profile' },
  ];

  const allLinks = [...primaryLinks, ...moreLinks];

  const isActive = (href: string) => pathname === href;
  const isMoreActive = moreLinks.some(l => pathname === l.href);

  const LogoMark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" width="32" height="40">
      <defs>
        <linearGradient id="navTube" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0369a1"/>
        </linearGradient>
        <linearGradient id="navRung" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f97316"/>
        </linearGradient>
      </defs>
      <path d="M28 8 C10 8, 10 30, 28 36 C46 42, 54 46, 54 56 C54 68, 40 76, 33 81 C29 84, 27 88, 27 94"
        fill="none" stroke="url(#navTube)" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M52 8 C70 8, 70 30, 52 36 C34 42, 26 46, 26 56 C26 68, 40 76, 47 81"
        fill="none" stroke="url(#navTube)" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="30" y1="15" x2="50" y2="15" stroke="url(#navRung)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="24" y1="25" x2="56" y2="25" stroke="url(#navRung)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="26" y1="35" x2="54" y2="35" stroke="url(#navRung)" strokeWidth="3" strokeLinecap="round" opacity="0.85"/>
      <line x1="32" y1="45" x2="48" y2="45" stroke="url(#navRung)" strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="32" y1="55" x2="48" y2="55" stroke="url(#navRung)" strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="26" y1="65" x2="54" y2="65" stroke="url(#navRung)" strokeWidth="3" strokeLinecap="round" opacity="0.85"/>
      <circle cx="28" cy="8" r="4.5" fill="#38bdf8"/>
      <circle cx="28" cy="8" r="2" fill="white"/>
      <circle cx="52" cy="8" r="4.5" fill="#38bdf8"/>
      <circle cx="52" cy="8" r="2" fill="white"/>
      <circle cx="27" cy="94" r="7" fill="none" stroke="#38bdf8" strokeWidth="3.5"/>
      <circle cx="27" cy="94" r="3" fill="#fbbf24"/>
    </svg>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a1628]/95 backdrop-blur-xl shadow-2xl shadow-black/40 border-b border-slate-700/50'
          : 'bg-[#0f172a] border-b border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/hero" className="flex items-center gap-2.5 group flex-shrink-0">
              <LogoMark />
              <div className="flex flex-col leading-none">
                <span className="font-bold text-lg text-white tracking-tight">
                  Swasth<span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-widest uppercase font-medium">
                  Healthcare
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {primaryLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* More dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isMoreActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/8'
                  }`}
                >
                  More
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                    {moreLinks.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                          isActive(link.href)
                            ? 'bg-cyan-500/15 text-cyan-400'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/dashboard')
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>

                  {/* User pill */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-slate-300 max-w-[80px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="px-4 py-3 bg-[#0a1628] border-t border-slate-800 space-y-1">
            {allLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-800 pt-3 mt-3 space-y-1">
              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                    <Activity className="h-4 w-4" /> Dashboard
                  </Link>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    {user.email?.split('@')[0]}
                  </div>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="flex px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">Login</Link>
                  <Link href="/auth/signup" className="flex px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
};

export default Navbar;