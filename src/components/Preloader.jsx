import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Preloader Component
 * Inspired by Elian Kent's column-wipe reveal transition.
 * 
 * 1. Shows "FOREVER" with a kinetic letter-by-letter reveal.
 * 2. Wipes away using staggered vertical columns to reveal the website underneath.
 */
export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const [isWiping, setIsWiping] = useState(false)

  useEffect(() => {
    // Phase 1: Keep text visible for 1.2s
    const timer1 = setTimeout(() => {
      setIsWiping(true)
    }, 1400)

    // Phase 2: Complete removal after column wipes finish
    const timer2 = setTimeout(() => {
      setIsLoading(false)
    }, 2400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  if (!isLoading) return null

  const word = "FOREVER"
  const letters = word.split("")
  const columns = [0, 1, 2, 3, 4]

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* 5 Vertical Columns Wiping Upward */}
      <div className="absolute inset-0 flex w-full h-full">
        {columns.map((colIndex) => (
          <motion.div
            key={colIndex}
            className="h-full bg-[#E5E5E3] border-r border-[#D5D5D3]/50 last:border-r-0"
            style={{ width: `${100 / columns.length}%` }}
            initial={{ y: '0%' }}
            animate={{ y: isWiping ? '-100%' : '0%' }}
            transition={{
              duration: 0.8,
              ease: [0.76, 0, 0.24, 1],
              delay: isWiping ? colIndex * 0.08 : 0,
            }}
          />
        ))}
      </div>

      {/* Centered Kinetic "FOREVER" Text Reveal */}
      <AnimatePresence>
        {!isWiping && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10 select-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex overflow-hidden font-heading text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.25em] text-[#07131D]">
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ y: '120%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.33, 1, 0.68, 1],
                    delay: 0.1 + index * 0.06,
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
