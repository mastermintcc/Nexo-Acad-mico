'use client'

import { motion } from 'motion/react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2 cursor-pointer group">
      <div className="relative w-10 h-10">
        <motion.div 
          className="absolute inset-0 border-2 border-blue-600 rounded-lg"
          animate={{ rotate: 45 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-0 border-2 border-black rounded-lg"
          animate={{ rotate: -45 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600">
          N
        </div>
      </div>
      <span className="text-xl font-black tracking-tighter text-black group-hover:text-blue-600 transition-colors">
        NEXO
      </span>
    </div>
  )
}
