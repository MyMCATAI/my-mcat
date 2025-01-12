import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THOMPSON_EQUATIONS = [
  "β(α=0.82, β=0.31)",
  "P(θ|D) ∝ P(D|θ)P(θ)",
  "E[R|a,H] = ∫θP(θ|H)dθ",
  "Beta(α+S, β+F)",
  "μ = α/(α+β)"
];

export const LoadingSkeleton = () => {
  return (
    <div 
      className="relative w-full h-[calc(100vh-23rem)] flex flex-col items-center justify-center"
      style={{
        background: 'transparent',
      }}
    >
      {/* Main loading text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center font-mono text-lg animate-pulse"
        style={{ color: 'var(--theme-text-color)' }}
      >
        Analyzing knowledge profile...
      </motion.div>

      {/* Floating equations */}
      <div className="absolute inset-0 pointer-events-none">
        {THOMPSON_EQUATIONS.map((equation, i) => (
          <motion.div
            key={`eq-${i}`}
            className="absolute text-xs font-mono"
            style={{ 
              color: 'var(--theme-emphasis-color)',
              opacity: 0.6
            }}
            initial={{
              x: `${Math.random() * 60 + 20}%`,
              y: `${Math.random() * 60 + 20}%`,
              opacity: 0
            }}
            animate={{
              y: ['0%', '50%', '100%'],
              opacity: [0, 0.6, 0],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
          >
            {equation}
          </motion.div>
        ))}
      </div>
    </div>
  );
};