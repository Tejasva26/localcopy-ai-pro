import { useState } from "react";
import { motion } from "motion/react";
import { Copy, Download, RefreshCw, FileText, Check, Sparkles, Gauge, Search, BookOpen, Type } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedCopy } from "@/lib/wizard-types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Props {
  copy: GeneratedCopy;
  onRegenerate: () => void;
  regenerating: boolean;
  businessName: string;
}

function ScoreCard({ label, value, icon: Icon, suffix = "/100", accent }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; suffix?: string; accent?: string }) {
  const numeric = typeof value === "number" ? value : null;
  const color = accent ?? (numeric === null ? "text-foreground" : numeric >= 85 ? "text-success" : numeric >= 70 ? "text-accent" : "text-muted-foreground");
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-gradient-brand/15 border border-primary/30 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-xl font-bold", color)}>{value}<span className="text-xs text-muted-foreground font-normal">{suffix}</span></p>
      </div>
    </div>
  );
}

function countWords(c: GeneratedCopy): number {
  const text = [
    c.hero.headline, c.hero.subheadline, c.hero.primaryCta, c.hero.secondaryCta,
    c.about.overview, c.about.mission, ...c.about.trustSignals,
    ...c.services.flatMap((s) => [s.name, s.description]),
    ...c.whyChooseUs,
    ...c.testimonials.flatMap((t) => [t.quote, t.name, t.role]),
    ...c.faqs.flatMap((f) => [f.question, f.answer]),
    c.contact, c.finalCta.headline, c.finalCta.button,
    c.seo.metaTitle, c.seo.metaDescription, ...c.seo.keywords,
  ].join(" ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatAsText(c: GeneratedCopy, name: string): string {
  return `${name.toUpperCase()} — Website Copy

═══ HERO ═══
${c.hero.headline}
${c.hero.subheadline}
CTA: ${c.hero.primaryCta} | ${c.hero.secondaryCta}

═══ ABOUT ═══
${c.about.overview}

Mission: ${c.about.mission}

Trust Signals:
${c.about.trustSignals.map((t) => "• " + t).join("\n")}

═══ SERVICES ═══
${c.services.map((s) => `▸ ${s.name}\n  ${s.description}`).join("\n\n")}

═══ WHY CHOOSE US ═══
${c.whyChooseUs.map((w, i) => `${i + 1}. ${w}`).join("\n")}

═══ TESTIMONIALS ═══
${c.testimonials.map((t) => `"${t.quote}"\n  — ${t.name}, ${t.role}`).join("\n\n")}

═══ FAQs ═══
${c.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

═══ CONTACT ═══
${c.contact}

═══ FINAL CTA ═══
${c.finalCta.headline}
[ ${c.finalCta.button} ]

═══ SEO ═══
Title: ${c.seo.metaTitle}
Description: ${c.seo.metaDescription}
Keywords: ${c.seo.keywords.join(", ")}
`;
}

export function CopyOutput({ copy, onRegenerate, regenerating, businessName }: Props) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(formatAsText(copy, businessName || "Website"));
    setCopiedTab("all");
    toast.success("Copied entire site copy to clipboard");
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const download = (filename: string, content: string, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    download(`${(businessName || "website").toLowerCase().replace(/\s+/g, "-")}-copy.txt`, formatAsText(copy, businessName));
    toast.success("Downloaded .txt");
  };

  const handleExportHtml = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${businessName} Website Copy</title>
<style>body{font-family:system-ui;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222}h1,h2{color:#111}h2{border-bottom:1px solid #ddd;padding-bottom:6px;margin-top:32px}blockquote{border-left:3px solid #aaa;padding-left:12px;color:#555}</style>
</head><body><pre style="white-space:pre-wrap;font-family:inherit">${formatAsText(copy, businessName).replace(/[<>&]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;"})[c]!)}</pre></body></html>`;
    download(`${(businessName || "website").toLowerCase().replace(/\s+/g, "-")}-copy.html`, html, "text/html");
    toast.success("Downloaded .html (open & Print → Save as PDF)");
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ScoreCard label="Content Quality" value={copy.scores.quality} icon={Sparkles} />
        <ScoreCard label="SEO Optimization" value={copy.scores.seo} icon={Search} />
        <ScoreCard label="Readability" value={copy.scores.readability} icon={BookOpen} />
        <ScoreCard label="Word Count" value={countWords(copy)} icon={Type} suffix=" words" accent="text-primary" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Gauge className="h-4 w-4 text-success" />
          Generated copy is ready. Preview each section in the tabs below.
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleCopyAll}>
            {copiedTab === "all" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            Copy All
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadTxt}>
            <FileText className="h-4 w-4 mr-1" /> .txt
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportHtml}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={onRegenerate} disabled={regenerating} className="bg-gradient-brand text-primary-foreground">
            <RefreshCw className={cn("h-4 w-4 mr-1", regenerating && "animate-spin")} />
            Regenerate
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full h-auto bg-card/40 p-1">
          <TabsTrigger value="hero">Homepage</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="testimonials">Reviews</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-xl p-6 mt-4">
          <TabsContent value="hero" className="space-y-6 m-0">
            <div className="text-center py-6 space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-gradient">{copy.hero.headline}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{copy.hero.subheadline}</p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button className="bg-gradient-brand text-primary-foreground">{copy.hero.primaryCta}</Button>
                <Button variant="outline">{copy.hero.secondaryCta}</Button>
              </div>
            </div>
            <div className="border-t border-border/40 pt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Final CTA Section</p>
              <div className="rounded-xl bg-gradient-brand/10 border border-primary/30 p-6 text-center space-y-3">
                <h3 className="text-2xl font-bold">{copy.finalCta.headline}</h3>
                <Button className="bg-gradient-brand text-primary-foreground">{copy.finalCta.button}</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-5 m-0">
            <div>
              <h3 className="text-xl font-semibold mb-2">Overview</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{copy.about.overview}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed italic">"{copy.about.mission}"</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Trust Signals</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {copy.about.trustSignals.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-card/50 p-3">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Why Choose Us</h3>
              <ol className="space-y-2">
                {copy.whyChooseUs.map((w, i) => (
                  <li key={i} className="flex gap-3 rounded-lg bg-card/50 p-3">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    <span className="text-sm leading-relaxed">{w}</span>
                  </li>
                ))}
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-3 m-0">
            {copy.services.map((s, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-card/50 p-4">
                <h4 className="font-semibold text-lg mb-1 text-gradient">{s.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="testimonials" className="grid sm:grid-cols-3 gap-4 m-0">
            {copy.testimonials.map((t, i) => (
              <div key={i} className="rounded-xl glass p-5 space-y-3">
                <div className="text-3xl text-primary leading-none">"</div>
                <p className="text-sm italic leading-relaxed">{t.quote}</p>
                <div className="pt-2 border-t border-border/40">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="faqs" className="space-y-3 m-0">
            {copy.faqs.map((f, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-card/50 p-4">
                <p className="font-semibold mb-1.5">Q. {f.question}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </div>
            ))}
            <div className="rounded-xl bg-card/50 border border-border/60 p-4 mt-4">
              <p className="text-sm font-semibold mb-2">Contact Copy</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{copy.contact}</p>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 m-0">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Meta Title <span className="text-foreground/70">({copy.seo.metaTitle.length} chars)</span></p>
              <p className="rounded-lg bg-card/60 border border-border/60 p-3 font-mono text-sm">{copy.seo.metaTitle}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Meta Description <span className="text-foreground/70">({copy.seo.metaDescription.length} chars)</span></p>
              <p className="rounded-lg bg-card/60 border border-border/60 p-3 font-mono text-sm">{copy.seo.metaDescription}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Local SEO Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {copy.seo.keywords.map((k, i) => (
                  <span key={i} className="rounded-full bg-gradient-brand/10 border border-primary/30 px-2.5 py-1 text-xs font-mono">{k}</span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/40 p-4 mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Google Preview</p>
              <p className="text-blue-400 text-base hover:underline cursor-pointer">{copy.seo.metaTitle}</p>
              <p className="text-success text-xs">{businessName.toLowerCase().replace(/\s+/g, "")}.com</p>
              <p className="text-sm text-muted-foreground mt-1">{copy.seo.metaDescription}</p>
            </div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
