import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

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
- For testimonials: realistic first names + role, no fake brand names.
- For FAQs: address real local-customer concerns.
- SEO keywords: include local intent (e.g., "near me", city name).
- Quality, SEO, and readability scores must be integers 70–98.

# OUTPUT FORMAT
Return ONLY a single valid JSON object (no markdown, no commentary, no code fences) matching EXACTLY this shape:
{
  "hero": { "headline": string, "subheadline": string, "primaryCta": string, "secondaryCta": string },
  "about": { "overview": string, "mission": string, "trustSignals": string[] (4-6 items) },
  "services": [ { "name": string, "description": string } ] (at least 3),
  "whyChooseUs": string[] (5-7 items),
  "testimonials": [ { "name": string, "role": string, "quote": string } ] (exactly 3),
  "faqs": [ { "question": string, "answer": string } ] (exactly 5),
  "contact": string,
  "finalCta": { "headline": string, "button": string },
  "seo": { "metaTitle": string, "metaDescription": string, "keywords": string[] (8-12 items) },
  "scores": { "quality": number, "seo": number, "readability": number }
}
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
    trustSignals: z.array(z.string()).min(1),
  }),
  services: z.array(z.object({ name: z.string(), description: z.string() })).min(1),
  whyChooseUs: z.array(z.string()).min(1),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string(),
    quote: z.string(),
  })).min(1),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
  contact: z.string(),
  finalCta: z.object({ headline: z.string(), button: z.string() }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()).min(1),
  }),
  scores: z.object({
    quality: z.number().int().min(0).max(100),
    seo: z.number().int().min(0).max(100),
    readability: z.number().int().min(0).max(100),
  }),
});

function extractJson(raw: string): unknown {
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.search(/[{[]/);
  const isArray = start !== -1 && cleaned[start] === "[";
  const end = cleaned.lastIndexOf(isArray ? "]" : "}");
  if (start === -1 || end === -1) throw new Error("No JSON found in model response");
  cleaned = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    return JSON.parse(cleaned);
  }
}

export const generateCopy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => WizardSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const prompt = buildPrompt(data);

    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt,
    });

    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch (e) {
      throw new Error(
        `AI returned malformed JSON. ${e instanceof Error ? e.message : ""}`,
      );
    }

    const result = OutputSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        `AI output failed validation: ${result.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }

    return { ...result.data, promptUsed: prompt };
  });
