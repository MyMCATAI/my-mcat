import { motion } from "framer-motion";
import Image from "next/image";

/* --- Constants ----- */
const KALYPSO_SIZE = {
  width: 300,
  height: 300
};

/* ----- Types ---- */
interface KalypsoGreetingProps {
  className?: string;
  position?: 'left' | 'right';
}

const KalypsoGreeting = ({ className, position = 'right' }: KalypsoGreetingProps) => {
  /* ---- Render Methods ----- */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        bottom: '0',
        [position]: '0',
        transform: 'translate(0, 0)',
        zIndex: 10
      }}
      className={`pointer-events-none ${className}`}
    >
      <div className="relative" style={{ width: KALYPSO_SIZE.width, height: KALYPSO_SIZE.height }}>
        <Image
          src="/kalypso/kalypsostart.gif"
          alt="Kalypso Greeting"
          fill
          className="object-contain"
          priority
        />
      </div>
    </motion.div>
  );
};

export default KalypsoGreeting; 