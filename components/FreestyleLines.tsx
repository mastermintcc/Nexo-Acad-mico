'use client'

import { motion } from 'motion/react'

export default function FreestyleLines() {
  const springLines = Array.from({ length: 5 }).map((_, i) => ({
    y: 100 + i * 20,
    delay: i * 0.1,
    color: i % 2 === 0 ? "text-blue-600" : "text-black"
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        {springLines.map((line, i) => (
          <motion.path
            key={i}
            d={`M0,${line.y} Q250,${line.y - 50} 500,${line.y} T1000,${line.y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={line.color}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: line.delay }}
          />
        ))}
        
        {/* Adicionando outro conjunto na parte inferior para equilíbrio */}
        {springLines.map((line, i) => (
          <motion.path
            key={`bottom-${i}`}
            d={`M0,${line.y + 700} Q250,${line.y + 650} 500,${line.y + 700} T1000,${line.y + 700}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={line.color}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: line.delay + 0.5 }}
          />
        ))}
      </svg>
    </div>
  )
}
