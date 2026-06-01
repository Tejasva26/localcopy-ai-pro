import { useState } from "react";
import { ChevronDown, Terminal, FileJson, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { GeneratedCopy, WizardData } from "@/lib/wizard-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  data: WizardData;
  copy: GeneratedCopy | null;
}

export function PromptEngineeringPanel({ data, copy }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"inputs" | "prompt" | "output">("inputs");

  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-card/40 transition"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="font-semibold flex items-center gap-2">
              Prompt Engineering Panel
              <span className="text-[10px] font-medium uppercase tracking-wide rounded-full bg-primary/20 text-primary px-2 py-0.5">Dev</span>
            </p>
            <p className="text-xs text-muted-foreground">Inspect the exact inputs, generated prompt & raw AI output</p>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-border/60"
          >
            <div className="p-4 space-y-3">
              <div className="flex gap-1 p-1 rounded-lg bg-card/40 w-fit">
                {(["inputs", "prompt", "output"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition",
                      tab === t ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t === "inputs" && <FileJson className="h-3 w-3 inline mr-1" />}
                    {t === "prompt" && <Terminal className="h-3 w-3 inline mr-1" />}
                    {t === "output" && <Sparkles className="h-3 w-3 inline mr-1" />}
                    {t === "inputs" ? "User Inputs" : t === "prompt" ? "Generated Prompt" : "AI Output"}
                  </button>
                ))}
              </div>

              <div className="rounded-lg bg-background/60 border border-border/60 max-h-96 overflow-auto">
                {tab === "inputs" && (
                  <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                )}
                {tab === "prompt" && (
                  copy?.promptUsed ? (
                    <pre className="p-4 text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">{copy.promptUsed}</pre>
                  ) : <p className="p-4 text-xs text-muted-foreground">Generate copy to see the engineered prompt.</p>
                )}
                {tab === "output" && (
                  copy ? (
                    <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap">{JSON.stringify({ ...copy, promptUsed: undefined }, null, 2)}</pre>
                  ) : <p className="p-4 text-xs text-muted-foreground">No output yet.</p>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">
                This panel demonstrates the prompt-engineering pipeline: structured user inputs → engineered system prompt → schema-validated JSON output via the Lovable AI Gateway (Gemini Flash, AI SDK <code>Output.object</code>).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
