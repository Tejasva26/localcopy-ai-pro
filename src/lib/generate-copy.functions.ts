import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const WizardSchema = z.object({
  business: z.object({
    name: z.string().min(1).max(120),
    category: z.string().min(1).max(60),
    description: z.string().max(1500),
    location: z.string().max(120),
    yearsInBusiness: z.string().max(20),
    targetAudience: z.string().max(300),
  }),
  services: z.array(z.object({
    id: z.string(),
    name: z.string().max(120),
    description: z.string().max(600),
    benefit: z.string().max(300),
  })).max(30),
  usps: z.array(z.object({ id: z.string(), text: z.string().max(200) })).max(20),
  tones: z.array(z.string()).max(10),
  sections: z.array(z.string()).max(15),
});

function buildPrompt(d: z.infer<typeof WizardSchema>) {
  const services = d.services.map((s, i) => `${i + 1}. ${s.name} — ${s.description} (Benefit: ${s.benefit})`).join("\n");
  const usps = d.usps.map((u, i) => `${i + 1}. ${u.text}`).join("\n");
  return `You are an expert conversion copywriter for local businesses.
Generate complete, high-converting website copy for the business below.

# BUSINESS
- Name: ${d.business.name}
- Category: ${d.business.category}
- Location: ${d.business.location || "N/A"}
- Years in business: ${d.business.yearsInBusiness || "N/A"}
- Target audience: ${d.business.targetAudience || "general local customers"}
- Description: ${d.business.description || "N/A"}

# SERVICES
${services || "(none provided — infer reasonable defaults from the category)"}

# UNIQUE SELLING PROPOSITIONS
${usps || "(infer credible ones from the business context)"}

# TONE & STYLE
${d.tones.join(", ") || "Professional, Friendly"}

# REQUIRED SECTIONS
${d.sections.join(", ")}

Rules:
- Write specific, vivid, conversion-focused copy. No generic filler.
- Use the chosen tone consistently across all sections.
- Hero headline: under 12 words, emotionally compelling.
- Subheadline: 1–2 sentences clarifying value.
- Generate exactly the requested number of items in each list field.
- For testimonials: use realistic first names + role, no fake brand names.
- For FAQs: address real local-customer concerns.
- SEO keywords: include local intent (e.g., "near me", city name).
- Quality, SEO, and readability scores must be integers 70–98 reflecting honest assessment.
`;
}

const OutputSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    primaryCta: z.string(),
    secondaryCta: z.string(),
  }),
  about: z.object({
    overview: z.string(),
    mission: z.string(),
    trustSignals: z.array(z.string()).min(3).max(6),
  }),
  services: z.array(z.object({ name: z.string(), description: z.string() })).min(1).max(20),
  whyChooseUs: z.array(z.string()).min(5).max(7),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string(),
    quote: z.string(),
  })).length(3),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).length(5),
  contact: z.string(),
  finalCta: z.object({ headline: z.string(), button: z.string() }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()).min(5).max(15),
  }),
  scores: z.object({
    quality: z.number().int().min(0).max(100),
    seo: z.number().int().min(0).max(100),
    readability: z.number().int().min(0).max(100),
  }),
});

export const generateCopy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => WizardSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const prompt = buildPrompt(data);

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({ schema: OutputSchema }),
      prompt,
    });

    return { ...output, promptUsed: prompt };
  });
