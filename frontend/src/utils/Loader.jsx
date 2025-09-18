import React from 'react'
import { motion } from 'framer-motion'
import { FaLink } from 'react-icons/fa'


export default function Loader({ progress = 0 }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-blue-400 rounded-full flex items-center justify-center mb-8"
      >
        <FaLink className="w-12 h-12 text-white" />
      </motion.div>
      <div className="w-64 bg-blue-400 bg-opacity-30 rounded-full h-2 mb-4">
        <motion.div
          className="bg-blue-400 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-blue-400 text-lg font-semibold">Loading... {progress}%</p>
    </div>
  )
}