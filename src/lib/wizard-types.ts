export type BusinessCategory =
  | "Salon" | "Cafe" | "Clinic" | "Agency" | "Gym" | "Restaurant"
  | "Coaching" | "Spa" | "Law Firm" | "Real Estate" | "Retail" | "Other";

export interface Service {
  id: string;
  name: string;
  description: string;
  benefit: string;
}

export interface USP {
  id: string;
  text: string;
}

export interface BusinessInfo {
  name: string;
  category: BusinessCategory | "";
  description: string;
  location: string;
  yearsInBusiness: string;
  targetAudience: string;
}

export interface WizardData {
  business: BusinessInfo;
  services: Service[];
  usps: USP[];
  tones: string[];
  sections: string[];
}

export interface GeneratedCopy {
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: {
    overview: string;
    mission: string;
    trustSignals: string[];
  };
  services: Array<{ name: string; description: string }>;
  whyChooseUs: string[];
  testimonials: Array<{ name: string; role: string; quote: string }>;
  faqs: Array<{ question: string; answer: string }>;
  contact: string;
  finalCta: {
    headline: string;
    button: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  scores: {
    quality: number;
    seo: number;
    readability: number;
  };
  promptUsed: string;
}

export const TONE_OPTIONS = [
  "Professional", "Friendly", "Luxury", "Premium", "Modern",
  "Trustworthy", "Conversational", "Bold", "Formal", "Minimalist",
];

export const SECTION_OPTIONS = [
  "Homepage Hero", "About Us", "Services", "Why Choose Us",
  "Testimonials", "FAQs", "Contact", "CTA Section", "SEO Content",
];

export const CATEGORIES: BusinessCategory[] = [
  "Salon", "Cafe", "Clinic", "Agency", "Gym", "Restaurant",
  "Coaching", "Spa", "Law Firm", "Real Estate", "Retail", "Other",
];

export const emptyWizardData = (): WizardData => ({
  business: { name: "", category: "", description: "", location: "", yearsInBusiness: "", targetAudience: "" },
  services: [],
  usps: [],
  tones: [],
  sections: ["Homepage Hero", "About Us", "Services", "Why Choose Us", "Testimonials", "FAQs", "Contact", "CTA Section", "SEO Content"],
});
