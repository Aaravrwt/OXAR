import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * HeritageCutoutSection
 * 
 * Clean, fluid paper cutout section with pure white background.
 * The text "XAVERIAN ALWAYS" acts as a stencil cutout revealing
 * the fixed background image underneath, with responsive scroll motion
 * that transitions naturally without excessive dead scroll.
 */
export default function HeritageCutoutSection({
  imageUrl = '/IMG_8654.webp',
  paperColor = '#ffffff',
}) {
  const sectionRef = useRef(null)

  // Start animating as soon as section enters viewport, finish as it leaves
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Smooth, immediate scroll parallax without sticky locking
  const xLine1 = useTransform(scrollYProgress, [0, 1], ['12%', '-18%'])
  const xLine2 = useTransform(scrollYProgress, [0, 1], ['-18%', '12%'])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white py-16 sm:py-24"
    >
      {/* 1. FIXED BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("${imageUrl}")`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
          filter: 'contrast(1.08) brightness(0.92)',
        }}
      />

      {/* 2. SVG WHITE CUTOUT STENCIL LAYER */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="xaverian-always-cutout-mask">
            {/* Pure white keeps surrounding background solid white */}
            <rect width="100%" height="100%" fill="#ffffff" />

            {/* Black text cuts windows directly through the white layer */}
            <foreignObject width="100%" height="100%">
              <div className="flex h-full w-full flex-col justify-center items-center gap-0 sm:gap-2 px-2 text-black select-none">
                <motion.div
                  style={{ x: xLine1 }}
                  className="whitespace-nowrap font-heading text-[16vw] sm:text-[13vw] font-black uppercase leading-[0.8] tracking-tighter text-center"
                >
                  XAVERIAN
                </motion.div>
                <motion.div
                  style={{ x: xLine2 }}
                  className="whitespace-nowrap font-heading text-[16vw] sm:text-[13vw] font-black uppercase leading-[0.8] tracking-tighter text-center"
                >
                  ALWAYS
                </motion.div>
              </div>
            </foreignObject>
          </mask>
        </defs>

        {/* Solid white layer with cutout mask applied */}
        <rect
          width="100%"
          height="100%"
          fill={paperColor}
          mask="url(#xaverian-always-cutout-mask)"
        />
      </svg>

      {/* 3. SECTION CONTENT (Unmasked & Clickable) */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        {/* Header Label */}
        <div className="mb-4">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[#B89A5A]">
            Learn more about
          </p>
          <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-[#173F5F]">
            OXAR History
          </h2>
        </div>

        {/* Visual spacer for cutout text presence */}
        <div className="h-44 sm:h-64 w-full" />

        {/* Description and CTA */}
        <div className="mt-6 max-w-lg">
          <p className="font-body text-sm sm:text-base leading-relaxed text-[#46545D]">
            A community shaped by shared classrooms, lasting friendships, and a legacy that continues across generations.
          </p>

          <Link
            to="/about"
            className="group mt-6 inline-flex items-center gap-2.5 border-b-2 border-[#173F5F] pb-1 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#173F5F] transition-all duration-300 hover:border-[#B89A5A] hover:text-[#B89A5A]"
          >
            Discover our history
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
