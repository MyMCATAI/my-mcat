
import React from 'react';
import { motion } from 'framer-motion';

/* --- Constants ----- */
const KALYPSO_AVATAR = '/kalypso/Kalypsoapproval.gif';

/* ----- Types ---- */
interface KalypsoAvatarProps {
  onAction: () => void;
}

const KalypsoAvatar: React.FC<KalypsoAvatarProps> = ({ onAction }) => {
  /* ---- Render Methods ----- */
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-[-2rem] right-[-12rem] md:bottom-[-6rem] md:right-[-8rem] z-[10002] cursor-pointer overflow-hidden"
      onClick={onAction}
    >
      <div className="w-[32rem] h-[32rem] md:w-[50rem] md:h-[50rem] relative hover:scale-105 transition-transform duration-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={KALYPSO_AVATAR}
          alt="Kalypso"
          style={{ objectFit: 'contain', objectPosition: 'bottom', width: '100%', height: '100%' }}
        />
      </div>
    </motion.div>
  );
};

export default KalypsoAvatar; 
