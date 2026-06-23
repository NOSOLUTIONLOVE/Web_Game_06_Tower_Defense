/**
 * ErrorToast - 错误提示（自动消失）
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export function ErrorToast() {
  const lastError = useGameStore((s) => s.lastError);
  return (
    <AnimatePresence>
      {lastError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 backdrop-blur-xl text-sm text-red-300 shadow-lg"
        >
          <AlertCircle className="h-4 w-4" />
          {lastError}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
