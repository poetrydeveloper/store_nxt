'use client' 

import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: '#111' 
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 150,
          height: 150,
          borderRadius: 20,
          background: '#0070f3',
        }}
      />
    </div>
  )
}
