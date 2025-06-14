import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, BookOpen, Star, Zap, TrendingUp, Award, Clock } from 'lucide-react';

/* --- Constants ----- */
const PRICING_TIERS = [
  {
    id: 'tutoring',
    title: 'Premium Tutoring',
    price: '$150',
    period: '/hour',
    icon: Users,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30',
    features: [
      'One-on-one sessions',
      'Personalized study plans',
      'Expert MCAT tutors',
      'Progress tracking'
    ]
  },
  {
    id: 'classes',
    title: 'Group Classes',
    price: '$75',
    period: '/session',
    icon: BookOpen,
    color: 'from-cyan-500 to-cyan-700',
    bgColor: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/30',
    features: [
      'Small group sessions',
      'Interactive learning',
      'Peer collaboration',
      'Cost-effective'
    ]
  },
  {
    id: 'content',
    title: 'Content Library',
    price: '$49',
    period: '/month',
    icon: BookOpen,
    color: 'from-amber-500 to-amber-700',
    bgColor: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30',
    features: [
      'Video lessons',
      'Practice questions',
      'Study materials',
      '24/7 access'
    ]
  }
];

/* ----- Types ---- */
interface TutoringSalesSidebarProps {
  isVisible: boolean;
}

const TutoringSalesSidebar: React.FC<TutoringSalesSidebarProps> = ({ isVisible }) => {
  /* ---- State ----- */
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  /* ---- Render Methods ----- */
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: '0%', opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 1 }}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-[9999] w-80"
        >
          <motion.div
            className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with sparkle animation */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white overflow-hidden">
              {/* Animated sparkles */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-8 h-8 text-yellow-300" />
                  <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka One, cursive' }}>
                    Sell Tutoring!
                  </h3>
                </motion.div>
                <p className="text-blue-100 font-medium">
                  Transform your business with our proven MCAT prep solutions
                </p>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="p-6 space-y-4">
              {PRICING_TIERS.map((tier, index) => {
                const IconComponent = tier.icon;
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + index * 0.2 }}
                    className={`relative bg-gradient-to-r ${tier.bgColor} rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                    onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color} text-white shadow-md`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                            {tier.title}
                          </h4>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                              {tier.price}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {tier.period}
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: selectedTier === tier.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {selectedTier === tier.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50"
                        >
                          <ul className="space-y-2">
                            {tier.features.map((feature, featureIndex) => (
                              <motion.li
                                key={featureIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: featureIndex * 0.1 }}
                                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                              >
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                {feature}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Revenue Potential Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-800/30 p-6 border-t border-gray-200/50 dark:border-gray-600/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white"
                >
                  <DollarSign className="w-5 h-5" />
                </motion.div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                  Revenue Potential
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    $15K+
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Monthly Revenue
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    50+
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Students/Month
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
              className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700"
            >
              <motion.button
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 4px 20px rgba(59, 130, 246, 0.3)',
                    '0 4px 20px rgba(147, 51, 234, 0.3)',
                    '0 4px 20px rgba(236, 72, 153, 0.3)',
                    '0 4px 20px rgba(59, 130, 246, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontFamily: 'Fredoka One, cursive' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-5 h-5" />
                  Start Selling Today!
                </div>
              </motion.button>
              
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Setup in under 24 hours</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutoringSalesSidebar;