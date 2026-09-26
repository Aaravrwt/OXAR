import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Calendar,
  MapPin,
  Search,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { motion, useInView } from 'framer-motion'

function AnimatedCounter({ end, duration = 2.5, suffix = '+' }) {
  const [count, setCount] = useState(0)
  const nodeRef = useRef(null)
  const isInView = useInView(nodeRef, { once: true, margin: '-20px' })

  useEffect(() => {
    if (!isInView) return

    let startTime = null
    let animationFrame = null

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)

      // Smooth cubic ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(easeProgress * end)

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(step)

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [isInView, end, duration])

  return (
    <span ref={nodeRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function Home() {
  const [recentNews, setRecentNews] = useState([])
  const [activeRegion, setActiveRegion] = useState('delhi')
  const [directorySearch, setDirectorySearch] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('all')

  // Global Chapter hubs
  const regionalHubs = {
    delhi: {
      name: 'Delhi NCR Chapter',
      country: 'India',
      lead: 'Central Secretariat',
      alumni: '3,200+',
      focus: 'Heritage Events, School Infrastructure & Student Mentorship',
      status: 'Active Headquarters'
    },
    london: {
      name: 'London & UK Chapter',
      country: 'United Kingdom',
      lead: 'European Network',
      alumni: '350+',
      focus: 'Fintech, Higher Education Exchange & Annual UK Dinner',
      status: 'Regional Hub'
    },
    newyork: {
      name: 'North America Chapter',
      country: 'USA & Canada',
      lead: 'East & West Coast Co-Leads',
      alumni: '520+',
      focus: 'Tech Innovation, Venture Capital & Academic Fellowships',
      status: 'Regional Hub'
    },
    singapore: {
      name: 'Asia-Pacific Hub',
      country: 'Singapore & SE Asia',
      lead: 'APAC Secretariat',
      alumni: '280+',
      focus: 'Cross-border Trade, Healthcare & Leadership Salons',
      status: 'Regional Hub'
    },
    dubai: {
      name: 'Middle East Chapter',
      country: 'UAE & Gulf Region',
      lead: 'Gulf Council',
      alumni: '310+',
      focus: 'Enterprise Development & Global Reunion Delegations',
      status: 'Regional Hub'
    }
  }

  // Sample curated alumni profiles for directory preview
  const sampleAlumni = [
    {
      id: 1,
      name: 'Vikramaditya Sahai',
      batch: 'Class of 1998',
      role: 'Senior Partner, Global Infrastructure',
      location: 'New Delhi, India',
      industry: 'Infrastructure & Law',
      initials: 'VS',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Dr. Ananya Sengupta',
      batch: 'Class of 2006',
      role: 'Principal Researcher, Quantum Systems',
      location: 'Cambridge, UK',
      industry: 'DeepTech & Research',
      initials: 'AS',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Kabir Oberoi',
      batch: 'Class of 2012',
      role: 'Founder & CEO, Meridian Robotics',
      location: 'Bengaluru, India',
      industry: 'Robotics & AI',
      initials: 'KO',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      name: 'Meera Chawla',
      batch: 'Class of 2015',
      role: 'Policy Director, Climate Finance',
      location: 'Geneva, Switzerland',
      industry: 'Public Policy',
      initials: 'MC',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
    }
  ]

  // Filtered alumni
  const filteredAlumni = sampleAlumni.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      item.role.toLowerCase().includes(directorySearch.toLowerCase()) ||
      item.location.toLowerCase().includes(directorySearch.toLowerCase())
    return matchesSearch
  })

  // Sample flagship events
  const flagshipEvents = [
    {
      id: 1,
      tag: 'ANNUAL FLAGSHIP',
      title: 'The Golden Jubilee Grand Reunion 2026',
      date: 'NOV 21, 2026',
      time: '6:30 PM IST',
      location: 'St. Xavier’s Amphitheatre, Rohini',
      summary:
        'An evening commemorating five decades of excellence, uniting batches from 1974 through 2025 under the historic campus pavilion.',
      image:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      tag: 'LEADERSHIP SERIES',
      title: 'Distinguished Xaverian Speaker Summit: Global Impact',
      date: 'DEC 12, 2026',
      time: '5:00 PM IST',
      location: 'Virtual Broadcast & India Habitat Centre',
      summary:
        'Keynote addresses from Xaverian pioneers in aerospace, public service, sustainable finance, and enterprise innovation.',
      image:
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      tag: 'ATHLETICS & BROTHERHOOD',
      title: 'The Fr. Principal Memorial Cricket Cup',
      date: 'JAN 16, 2027',
      time: '8:00 AM IST',
      location: 'School Main Grounds, Rohini',
      summary:
        'The storied inter-batch sporting tradition returning for its 18th annual edition with 16 alumni squads competing.',
      image:
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80'
    }
  ]

  // Fetch recent news from Supabase
  useEffect(() => {
    supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRecentNews(data)
        } else {
          setRecentNews([
            {
              id: 1,
              title: 'OXAR Endows the St. Xavier’s Innovation & Robotics Laboratory',
              category: 'CAMPUS ENDOWMENT',
              excerpt:
                'Alumni collective commits multi-crore infrastructure upgrade establishing a world-class STEM lab for secondary scholars.',
              created_at: 'AUGUST 2026',
              thumbnail_url:
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
              readTime: '4 min read'
            },
            {
              id: 2,
              title: 'Mentorship in Action: Connecting 200+ Class XII Students to Global Careers',
              category: 'COMMUNITY & PURPOSE',
              excerpt:
                'How the 2026 senior cohort is gaining 1-on-1 counsel from alumni leaders across 14 international sectors.',
              created_at: 'JULY 2026',
              thumbnail_url:
                'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
              readTime: '3 min read'
            },
            {
              id: 3,
              title: 'Honoring Five Decades: Archival Glimpses of St. Xavier’s Rohini',
              category: 'HISTORICAL ARCHIVE',
              excerpt:
                'A curated visual retrospective of foundational educators, campus architecture, and foundational moments.',
              created_at: 'JUNE 2026',
              thumbnail_url:
                'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
              readTime: '6 min read'
            }
          ])
        }
      })
  }, [])

  return (
    <div className="flex flex-col bg-[#07131D] text-[#F5F0E7] selection:bg-[#C9A35B] selection:text-[#07131D]">

      {/* =====================================================
          01 — CINEMATIC HERO
          ===================================================== */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#07131D] px-6 pt-24 pb-16 sm:px-10 lg:px-16 border-b border-[#0D1D2A]">
        
        {/* Background Atmosphere */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 filter contrast-125 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: 'url("/IMG_8654.webp")',
          }}
        />
        
        {/* Subtle Radial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07131D] via-[#07131D]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07131D]/60 to-[#07131D] pointer-events-none" />

        {/* Hero Central Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full my-auto text-center pt-8 sm:pt-12">
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[#C9A35B]/25 bg-[#0D1D2A]/60 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A35B]" />
            <span className="font-ui text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A35B]">
              A Lifetime of Brotherhood
            </span>
          </motion.div>

          {/* Main Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal leading-[0.95] tracking-tight text-[#F5F0E7]"
          >
            <span className="block text-[#F5F0E7]">Once a Xaverian,</span>
            <span className="block text-[#C9A35B] italic font-light">Always a Xaverian.</span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            className="mt-8 font-ui text-base sm:text-lg md:text-xl text-[#F5F0E7]/80 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Connecting generations of Xaverians worldwide.
            Honoring our foundational values, inspiring community leadership, and building a lasting legacy.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link
              to="/join"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#07131D] bg-[#C9A35B] transition-all duration-300 hover:bg-[#E2C98D] shadow-lg shadow-[#C9A35B]/10 hover:shadow-[#C9A35B]/25"
            >
              <span>Join Our Community</span>
              <ArrowRight className="ml-3 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F5F0E7] border border-[#F5F0E7]/20 hover:border-[#C9A35B]/60 hover:text-[#C9A35B] transition-all duration-300 backdrop-blur-sm"
            >
              <span>Explore Our Legacy</span>
            </Link>
          </motion.div>

        </div>

        {/* Hero Statistics Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-6xl mx-auto mt-12 pt-8 border-t border-[#0D1D2A] grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          <div>
            <span className="block font-editorial text-3xl sm:text-4xl text-[#C9A35B]">
              <AnimatedCounter end={5000} suffix="+" />
            </span>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-[#F5F0E7]/60">Alumni Worldwide</span>
          </div>
          <div>
            <span className="block font-editorial text-3xl sm:text-4xl text-[#C9A35B]">
              <AnimatedCounter end={50} suffix="+" />
            </span>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-[#F5F0E7]/60">Years of Legacy</span>
          </div>
          <div>
            <span className="block font-editorial text-3xl sm:text-4xl text-[#C9A35B]">
              <AnimatedCounter end={25} suffix="+" />
            </span>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-[#F5F0E7]/60">Chapters & Initiatives</span>
          </div>
          <div>
            <span className="block font-editorial text-3xl sm:text-4xl text-[#C9A35B]">
              <AnimatedCounter end={18} suffix="+" />
            </span>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-[#F5F0E7]/60">Countries Represented</span>
          </div>
        </motion.div>

      </section>


      {/* =====================================================
          02 — OUR LEGACY (WARM IVORY EDITORIAL SPREAD)
          ===================================================== */}
      <section className="relative bg-[#F5F0E7] text-[#07131D] px-6 py-24 sm:px-10 lg:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Editorial Narrative */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="font-ui text-xs font-bold uppercase tracking-[0.3em] text-[#8F6A32]">
                Our Legacy
              </span>

              <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-tight text-[#07131D]">
                Rooted in Values.<br />
                <span className="italic font-light text-[#8F6A32]">Built for a Better World.</span>
              </h2>

              <div className="w-16 h-[1.5px] bg-[#C9A35B] my-8" />

              <p className="font-ui text-base sm:text-lg leading-relaxed text-[#07131D]/80 font-normal">
                Founded on the enduring Jesuit tradition of selfless leadership and moral excellence, St. Xavier’s Senior Secondary School, Rohini has nurtured minds that shape nations, pioneer industries, and uplift communities.
              </p>

              <p className="mt-4 font-ui text-sm sm:text-base leading-relaxed text-[#07131D]/70 font-light">
                OXAR exists to ensure that the sacred bond forged within our classrooms, assembly halls, and playing fields remains unbreakable across decades and borders.
              </p>

              <div className="mt-8 pt-6 border-t border-[#EAE3D7] flex items-center justify-between">
                <div>
                  <span className="font-editorial text-2xl text-[#07131D] block">Est. 1974</span>
                  <span className="font-ui text-xs uppercase tracking-widest text-[#07131D]/60">Five Decades of Distinction</span>
                </div>

                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-[#07131D] hover:text-[#8F6A32] transition-colors"
                >
                  <span>Read Full Chronicle</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#8F6A32]" />
                </Link>
              </div>
            </div>

            {/* Right Asymmetrical Archival Layout */}
            <div className="lg:col-span-6 relative">
              <div className="relative z-10 overflow-hidden rounded-sm border border-[#EAE3D7] shadow-2xl bg-white p-3">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&auto=format&fit=crop&q=80"
                  alt="Historic Xavierian Campus"
                  className="w-full h-[380px] sm:h-[460px] object-cover filter saturate-[0.85] contrast-[1.05]"
                />
                <div className="pt-3 pb-1 px-2 flex justify-between items-center text-xs font-ui text-[#07131D]/60 uppercase tracking-widest">
                  <span>Archival Record • Campus Heritage</span>
                  <span>St. Xavier's Rohini</span>
                </div>
              </div>

              {/* Floating Quote Card */}
              <div className="hidden sm:block absolute -bottom-8 -left-8 z-20 max-w-xs bg-[#07131D] text-[#F5F0E7] p-6 border-l-2 border-[#C9A35B] shadow-xl">
                <p className="font-editorial text-lg italic leading-snug">
                  “A legacy not measured in years, but in the lives touched and the values upheld.”
                </p>
                <span className="block mt-2 font-ui text-[10px] uppercase tracking-[0.25em] text-[#C9A35B]">
                  OXAR Creed
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          03 — GLOBAL XAVERIAN COMMUNITY
          ===================================================== */}
      <section className="relative bg-[#07131D] text-[#F5F0E7] px-6 py-24 sm:px-10 lg:px-16 border-t border-[#0D1D2A]">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-ui text-xs font-bold uppercase tracking-[0.3em] text-[#C9A35B]">
              Global Presence
            </span>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F0E7]">
              Xaverians Everywhere.
            </h2>
            <p className="mt-4 font-ui text-base text-[#F5F0E7]/70 font-light max-w-xl mx-auto">
              A community that carries the Xaverian spirit across generations, cities, and continents.
            </p>
          </div>

          {/* Interactive Regional Hubs Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Hub Selector List */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {Object.entries(regionalHubs).map(([key, hub]) => {
                const isActive = activeRegion === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveRegion(key)}
                    className={`text-left p-5 transition-all duration-300 border flex items-center justify-between ${
                      isActive
                        ? 'bg-[#0D1D2A] border-[#C9A35B]/60 text-[#F5F0E7] shadow-lg shadow-[#07131D]'
                        : 'bg-[#07131D]/50 border-[#0D1D2A] text-[#F5F0E7]/60 hover:border-[#F5F0E7]/20 hover:text-[#F5F0E7]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#C9A35B]' : 'bg-[#F5F0E7]/30'}`} />
                        <span className="font-editorial text-xl font-medium tracking-wide text-[#F5F0E7]">{hub.name}</span>
                      </div>
                      <span className="font-ui text-xs uppercase tracking-wider text-[#F5F0E7]/50 mt-1 block pl-4">
                        {hub.country}
                      </span>
                    </div>

                    <span className="font-editorial text-lg text-[#C9A35B] pl-4">{hub.alumni}</span>
                  </button>
                )
              })}
            </div>

            {/* Hub Spotlight Panel */}
            <div className="lg:col-span-7 bg-[#0D1D2A] border border-[#C9A35B]/30 p-8 sm:p-10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between pb-6 border-b border-[#F5F0E7]/10">
                  <div>
                    <span className="font-ui text-[11px] uppercase tracking-[0.25em] text-[#C9A35B]">
                      {regionalHubs[activeRegion].status}
                    </span>
                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#F5F0E7] mt-1">
                      {regionalHubs[activeRegion].name}
                    </h3>
                  </div>
                  <Globe className="w-8 h-8 text-[#C9A35B]/60" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
                  <div className="p-4 bg-[#07131D]/80 border border-[#0D1D2A]">
                    <span className="font-ui text-[10px] uppercase tracking-wider text-[#F5F0E7]/50 block">Alumni Registered</span>
                    <span className="font-editorial text-3xl text-[#C9A35B] mt-1 block">
                      {regionalHubs[activeRegion].alumni}
                    </span>
                  </div>
                  <div className="p-4 bg-[#07131D]/80 border border-[#0D1D2A]">
                    <span className="font-ui text-[10px] uppercase tracking-wider text-[#F5F0E7]/50 block">Regional Leadership</span>
                    <span className="font-ui text-sm font-medium text-[#F5F0E7] mt-2 block">
                      {regionalHubs[activeRegion].lead}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-ui text-xs uppercase tracking-wider text-[#F5F0E7]/60 block mb-2">Key Initiatives</span>
                  <p className="font-ui text-sm text-[#F5F0E7]/90 leading-relaxed font-light">
                    {regionalHubs[activeRegion].focus}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F5F0E7]/10 flex justify-between items-center">
                  <span className="font-ui text-xs text-[#F5F0E7]/50">Connect with regional coordinators</span>
                  <Link
                    to="/coordinators"
                    className="inline-flex items-center gap-1.5 font-ui text-xs font-bold uppercase tracking-[0.2em] text-[#C9A35B] hover:text-[#E2C98D]"
                  >
                    <span>View Coordinators</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          04 — UPCOMING EVENTS (EDITORIAL LUXURY CARDS)
          ===================================================== */}
      <section className="relative bg-[#03080D] text-[#F5F0E7] px-6 py-24 sm:px-10 lg:px-16 border-t border-[#0D1D2A]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="font-ui text-xs font-bold uppercase tracking-[0.3em] text-[#C9A35B]">
                Convocations & Gatherings
              </span>
              <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F0E7]">
                Reconnect. Relive.<br />
                <span className="italic font-light text-[#C9A35B]">Create New Memories.</span>
              </h2>
            </div>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-[#C9A35B] hover:text-[#E2C98D] pb-1 border-b border-[#C9A35B]/40 transition-colors"
            >
              <span>View Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {flagshipEvents.map((evt) => (
              <div
                key={evt.id}
                className="group relative bg-[#07131D] border border-[#0D1D2A] overflow-hidden flex flex-col transition-all duration-300 hover:border-[#C9A35B]/50 hover:-translate-y-1.5 shadow-xl"
              >
                {/* Event Cover Image */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 contrast-105"
                  />
                  <div className="absolute top-4 left-4 bg-[#07131D]/90 backdrop-blur-sm px-3 py-1 text-[10px] font-ui font-semibold uppercase tracking-widest text-[#C9A35B] border border-[#C9A35B]/30">
                    {evt.tag}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs font-ui text-[#F5F0E7]/60 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[#C9A35B] font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {evt.date}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5" />
                        {evt.location}
                      </span>
                    </div>

                    <h3 className="font-editorial text-2xl text-[#F5F0E7] font-medium leading-snug group-hover:text-[#C9A35B] transition-colors">
                      {evt.title}
                    </h3>

                    <p className="mt-3 font-ui text-sm text-[#F5F0E7]/70 font-light line-clamp-3 leading-relaxed">
                      {evt.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#0D1D2A] flex items-center justify-between">
                    <span className="font-ui text-xs text-[#F5F0E7]/40 uppercase tracking-widest">
                      {evt.time}
                    </span>
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-1 text-xs font-ui font-bold uppercase tracking-wider text-[#C9A35B] group-hover:translate-x-1 transition-transform"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* =====================================================
          05 — ALUMNI DIRECTORY PREVIEW
          ===================================================== */}
      <section className="relative bg-[#07131D] text-[#F5F0E7] px-6 py-24 sm:px-10 lg:px-16 border-t border-[#0D1D2A]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-ui text-xs font-bold uppercase tracking-[0.3em] text-[#C9A35B]">
              Directory
            </span>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F0E7]">
              Find Fellow Xaverians.
            </h2>
            <p className="mt-3 font-ui text-base text-[#F5F0E7]/70 font-light">
              Discover mentors, industry peers, batchmates, and global collaborators.
            </p>

            {/* Search Input Filter */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A35B]" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search alumni by name, role, city, or discipline..."
                className="w-full bg-[#0D1D2A] border border-[#0D1D2A] focus:border-[#C9A35B] pl-11 pr-4 py-3.5 text-sm font-ui text-[#F5F0E7] placeholder-[#F5F0E7]/40 outline-none transition-all"
              />
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {filteredAlumni.map((alum) => (
              <div
                key={alum.id}
                className="group bg-[#0D1D2A]/60 border border-[#0D1D2A] p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#C9A35B]/40 hover:bg-[#0D1D2A]"
              >
                <div>
                  <div className="relative mb-4 overflow-hidden h-48 bg-[#07131D]">
                    <img
                      src={alum.image}
                      alt={alum.name}
                      className="w-full h-full object-cover filter saturate-75 contrast-105 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-[#07131D]/80 backdrop-blur-sm text-[10px] font-ui uppercase tracking-wider text-[#C9A35B] px-2 py-0.5 border border-[#C9A35B]/20">
                      {alum.batch}
                    </div>
                  </div>

                  <h4 className="font-editorial text-2xl text-[#F5F0E7] font-medium leading-snug">
                    {alum.name}
                  </h4>

                  <p className="mt-1 font-ui text-xs text-[#C9A35B] font-medium">
                    {alum.role}
                  </p>

                  <p className="mt-2 font-ui text-xs text-[#F5F0E7]/60">
                    {alum.location} • {alum.industry}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#07131D] flex items-center justify-between">
                  <span className="font-ui text-[11px] text-[#F5F0E7]/40 uppercase tracking-widest">
                    Verified Alumnus
                  </span>
                  <Link
                    to="/directory"
                    className="inline-flex items-center text-xs font-ui font-semibold text-[#C9A35B] group-hover:translate-x-1 transition-transform"
                  >
                    <span>Connect</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/directory"
              className="inline-flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-[0.25em] text-[#07131D] bg-[#F5F0E7] px-8 py-4 hover:bg-[#C9A35B] transition-colors shadow-lg"
            >
              <span>Explore Complete Alumni Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>


      {/* =====================================================
          06 — STORIES FROM OXAR (EDITORIAL MAGAZINE LAYOUT)
          ===================================================== */}
      <section className="relative bg-[#F5F0E7] text-[#07131D] px-6 py-24 sm:px-10 lg:px-16 border-t border-[#EAE3D7]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="font-ui text-xs font-bold uppercase tracking-[0.3em] text-[#8F6A32]">
                Editorial Journal
              </span>
              <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#07131D]">
                Stories from OXAR.
              </h2>
            </div>

            <Link
              to="/news"
              className="inline-flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-[#07131D] hover:text-[#8F6A32] pb-1 border-b border-[#07131D]/40 transition-colors"
            >
              <span>Browse All Dispatches</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F6A32]" />
            </Link>
          </div>

          {/* Magazine Asymmetrical Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Primary Feature Story (7 cols) */}
            {recentNews[0] && (
              <div className="lg:col-span-7 bg-white border border-[#EAE3D7] overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-72 sm:h-96 overflow-hidden">
                  <img
                    src={recentNews[0].thumbnail_url}
                    alt={recentNews[0].title}
                    className="w-full h-full object-cover filter saturate-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-[#07131D] text-[#C9A35B] text-[10px] font-ui font-semibold uppercase tracking-widest px-3 py-1">
                    {recentNews[0].category}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-ui text-xs uppercase tracking-wider text-[#07131D]/50 block mb-2">
                      {recentNews[0].created_at} • Featured Dispatch
                    </span>
                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#07131D] font-normal leading-tight group-hover:text-[#8F6A32] transition-colors">
                      {recentNews[0].title}
                    </h3>
                    <p className="mt-4 font-ui text-sm sm:text-base text-[#07131D]/75 leading-relaxed font-light">
                      {recentNews[0].excerpt}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#EAE3D7] flex items-center justify-between">
                    <span className="font-ui text-xs font-medium text-[#07131D]/60 uppercase tracking-widest">
                      OXAR Archive
                    </span>
                    <Link
                      to="/news"
                      className="inline-flex items-center gap-1.5 font-ui text-xs font-bold uppercase tracking-wider text-[#8F6A32]"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Stories Stack (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {recentNews.slice(1, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#EAE3D7] p-6 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow flex-1"
                >
                  <div>
                    <span className="font-ui text-[10px] uppercase tracking-widest text-[#8F6A32] block mb-2 font-bold">
                      {item.category}
                    </span>
                    <h4 className="font-editorial text-2xl text-[#07131D] font-normal leading-snug group-hover:text-[#8F6A32] transition-colors">
                      {item.title}
                    </h4>
                    <p className="mt-2 font-ui text-xs sm:text-sm text-[#07131D]/70 font-light line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#EAE3D7] flex items-center justify-between text-xs font-ui">
                    <span className="text-[#07131D]/50">{item.created_at}</span>
                    <Link
                      to="/news"
                      className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[#8F6A32]"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          07 — PHILOSOPHY SECTION (CINEMATIC PAUSE)
          ===================================================== */}
      <section className="relative bg-[#07131D] text-[#F5F0E7] px-6 py-32 sm:px-10 lg:px-16 overflow-hidden border-t border-[#0D1D2A] text-center">
        
        {/* Subtle background crest / texture */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-xs mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: 'url("/IMG_8654.webp")',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="w-8 h-[1px] bg-[#C9A35B] block mx-auto mb-8" />
          
          <blockquote className="font-editorial text-3xl sm:text-5xl md:text-6xl font-light italic leading-tight text-[#F5F0E7]">
            “Men and women for others.”
          </blockquote>

          <cite className="block mt-6 font-ui text-xs uppercase tracking-[0.35em] text-[#C9A35B] not-italic font-semibold">
            — St. Ignatius of Loyola
          </cite>

          <p className="mt-8 font-ui text-sm sm:text-base text-[#F5F0E7]/60 max-w-xl mx-auto font-light leading-relaxed">
            The foundational principle guiding every Xaverian’s journey: pursuing academic and professional distinction while serving society with humility and purpose.
          </p>
        </div>
      </section>


      {/* =====================================================
          08 — JOIN OXAR (CALL TO ACTION)
          ===================================================== */}
      <section className="relative bg-[#03080D] text-[#F5F0E7] px-6 py-28 sm:px-10 lg:px-16 border-t border-[#0D1D2A]">
        <div className="max-w-5xl mx-auto text-center">
          
          <span className="font-ui text-xs font-bold uppercase tracking-[0.35em] text-[#C9A35B]">
            Membership & Brotherhood
          </span>

          <h2 className="mt-4 font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F5F0E7]">
            Be Part of Something Greater.
          </h2>

          <p className="mt-6 font-ui text-base sm:text-lg text-[#F5F0E7]/70 font-light max-w-2xl mx-auto leading-relaxed">
            Join thousands of Xaverians worldwide. Reclaim your alumni profile, connect with mentors across global industries, and contribute to the legacy of our school.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/join"
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 font-ui text-xs font-bold uppercase tracking-[0.25em] text-[#07131D] bg-[#C9A35B] hover:bg-[#E2C98D] transition-colors shadow-xl"
            >
              <span>Join OXAR Today</span>
              <ArrowRight className="ml-2 w-3.5 h-3.5" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 font-ui text-xs font-semibold uppercase tracking-[0.25em] text-[#F5F0E7] border border-[#F5F0E7]/25 hover:border-[#C9A35B] hover:text-[#C9A35B] transition-colors"
            >
              <span>Explore The Council</span>
            </Link>
          </div>

        </div>
      </section>


      {/* =====================================================
          09 — LUXURY FOOTER
          ===================================================== */}
      <footer className="bg-[#07131D] text-[#F5F0E7] border-t border-[#0D1D2A] px-6 py-16 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#0D1D2A]">
            
            {/* Brand Tribute */}
            <div className="md:col-span-5">
              <span className="font-editorial text-3xl tracking-tight text-[#F5F0E7] block font-normal">
                OXAR
              </span>
              <span className="font-ui text-xs uppercase tracking-[0.25em] text-[#C9A35B] block mt-1">
                Old Xaverians Alumni Rohini
              </span>
              <p className="mt-4 font-ui text-xs sm:text-sm text-[#F5F0E7]/60 leading-relaxed font-light max-w-sm">
                The official alumni association of St. Xavier's Senior Secondary School, Rohini, Delhi. Fostering lifelong brotherhood and service since 1974.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-6 text-xs font-ui">
              <div>
                <span className="uppercase tracking-[0.2em] text-[#C9A35B] font-semibold block mb-4">
                  Navigation
                </span>
                <ul className="space-y-2.5 text-[#F5F0E7]/70 font-light">
                  <li><Link to="/about" className="hover:text-[#C9A35B] transition-colors">About & Council</Link></li>
                  <li><Link to="/directory" className="hover:text-[#C9A35B] transition-colors">Alumni Directory</Link></li>
                  <li><Link to="/events" className="hover:text-[#C9A35B] transition-colors">Events & Calendar</Link></li>
                  <li><Link to="/distinguished" className="hover:text-[#C9A35B] transition-colors">Distinguished Alumni</Link></li>
                </ul>
              </div>

              <div>
                <span className="uppercase tracking-[0.2em] text-[#C9A35B] font-semibold block mb-4">
                  Initiatives
                </span>
                <ul className="space-y-2.5 text-[#F5F0E7]/70 font-light">
                  <li><Link to="/scholarships" className="hover:text-[#C9A35B] transition-colors">Scholarships</Link></li>
                  <li><Link to="/careers" className="hover:text-[#C9A35B] transition-colors">Careers & Mentorship</Link></li>
                  <li><Link to="/gallery" className="hover:text-[#C9A35B] transition-colors">Archival Gallery</Link></li>
                  <li><Link to="/news" className="hover:text-[#C9A35B] transition-colors">News & Dispatches</Link></li>
                </ul>
              </div>
            </div>

            {/* Official Contact */}
            <div className="md:col-span-3 text-xs font-ui">
              <span className="uppercase tracking-[0.2em] text-[#C9A35B] font-semibold block mb-4">
                Official Inquiries
              </span>
              <p className="text-[#F5F0E7]/70 font-light mb-2">
                St. Xavier's School Campus<br />
                Shahbad-Daulatpur, Rohini, Delhi 110042
              </p>
              <a
                href="mailto:Xaverianoxar@gmail.com"
                className="text-[#C9A35B] hover:underline block mb-2"
              >
                Xaverianoxar@gmail.com
              </a>
              <a
                href="https://www.linkedin.com/school/st-xavier-s-school-rohini/?viewAsMember=true"
                target="_blank"
                rel="noreferrer"
                className="text-[#F5F0E7]/60 hover:text-[#C9A35B] transition-colors inline-block mt-1"
              >
                LinkedIn Community →
              </a>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-ui text-[#F5F0E7]/40 gap-4">
            <span>© {new Date().getFullYear()} Old Xaverians Alumni Rohini (OXAR). All rights reserved.</span>
            <span className="font-editorial text-sm italic text-[#C9A35B]/80">
              “Once a Xaverian, Always a Xaverian.”
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}
