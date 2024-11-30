import { TooltipProps } from '@/types';
import { motion } from 'framer-motion';

export const Tooltip = ({ message, topPosition }: TooltipProps) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className="absolute bg-blue-500 text-white px-4 py-3 rounded-lg text-md w-[16rem] whitespace-normal"
    style={{ top: topPosition ?? 0 }}
  >
    {message}
  </motion.div>
);