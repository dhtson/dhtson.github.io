import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  
  // Configure base path if using custom domain (leave empty for username.github.io)
  // basePath: '/your-repo-name', // Uncomment and modify if using project pages
  // Note: Avoid committing personal/local IPs or dev-only origins.
  // If you need to test on mobile, run the dev server bound to your LAN IP
  // and rely on your OS/firewall settings rather than committing IPs here.
  
  // Configure Turbopack root directory to resolve workspace warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
