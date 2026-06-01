import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Service } from "@/lib/wizard-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: Service[];
  onChange: (v: Service[]) => void;
}

export function StepServices({ value, onChange }: Props) {
  const add = () =>
    onChange([...value, { id: crypto.randomUUID(), name: "", description: "", benefit: "" }]);

  const update = (id: string, patch: Partial<Service>) =>
    onChange(value.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: string) => onChange(value.filter((s) => s.id !== id));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <AnimatePresence initial={false}>
        {value.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-strong rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                Service #{i + 1}
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(s.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} placeholder="Deep Tissue Massage" />
              </div>
              <div className="space-y-2">
                <Label>Customer Benefit</Label>
                <Input value={s.benefit} onChange={(e) => update(s.id, { benefit: e.target.value })} placeholder="Relieves chronic muscle pain" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={s.description} onChange={(e) => update(s.id, { description: e.target.value })} rows={2} placeholder="What this service includes..." />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {value.length === 0 && (
        <div className="glass rounded-xl p-10 text-center text-muted-foreground">
          No services yet. Add your first service below.
        </div>
      )}

      <Button onClick={add} variant="outline" className="w-full border-dashed py-6">
        <Plus className="h-4 w-4 mr-2" /> Add Service
      </Button>
    </div>
  );
}
