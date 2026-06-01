import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, Sparkles, Loader2, Wand2, RotateCcw, Github, Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { StepIndicator } from "@/components/wizard/StepIndicator";
import { StepBusiness } from "@/components/wizard/StepBusiness";
import { StepServices } from "@/components/wizard/StepServices";
import { StepUSPs } from "@/components/wizard/StepUSPs";
import { StepTones } from "@/components/wizard/StepTones";
import { StepSections } from "@/components/wizard/StepSections";
import { StepReview } from "@/components/wizard/StepReview";
import { CopyOutput } from "@/components/wizard/CopyOutput";
import { PromptEngineeringPanel } from "@/components/wizard/PromptEngineeringPanel";
import { generateCopy } from "@/lib/generate-copy.functions";
import { emptyWizardData, type WizardData, type GeneratedCopy } from "@/lib/wizard-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocalCopy AI — High-Converting Website Copy for Local Businesses" },
      { name: "description", content: "Generate complete, conversion-focused website copy for your local business in minutes with LocalCopy AI." },
      { property: "og:title", content: "LocalCopy AI — Website Copy Generator" },
      { property: "og:description", content: "Hero, About, Services, FAQs, SEO — full website copy generated for local businesses by AI." },
    ],
  }),
  component: Home,
});

const STORAGE_KEY = "localcopy-ai-draft-v1";
const STEP_TITLES = [
  { title: "Tell us about your business", sub: "We'll use this to craft copy that sounds authentically you." },
  { title: "What services do you offer?", sub: "Add each service with a clear customer benefit." },
  { title: "What makes you stand out?", sub: "Your unique selling propositions become persuasive copy." },
  { title: "Pick your brand voice", sub: "Mix tones to match your business personality." },
  { title: "Choose the sections to generate", sub: "Toggle on the pieces of website copy you need." },
  { title: "Final review", sub: "Make sure everything looks right before we generate." },
  { title: "Your website copy", sub: "Polished, on-brand, ready to ship." },
];

function Home() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(emptyWizardData);
  const [copy, setCopy] = useState<GeneratedCopy | null>(null);

  const generate = useServerFn(generateCopy);
  const mutation = useMutation({
    mutationFn: () => generate({ data }) as Promise<GeneratedCopy>,
    onSuccess: (result) => {
      setCopy(result);
      toast.success("Website copy generated", { description: "Scroll down to preview, copy, or export." });
    },
    onError: (e: Error) => {
      const msg = e.message || "Generation failed";
      if (msg.includes("429")) toast.error("Rate limited — please wait a moment and retry.");
      else if (msg.includes("402")) toast.error("AI credits exhausted. Add credits in workspace settings.");
      else toast.error("Generation failed", { description: msg });
    },
  });

  // Auto-save draft
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(id);
  }, [data]);

  const missingReason = useMemo((): string | null => {
    switch (step) {
      case 0: {
        const missing: string[] = [];
        if (data.business.name.trim().length === 0) missing.push("Business Name");
        if (data.business.category === "") missing.push("Business Category");
        return missing.length ? `Please add: ${missing.join(" & ")}` : null;
      }
      case 1:
        return data.services.some((s) => s.name.trim().length === 0)
          ? "Every service needs a name (or delete the empty ones)"
          : null;
      case 3: return data.tones.length === 0 ? "Pick at least one tone" : null;
      case 4: return data.sections.length === 0 ? "Select at least one section to generate" : null;
      default: return null;
    }
  }, [step, data]);
  const canAdvance = missingReason === null;

  const next = () => {
    if (!canAdvance) {
      toast.error(missingReason ?? "Please complete the required fields.");
      return;
    }
    if (step === 5) {
      setStep(6);
      mutation.mutate();
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const resetAll = () => {
    if (!confirm("Clear all your inputs and start over?")) return;
    setData(emptyWizardData());
    setCopy(null);
    setStep(0);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    toast.success("Draft cleared");
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-right" richColors />

      {/* Top nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Wand2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold leading-tight">LocalCopy <span className="text-gradient">AI</span></p>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Website copy that converts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Save className="h-3 w-3" /> Auto-saved
            </div>
            <Button size="sm" variant="ghost" onClick={resetAll}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
              <Button size="sm" variant="outline"><Github className="h-3.5 w-3.5 mr-1" /> Source</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero header — hide when viewing generated copy */}
        {step < 6 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              Powered by Lovable AI · Gemini Flash
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Beautiful website copy for your <span className="text-gradient">local business</span>
            </h1>
            <p className="text-muted-foreground">
              Answer a few questions. Get a complete site — hero, about, services, FAQs, SEO — in seconds.
            </p>
          </motion.div>
        )}

        {/* Step indicator — hide when viewing generated copy */}
        {step < 6 && (
          <div className="glass-strong rounded-2xl p-5 sm:p-6">
            <StepIndicator current={step} />
          </div>
        )}

        {/* Step card — hide shell when viewing generated copy */}
        {step < 6 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-strong rounded-2xl p-5 sm:p-8 space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold">{STEP_TITLES[step].title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{STEP_TITLES[step].sub}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && <StepBusiness value={data.business} onChange={(business) => setData({ ...data, business })} />}
                {step === 1 && <StepServices value={data.services} onChange={(services) => setData({ ...data, services })} />}
                {step === 2 && <StepUSPs value={data.usps} onChange={(usps) => setData({ ...data, usps })} />}
                {step === 3 && <StepTones value={data.tones} onChange={(tones) => setData({ ...data, tones })} />}
                {step === 4 && <StepSections value={data.sections} onChange={(sections) => setData({ ...data, sections })} />}
                {step === 5 && <StepReview data={data} onEdit={setStep} />}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/40">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div className="flex items-center gap-3">
                {missingReason && (
                  <span className="hidden sm:inline text-xs text-amber-400/90">{missingReason}</span>
                )}
                <Button
                  onClick={next}
                  aria-disabled={!canAdvance}
                  className={cn(
                    "bg-gradient-brand text-primary-foreground shadow-glow transition-opacity",
                    !canAdvance && "opacity-60 hover:opacity-80",
                  )}
                >
                  {step === 5 ? (
                    <>Generate Copy <Sparkles className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Continue <ArrowRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="output"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GenerateStep
              loading={mutation.isPending}
              error={mutation.error?.message ?? null}
              copy={copy}
              businessName={data.business.name}
              onRegenerate={() => mutation.mutate()}
              onRetry={() => mutation.mutate()}
            />
          </motion.div>
        )}

        {/* Prompt engineering panel — hide when viewing generated copy */}
        {step >= 5 && step < 6 && <PromptEngineeringPanel data={data} copy={copy} />}

        <footer className="text-center text-xs text-muted-foreground pt-8 pb-4">
          Built with React · TanStack Start · Tailwind · AI SDK · Lovable AI Gateway
        </footer>
      </main>
    </div>
  );
}

function GenerateStep({
  loading, error, copy, businessName, onRegenerate, onRetry,
}: {
  loading: boolean; error: string | null; copy: GeneratedCopy | null;
  businessName: string; onRegenerate: () => void; onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="inline-flex h-16 w-16 rounded-full bg-gradient-brand items-center justify-center shadow-glow">
          <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
        </div>
        <p className="font-semibold text-lg">Generating your website copy…</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Engineering prompt, calling Gemini Flash, validating structured output, and computing quality scores.
        </p>
        <div className="flex justify-center gap-1.5 pt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !copy) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-destructive font-semibold">{error}</p>
        <Button onClick={onRetry} className="bg-gradient-brand text-primary-foreground">Try again</Button>
      </div>
    );
  }

  if (!copy) return null;
  return <CopyOutput copy={copy} onRegenerate={onRegenerate} regenerating={false} businessName={businessName} />;
}
