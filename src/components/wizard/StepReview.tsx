import { Pencil } from "lucide-react";
import { motion } from "motion/react";
import type { WizardData } from "@/lib/wizard-types";
import { Button } from "@/components/ui/button";

interface Props {
  data: WizardData;
  onEdit: (step: number) => void;
}

function Section({ title, step, onEdit, children }: { title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <Button size="sm" variant="ghost" onClick={() => onEdit(step)}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
      </div>
      {children}
    </motion.div>
  );
}

export function StepReview({ data, onEdit }: Props) {
  const { business, services, usps, tones, sections } = data;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Section title="Business" step={0} onEdit={onEdit}>
        <dl className="text-sm space-y-1.5">
          <div><dt className="text-muted-foreground inline">Name: </dt><dd className="inline font-medium">{business.name || "—"}</dd></div>
          <div><dt className="text-muted-foreground inline">Category: </dt><dd className="inline font-medium">{business.category || "—"}</dd></div>
          <div><dt className="text-muted-foreground inline">Location: </dt><dd className="inline font-medium">{business.location || "—"}</dd></div>
          <div><dt className="text-muted-foreground inline">Years: </dt><dd className="inline font-medium">{business.yearsInBusiness || "—"}</dd></div>
          <div><dt className="text-muted-foreground inline">Audience: </dt><dd className="inline font-medium">{business.targetAudience || "—"}</dd></div>
          {business.description && <p className="pt-2 text-muted-foreground italic">"{business.description}"</p>}
        </dl>
      </Section>

      <Section title={`Services (${services.length})`} step={1} onEdit={onEdit}>
        {services.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : (
          <ul className="space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <span className="font-medium">{s.name || "Untitled"}</span>
                {s.benefit && <span className="text-muted-foreground"> — {s.benefit}</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`USPs (${usps.length})`} step={2} onEdit={onEdit}>
        <div className="flex flex-wrap gap-1.5">
          {usps.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : usps.map((u) => (
            <span key={u.id} className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-xs">{u.text}</span>
          ))}
        </div>
      </Section>

      <Section title={`Tone (${tones.length})`} step={3} onEdit={onEdit}>
        <div className="flex flex-wrap gap-1.5">
          {tones.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : tones.map((t) => (
            <span key={t} className="rounded-full bg-accent/10 border border-accent/30 px-2.5 py-0.5 text-xs">{t}</span>
          ))}
        </div>
      </Section>

      <Section title={`Sections (${sections.length})`} step={4} onEdit={onEdit}>
        <div className="flex flex-wrap gap-1.5">
          {sections.map((s) => (
            <span key={s} className="rounded-full bg-muted/60 border border-border px-2.5 py-0.5 text-xs">{s}</span>
          ))}
        </div>
      </Section>
    </div>
  );
}
