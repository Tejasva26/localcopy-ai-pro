import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Business", "Services", "USPs", "Tone & Style", "Sections", "Review", "Generate"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex flex-1 min-w-0 items-center gap-2">
              <div className="flex flex-col items-center gap-2 min-w-0">
                <motion.div
                  initial={false}
                  animate={{
                    scale: active ? 1.1 : 1,
                  }}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors",
                    done && "bg-gradient-brand border-transparent text-primary-foreground shadow-glow",
                    active && "border-primary bg-primary/15 text-primary shadow-glow",
                    !done && !active && "border-border bg-card/40 text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </motion.div>
                <span className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  active ? "text-foreground" : "text-muted-foreground",
                )}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-border relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: done ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-brand"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
