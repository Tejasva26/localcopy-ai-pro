import { Plus, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import type { USP } from "@/lib/wizard-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "Family-owned & operated", "Award-winning service", "10+ years experience",
  "100% satisfaction guarantee", "Free consultation", "Certified specialists",
  "Same-day appointments", "Locally trusted", "Premium products only",
];

interface Props {
  value: USP[];
  onChange: (v: USP[]) => void;
}

export function StepUSPs({ value, onChange }: Props) {
  const [text, setText] = useState("");

  const add = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed) return;
    onChange([...value, { id: crypto.randomUUID(), text: trimmed }]);
    setText("");
  };

  const remove = (id: string) => onChange(value.filter((u) => u.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(text); } }}
          placeholder="e.g., 15+ years of award-winning experience..."
        />
        <Button onClick={() => add(text)} className="bg-gradient-brand text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="glass rounded-xl p-4 min-h-[120px]">
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No USPs yet. Add them above or pick a suggestion.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {value.map((u) => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand/10 border border-primary/30 px-3 py-1.5 text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>{u.text}</span>
                  <button onClick={() => remove(u.id)} className="opacity-60 hover:opacity-100 hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quick suggestions</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !value.some((u) => u.text === s)).map((s) => (
            <button
              key={s}
              onClick={() => add(s)}
              className="rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
