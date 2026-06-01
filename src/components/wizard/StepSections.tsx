import { motion } from "motion/react";
import { SECTION_OPTIONS } from "@/lib/wizard-types";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
}

const DESCRIPTIONS: Record<string, string> = {
  "Homepage Hero": "Headline, subheadline & primary CTAs",
  "About Us": "Story, mission & trust signals",
  "Services": "Full service descriptions",
  "Why Choose Us": "5–7 persuasive benefits",
  "Testimonials": "3 realistic customer quotes",
  "FAQs": "5 common customer questions",
  "Contact": "Conversion-focused contact copy",
  "CTA Section": "Final strong call-to-action",
  "SEO Content": "Meta title, description & keywords",
};

export function StepSections({ value, onChange }: Props) {
  const toggle = (s: string) =>
    onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {SECTION_OPTIONS.map((s, i) => {
        const on = value.includes(s);
        return (
          <motion.button
            key={s}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => toggle(s)}
            className={cn(
              "flex items-start justify-between gap-3 rounded-xl p-4 text-left transition-all glass",
              on && "border-primary/70 shadow-glow bg-primary/5",
            )}
          >
            <div>
              <p className="font-semibold">{s}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{DESCRIPTIONS[s]}</p>
            </div>
            <Switch checked={on} onCheckedChange={() => toggle(s)} className="pointer-events-none" />
          </motion.button>
        );
      })}
    </div>
  );
}
