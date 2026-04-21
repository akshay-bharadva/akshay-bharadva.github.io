import { motion, AnimatePresence } from "framer-motion";
import { Star, Crown } from "lucide-react";
import { Habit } from "@/types";
import { format } from "date-fns";

export const PerfectDayBadge = ({ habits }: { habits: Habit[] }) => {
  // 1. Get today as a string "YYYY-MM-DD" to match DB format exactly
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // 2. Filter only active habits
  const activeHabits = habits.filter((h) => h.is_active);
  const totalActive = activeHabits.length;

  if (totalActive === 0) return null;

  // 3. Count how many active habits have a log for "todayStr"
  const completedTodayCount = activeHabits.filter((h) =>
    h.habit_logs?.some((log) => log.completed_date === todayStr),
  ).length;

  // 4. Determine perfection
  const isPerfect = completedTodayCount === totalActive;

  // Optional: Debugging (Uncomment to see why it might hide)
  // console.log({ totalActive, completedTodayCount, todayStr });

  return (
    <AnimatePresence>
      {isPerfect && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-full shadow-sm mx-auto w-fit"
        >
          <Crown className="size-5 fill-yellow-500 stroke-yellow-600" />
          <span className="text-sm font-bold tracking-wide uppercase">
            Perfect Day Achieved
          </span>
          <Star className="size-4 fill-yellow-500 stroke-yellow-600 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
