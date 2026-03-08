'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/auth-context';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try { await signOut(); } catch (error) { console.error('Error signing out:', error); }
  };

  const navLinks = [
    { href: '/hero', label: 'Home', isActive: pathname === '/hero' || pathname === '/' },
    { href: '/health-check', label: 'Health Check', isActive: pathname === '/health-check' },
    { href: '/mental-health', label: 'Mental Health', isActive: pathname === '/mental-health' },
    { href: '/3d-lab', label: '3D Lab', isActive: pathname === '/3d-lab' },
    { href: '/find-doctor', label: 'Find Doctor', isActive: pathname === '/find-doctor' },
    { href: '/news-help', label: 'News', isActive: pathname === '/news-help' },
    { href: '/test-ai', label: 'AI Assistant', isActive: pathname === '/test-ai' },
    { href: '/simple-profile', label: 'My Profile', isActive: pathname === '/simple-profile' },
  ];

  const LinkComponent = ({ href, children, className, isActive }) => (
    <Link
      href={href}
      className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 transform hover:scale-105 ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-indigo-600/90 text-white shadow-2xl shadow-blue-500/40 backdrop-blur-sm border border-white/20'
          : 'text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/20'
      } ${className}`}
    >
      {children}
      {isActive && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl animate-pulse opacity-30" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
        </>
      )}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-300" />
    </Link>
  );

  // ── SwasthAI Logo Mark (Stethoscope + DNA) ──────────────────────────────────
  const LogoMark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" width="38" height="48">
      <defs>
        <linearGradient id="navTube" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0369a1"/>
        </linearGradient>
        <linearGradient id="navRung" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f97316"/>
        </linearGradient>
        <filter id="navGlow">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Left strand */}
      <path d="M28 8 C10 8, 10 30, 28 36 C46 42, 54 46, 54 56 C54 68, 40 76, 33 81 C29 84, 27 88, 27 94"
        fill="none" stroke="url(#navTube)" strokeWidth="4.5" strokeLinecap="round" filter="url(#navGlow)"/>
      {/* Right strand */}
      <path d="M52 8 C70 8, 70 30, 52 36 C34 42, 26 46, 26 56 C26 68, 40 76, 47 81"
        fill="none" stroke="url(#navTube)" strokeWidth="4.5" strokeLinecap="round" filter="url(#navGlow)"/>

      {/* DNA rungs */}
      <line x1="30" y1="15" x2="50" y2="15" stroke="url(#navRung)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="24" y1="25" x2="56" y2="25" stroke="url(#navRung)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="26" y1="35" x2="54" y2="35" stroke="url(#navRung)" strokeWidth="3" strokeLinecap="round" opacity="0.85"/>
      <line x1="32" y1="45" x2="48" y2="45" stroke="url(#navRung)" strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="32" y1="55" x2="48" y2="55" stroke="url(#navRung)" strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="26" y1="65" x2="54" y2="65" stroke="url(#navRung)" strokeWidth="3" strokeLinecap="round" opacity="0.85"/>
      <line x1="24" y1="75" x2="50" y2="75" stroke="url(#navRung)" strokeWidth="3.5" strokeLinecap="round"/>

      {/* Ear tips */}
      <circle cx="28" cy="8" r="4.5" fill="#38bdf8" filter="url(#navGlow)"/>
      <circle cx="28" cy="8" r="2" fill="white"/>
      <circle cx="52" cy="8" r="4.5" fill="#38bdf8" filter="url(#navGlow)"/>
      <circle cx="52" cy="8" r="2" fill="white"/>

      {/* Chest piece */}
      <circle cx="27" cy="94" r="7" fill="none" stroke="#38bdf8" strokeWidth="3.5" filter="url(#navGlow)"/>
      <circle cx="27" cy="94" r="3" fill="#fbbf24" filter="url(#dotGlow)"/>
    </svg>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b-2 border-slate-700 shadow-2xl shadow-black/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute -top-40 -left-32 w-80 h-80 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* ── LOGO ── */}
            <Link href="/hero" className="flex items-center space-x-3 group relative">
              <div className="relative transform group-hover:scale-105 transition-all duration-300">
                <LogoMark />
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-all duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-indigo-300 transition-all duration-500">
                  Swasth<span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] text-blue-200/60 font-semibold tracking-[3px] uppercase">
                  Healthcare Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <LinkComponent key={link.href} href={link.href} isActive={link.isActive} className="flex items-center space-x-2">
                  <span>{link.label}</span>
                </LinkComponent>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <LinkComponent href="/dashboard" isActive={pathname === '/dashboard'} className="flex items-center space-x-2">
                    <span>Dashboard</span>
                  </LinkComponent>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.email?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-300">{user.email?.split('@')[0] || 'User'}</span>
                  </div>
                  <button onClick={handleSignOut}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 hover:text-red-300 transition-colors duration-200 flex items-center space-x-2 border border-red-500/30">
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <LinkComponent href="/auth/login" isActive={false} className="flex items-center space-x-2">
                    <span>Login</span>
                  </LinkComponent>
                  <Link href="/auth/signup"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-blue-500/25">
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition-colors duration-200 border border-slate-700/50">
              <div className="w-5 h-5 relative">
                <div className={`absolute w-full h-0.5 bg-slate-300 transition-all duration-300 ${isMenuOpen ? 'top-2 rotate-45' : 'top-1'}`} />
                <div className={`absolute top-2 w-full h-0.5 bg-slate-300 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <div className={`absolute w-full h-0.5 bg-slate-300 transition-all duration-300 ${isMenuOpen ? 'top-2 -rotate-45' : 'top-3'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 bg-[#0f172a] backdrop-blur-md border-t-2 border-slate-700 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  link.isActive ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800/50 hover:text-blue-400'
                }`}>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            <div className="border-t border-slate-700/50 pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user.email?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{user.email?.split('@')[0] || 'User'}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 rounded-lg transition-colors">
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <button onClick={handleSignOut} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 rounded-lg transition-colors">
                    <span className="font-medium">Login</span>
                  </Link>
                  <Link href="/auth/signup" className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow-lg">
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-20" />
    </>
  );
};

export default Navbar;