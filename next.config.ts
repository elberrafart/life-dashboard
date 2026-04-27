import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN hosts (e.g. iPhone hitting the Mac's local IP) to load
  // dev-only resources like /_next/webpack-hmr. Dev-only — has no effect
  // in production builds.
  allowedDevOrigins: ['192.168.0.248'],
  experimental: {
    serverActions: {
      // Vision board uploads ship base64-encoded image data alongside app state.
      // Default 1 MB rejects the autosave call as soon as a couple of images
      // are present, which silently breaks every save. 10 MB is comfortable
      // headroom — the validation in syncProfile still enforces per-image and
      // per-app-state caps server-side.
      bodySizeLimit: '10mb',
    },
    // Tree-shake unused exports from large packages. Next.js emits per-export
    // barrel files at build time, shrinking the client bundle.
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr'],
  },
};

export default nextConfig;
