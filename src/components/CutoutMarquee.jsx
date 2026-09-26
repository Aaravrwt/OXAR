import React from 'react'
import { motion } from 'framer-motion'

/**
 * CutoutMarquee
 * 
 * A pure white paper cutout marquee banner where moving text is cut out like a stencil,
 * revealing the fixed background image underneath (inspired by b-egg.farm).
 */
export default function CutoutMarquee({
  text = 'XAVERIAN ALWAYS • CONNECTING GENERATIONS • OXAR HERITAGE • EXCELLENCE •',
  imageUrl = '/IMG_8654.webp',
  paperColor = '#ffffff',
  height = '200px',
  speed = 25,
  reverse = false,
  className = '',
}) {
  const phrase = `${text.trim()} `
  const repeatedText = phrase.repeat(4)

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-white ${className}`}
      style={{ height }}
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

      {/* 2. SVG WHITE CUTOUT OVERLAY */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={`cutout-marquee-${reverse ? 'rev' : 'fwd'}`}>
            {/* White background keeps surrounding area solid white */}
            <rect width="100%" height="100%" fill="#ffffff" />

            {/* Black text punches transparent cutouts */}
            <foreignObject width="100%" height="100%">
              <div className="flex h-full w-full items-center whitespace-nowrap overflow-hidden">
                <motion.div
                  className="flex whitespace-nowrap font-heading text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-black"
                  initial={{ x: reverse ? '-50%' : '0%' }}
                  animate={{ x: reverse ? '0%' : '-50%' }}
                  transition={{
                    repeat: Infinity,
                    ease: 'linear',
                    duration: speed,
                  }}
                >
                  <span className="pr-4">{repeatedText}</span>
                  <span className="pr-4">{repeatedText}</span>
                </motion.div>
              </div>
            </foreignObject>
          </mask>
        </defs>

        {/* Paper overlay rect */}
        <rect
          width="100%"
          height="100%"
          fill={paperColor}
          mask={`url(#cutout-marquee-${reverse ? 'rev' : 'fwd'})`}
        />
      </svg>
    </div>
  )
}
