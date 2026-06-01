import {
  Scissors, Coffee, Stethoscope, Briefcase, Dumbbell, UtensilsCrossed,
  GraduationCap, Sparkles, Scale, Home, ShoppingBag, Building2, type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { CATEGORIES, type BusinessCategory, type BusinessInfo } from "@/lib/wizard-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ICONS: Record<BusinessCategory, LucideIcon> = {
  Salon: Scissors, Cafe: Coffee, Clinic: Stethoscope, Agency: Briefcase,
  Gym: Dumbbell, Restaurant: UtensilsCrossed, Coaching: GraduationCap,
  Spa: Sparkles, "Law Firm": Scale, "Real Estate": Home, Retail: ShoppingBag, Other: Building2,
};

interface Props {
  value: BusinessInfo;
  onChange: (v: BusinessInfo) => void;
}

export function StepBusiness({ value, onChange }: Props) {
  const set = <K extends keyof BusinessInfo>(k: K, v: BusinessInfo[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base mb-3 block">Business Category</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat];
            const selected = value.category === cat;
            return (
              <motion.button
                key={cat}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => set("category", cat)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-xl p-4 text-sm transition-all",
                  "glass hover:border-primary/50",
                  selected && "border-primary/70 shadow-glow bg-primary/10",
                )}
              >
                <Icon className={cn(
                  "h-6 w-6 transition-colors",
                  selected ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )} />
                <span className="font-medium">{cat}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="biz-name">Business Name *</Label>
          <Input id="biz-name" value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme Salon & Spa" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="biz-loc">Location</Label>
          <Input id="biz-loc" value={value.location} onChange={(e) => set("location", e.target.value)} placeholder="Brooklyn, NY" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="biz-years">Years in Business</Label>
          <Input id="biz-years" value={value.yearsInBusiness} onChange={(e) => set("yearsInBusiness", e.target.value)} placeholder="7" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="biz-audience">Target Audience</Label>
          <Input id="biz-audience" value={value.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} placeholder="Busy professionals 25-45" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="biz-desc">Business Description</Label>
          <Textarea
            id="biz-desc"
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Briefly describe what your business does and what makes it special..."
            rows={4}
            maxLength={1500}
          />
          <p className="text-xs text-muted-foreground text-right">{value.description.length}/1500</p>
        </div>
      </div>
    </div>
  );
}
