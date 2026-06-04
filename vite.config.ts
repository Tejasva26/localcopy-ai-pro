// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Pick deploy target via DEPLOY_TARGET env var.
// - unset / "cloudflare" -> Lovable preview + Cloudflare Workers (default)
// - "vercel"             -> Vercel
// - "netlify"            -> Netlify
// - "node"               -> Render / Railway / any Node host
const target = process.env.DEPLOY_TARGET ?? "cloudflare";

const presetMap: Record<string, string> = {
  cloudflare: "cloudflare_module",
  vercel: "vercel",
  netlify: "netlify",
  node: "node-server",
};

const preset = presetMap[target] ?? "cloudflare_module";
const isCloudflare = preset === "cloudflare_module";

export default defineConfig({
  tanstackStart: isCloudflare
    ? {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // The wrapper is Cloudflare-specific, so only use it on Workers builds.
        server: { entry: "server" },
      }
    : {},
  nitro: { preset },
});
