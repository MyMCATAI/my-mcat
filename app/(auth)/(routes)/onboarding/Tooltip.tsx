import { motion } from 'framer-motion';

interface TooltipProps {
  message: string;
  topPosition: number;
  className?: string;
}

export const Tooltip = ({ message, topPosition, className = '' }: TooltipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`bg-[#001226] border border-[#5F7E92] p-4 rounded-lg shadow-lg ${className}`}
      style={{ top: topPosition }}
    >
      <p className="text-white text-sm">{message}</p>
    </motion.div>
  );
};