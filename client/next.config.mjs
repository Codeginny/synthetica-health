/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Permite builds/E2E en paralelo al `next dev` sin pisar la carpeta .next.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
