import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const StreakProgress = ({
  current,
  target,
}: {
  current: number;
  target: number;
}) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      />
      {/* Sparkle effect if 100% */}
      {percentage >= 100 && (
        <motion.div
          className="absolute inset-0 bg-white/30"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      )}
    </div>
  );
};
