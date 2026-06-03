import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
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
  const serviceNames = d.services.map((s) => s.name).filter(Boolean);
  return `You are an expert conversion copywriter for local businesses.
Generate complete, high-converting website copy for the business below.

# BUSINESS
- Name: ${d.business.name}
- Category: ${d.business.category}
- Location: ${d.business.location || "N/A"}
- Years in business: ${d.business.yearsInBusiness || "N/A"}
- Target audience: ${d.business.targetAudience || "general local customers"}
- Description: ${d.business.description || "N/A"}

# SERVICES (use ONLY these — do NOT invent, add, rename, or remove any)
${services || "(none provided)"}

# UNIQUE SELLING PROPOSITIONS (use ONLY these — do NOT invent extras)
${usps || "(none provided)"}

# TONE & STYLE
${d.tones.join(", ") || "Professional, Friendly"}

# REQUIRED SECTIONS
${d.sections.join(", ")}

STRICT INPUT FIDELITY (MUST FOLLOW):
- The output "services" array MUST contain EXACTLY ${d.services.length} item(s), in the SAME ORDER as listed above, with the EXACT same "name" field for each. Only rewrite/expand the "description". If 0 services were provided, return an empty services array.
${serviceNames.length ? `- Allowed service names (exact, in order): ${serviceNames.map((n) => JSON.stringify(n)).join(", ")}` : ""}
- "trustSignals", "whyChooseUs", and About copy must be derived from the USPs and business description above. Do NOT fabricate awards, certifications, customer counts, ratings, or years the user did not provide.
- Testimonials may use realistic first names + roles, but must reference ONLY the services/USPs listed above. Never mention services or features not in the inputs.
- Do NOT mention any service, product, or feature not explicitly listed in SERVICES or USPs.

Other rules:
- Specific, vivid, conversion-focused copy. No generic filler.
- Use the chosen tone consistently.
- Hero headline: under 12 words, emotionally compelling.
- FAQs: real local-customer concerns relevant to the listed services.
- SEO keywords: include local intent (e.g., "near me", city name) and the listed services.
- Quality, SEO, and readability scores must be integers 70–98.

# OUTPUT FORMAT
Return ONLY a single valid JSON object (no markdown, no commentary, no code fences) matching EXACTLY this shape:
{
  "hero": { "headline": string, "subheadline": string, "primaryCta": string, "secondaryCta": string },
  "about": { "overview": string, "mission": string, "trustSignals": string[] (4-6 items) },
  "services": [ { "name": string, "description": string } ] (exactly ${d.services.length}),
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
  services: z.array(z.object({ name: z.string(), description: z.string() })).min(0),
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
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing GEMINI_API_KEY. Get a free key at https://aistudio.google.com/apikey");
    const google = createGoogleGenerativeAI({ apiKey: key });
    const prompt = buildPrompt(data);

    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: OutputSchema,
        prompt,
      });

      // Enforce strict input fidelity: services must match user input exactly.
      const enforcedServices = data.services.length > 0
        ? data.services.map((input, i) => {
            const aiMatch = object.services[i];
            return {
              name: input.name,
              description: aiMatch?.description?.trim()
                || input.description
                || input.benefit
                || `Professional ${input.name.toLowerCase()} tailored to your needs.`,
            };
          })
        : [];

      return { ...object, services: enforcedServices, promptUsed: prompt };
    } catch (e) {
      throw new Error(
        `AI generation failed. ${e instanceof Error ? e.message : ""}`,
      );
    }

  });
