import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X, LogOut, User, ChevronRight } from 'lucide-react'
import { supabase } from '../supabaseClient'
import Preloader from './Preloader'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout({ children }) {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLightBg, setIsLightBg] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Track user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        setProfile(data)
      })
    } else {
      setProfile(null)
    }
  }, [user])

  // Close dropdown on route change or click outside
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // If click was outside dropdown and not on the O button
        const oButton = document.getElementById('o-menu-button')
        if (oButton && !oButton.contains(event.target)) {
          setIsMenuOpen(false)
        }
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  // Ref to track last luminance category — prevents flickering/premature color change
  const lastBgCategoryRef = useRef(null) // 'light' | 'dark' | null

  // Track scroll position & precise background contrast adaptation
  // Color only changes when actual background luminance crosses the threshold
  useEffect(() => {
    const detectBg = () => {
      // Sample multiple points across the top-left area where the O button sits
      const samplePoints = [
        [60, 60], [45, 45], [75, 45], [45, 75], [75, 75],
      ]
      let totalLuminance = 0
      let validSamples = 0

      for (const [x, y] of samplePoints) {
        const elementAtPoint = document.elementFromPoint(x, y)
        if (!elementAtPoint) continue
        let el = elementAtPoint
        while (el && el !== document.body) {
          const comp = window.getComputedStyle(el)
          const bg = comp.backgroundColor
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            const rgbMatch = bg.match(/\d+/g)
            if (rgbMatch && rgbMatch.length >= 3) {
              const r = parseInt(rgbMatch[0], 10)
              const g = parseInt(rgbMatch[1], 10)
              const b = parseInt(rgbMatch[2], 10)
              const a = rgbMatch[3] !== undefined ? parseFloat(rgbMatch[3]) : 1
              if (a > 0.25) {
                totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b
                validSamples++
                break
              }
            }
          }
          el = el.parentElement
        }
      }

      if (validSamples > 0) {
        const avgLuminance = totalLuminance / validSamples
        // Use hysteresis: dark->light threshold at 175, light->dark threshold at 155
        // This prevents rapid toggling at boundary areas
        const currentCategory = lastBgCategoryRef.current
        let newCategory = currentCategory
        if (currentCategory !== 'light' && avgLuminance > 175) {
          newCategory = 'light'
        } else if (currentCategory !== 'dark' && avgLuminance < 155) {
          newCategory = 'dark'
        }
        // Only update state when the category actually changes
        if (newCategory !== currentCategory) {
          lastBgCategoryRef.current = newCategory
          setIsLightBg(newCategory === 'light')
        }
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      detectBg()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Run once on mount / route change to set initial state
    detectBg()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Renamed navigation links as requested
  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'DIRECTORY', path: '/directory' },
    { name: 'COUNCIL', path: '/council' },
    { name: 'EVENTS', path: '/events' },
    { name: 'STORIES', path: '/news' },
    { name: 'MEMORIES', path: '/gallery' },
    { name: 'SCHOLARSHIPS', path: '/scholarships' },
    { name: 'CAREERS', path: '/careers' },
  ]

  if (user) {
    navLinks.push({ name: 'SOCIAL FEED', path: '/feed' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07131D] text-[#F5F0E7]">
      <Preloader />

      {/* =====================================================
          1. FULL FLOATING LIQUID GLASS NAVBAR (AT PAGE TOP)
          ===================================================== */}
      <AnimatePresence>
        {!scrolled && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="sticky top-4 z-40 px-4 w-full flex justify-center pointer-events-auto"
          >
            <div className="flex items-center justify-between h-14 sm:h-16 px-6 sm:px-8 max-w-fit mx-auto bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] bg-gradient-to-r from-white/[0.1] via-white/[0.04] to-white/[0.1] gap-6 sm:gap-8">

              {/* OXAR Wordmark */}
              <Link to="/" className="flex items-center group pr-4 sm:pr-6 border-r border-white/15">
                <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F0E7] group-hover:text-[#C9A35B] group-hover:scale-110 transition-all duration-200 inline-block">
                  OXAR
                </span>
              </Link>

              {/* Desktop Links with Hover Magnification */}
              <nav className="hidden xl:flex items-center space-x-5 sm:space-x-6">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`font-ui text-xs uppercase tracking-[0.16em] transition-all duration-200 py-1 inline-block hover:scale-110 origin-center ${
                        isActive
                          ? 'text-[#C9A35B] font-semibold border-b border-[#C9A35B]'
                          : 'text-[#F5F0E7]/80 hover:text-[#F5F0E7]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Action Buttons */}
              <div className="hidden lg:flex items-center space-x-4 pl-2 sm:pl-4 border-l border-white/15">
                {user ? (
                  <div className="flex items-center space-x-4">
                    {profile?.is_admin && (
                      <Link
                        to="/admin"
                        className="font-ui text-xs uppercase tracking-widest text-[#C9A35B] hover:text-[#E2C98D] hover:scale-110 transition-all inline-block"
                      >
                        Admin
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-xs font-ui text-[#F5F0E7]/80 hover:text-[#C9A35B] hover:scale-105 transition-all inline-block"
                    >
                      <User className="h-4 w-4 text-[#C9A35B]" />
                      <span>{profile?.full_name || 'My Profile'}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-xs font-ui text-red-400 hover:text-red-300 hover:scale-105 transition-all inline-block"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="font-ui text-xs font-medium uppercase tracking-[0.2em] text-[#F5F0E7]/80 hover:text-[#C9A35B] hover:scale-110 transition-all inline-block px-2 py-1"
                    >
                      LOGIN
                    </Link>

                    <Link
                      to="/join"
                      className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#07131D] bg-[#C9A35B] hover:bg-[#E2C98D] hover:scale-110 rounded-xl transition-all shadow-md shadow-[#C9A35B]/20"
                    >
                      JOIN
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* =====================================================
          2. FLOATING LEFT "O" CIRCLE BUTTON (APPEARS ON SCROLL)
          ===================================================== */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-6 left-6 sm:left-10 z-50 pointer-events-auto"
          >
            <button
              id="o-menu-button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              title="Open OXAR Dropdown Menu"
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${
                isLightBg
                  // Light background: white/ivory fill, thin dark border, dark text — matches image 2
                  ? 'bg-[#F8F5F0] border border-[#1a1a1a] shadow-[0_2px_12px_rgba(0,0,0,0.15)]'
                  // Dark background: dark navy semi-transparent, thin white border, white text — matches image 1
                  : 'bg-[#07131D]/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
              }`}
            >
              <span
                className={`font-editorial text-xl sm:text-2xl font-bold tracking-tight transition-colors leading-none ${
                  isLightBg
                    ? 'text-[#1a1a1a]'
                    : 'text-[#F5F0E7] group-hover:text-[#C9A35B]'
                }`}
              >
                O
              </span>
              <span
                className={`text-[7px] font-ui uppercase tracking-[0.18em] mt-0.5 font-medium transition-colors ${
                  isLightBg
                    ? 'text-[#1a1a1a]/80'
                    : 'text-[#F5F0E7]/80 group-hover:text-[#C9A35B]'
                }`}
              >
                Menu
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          3. LIQUID GLASS DROPDOWN MENU (INDIVIDUAL BLOCKS)
          ===================================================== */}
      <AnimatePresence>
        {scrolled && isMenuOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-24 left-6 sm:left-10 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-[#07131D]/90 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-2.5 max-h-[80vh] overflow-y-auto"
          >
            {/* Header / Title */}
            <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-white/15">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A35B] animate-pulse" />
                <span className="font-editorial text-lg font-bold tracking-wider text-[#C9A35B]">
                  OXAR MENU
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full text-[#F5F0E7]/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Individual Block Cards for each Icon/Link */}
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 transform hover:scale-105 ${
                      isActive
                        ? 'bg-[#C9A35B]/20 border-[#C9A35B]/60 text-[#C9A35B] font-semibold shadow-md shadow-[#C9A35B]/10'
                        : 'bg-white/[0.06] hover:bg-white/[0.14] border-white/10 text-[#F5F0E7] hover:text-[#C9A35B] hover:border-white/30'
                    }`}
                  >
                    <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em]">
                      {link.name}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-[#C9A35B]' : 'text-white/40'}`} />
                  </Link>
                )
              })}
            </div>

            {/* Authentication Action Blocks */}
            <div className="pt-2 mt-1 border-t border-white/15 flex flex-col gap-2">
              {user ? (
                <>
                  {profile?.is_admin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#C9A35B]/10 border border-[#C9A35B]/30 text-[#C9A35B] font-ui text-xs uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      <span>Admin Panel</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#F5F0E7] font-ui text-xs uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#C9A35B]" />
                      <span>{profile?.full_name || 'My Profile'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </Link>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-ui text-xs uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[#F5F0E7] font-ui text-xs uppercase tracking-widest hover:bg-white/10 hover:scale-105 transition-all"
                  >
                    LOGIN
                  </Link>
                  <Link
                    to="/join"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-[#C9A35B] text-[#07131D] font-ui text-xs font-bold uppercase tracking-widest hover:bg-[#E2C98D] hover:scale-105 transition-all shadow-md shadow-[#C9A35B]/20"
                  >
                    JOIN
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
}

