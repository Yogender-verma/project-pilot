'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Compass, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/lib/ThemeProvider';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { signOut } = useClerk();
  const { isAuthenticated, logout } = useAppStore();
  // Theme toggle available on the marketing navbar as well
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    logout();
    setIsOpen(false);
    try { await signOut(); } catch(e) {}
    router.push('/');
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'AI Workflow', href: '#workflow' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' }
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full glass-panel border-b backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--background) 70%, transparent)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group relative">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <span
              className="text-xl font-bold tracking-wider select-none"
              style={{ color: 'var(--text-primary)' }}
            >
              ProjectPilot <span className="text-indigo-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm hover:text-indigo-400 transition-colors duration-200 relative group font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle — available on the marketing page too */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-2 rounded-xl border transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-400" />
              }
            </button>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="glow" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="premium" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-2 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5 text-indigo-400" />
              }
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 focus:outline-none cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t glass-panel overflow-hidden"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-base font-semibold px-3 py-2 rounded-xl transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link.name}
                </a>
              ))}
              <div
                className="border-t pt-4 flex flex-col space-y-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="glow" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button variant="premium" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
