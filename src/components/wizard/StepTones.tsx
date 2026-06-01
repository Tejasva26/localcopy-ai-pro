import { motion } from "motion/react";
import { Check } from "lucide-react";
import { TONE_OPTIONS } from "@/lib/wizard-types";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
}

export function StepTones({ value, onChange }: Props) {
  const toggle = (t: string) =>
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Pick one or more tones. Mix to taste — e.g., Friendly + Premium.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {TONE_OPTIONS.map((t) => {
          const selected = value.includes(t);
          return (
            <motion.button
              key={t}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(t)}
              className={cn(
                "relative rounded-xl p-4 text-sm font-medium transition-all glass",
                selected && "border-primary/70 shadow-glow bg-primary/10 text-foreground",
                !selected && "text-muted-foreground hover:text-foreground hover:border-primary/40",
              )}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-gradient-brand flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
              {t}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
