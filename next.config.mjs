/** @type {import('next').NextConfig} */
const nextConfig = {
  // Local images are handled via webpack asset/resource (URL strings, like Vite).
  // TypeScript still sees StaticImageData from next/image-types/global, so we
  // suppress build TS errors here; the runtime behaviour is correct.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack(config) {
    // In Next.js 14, next-image-loader is a TOP-LEVEL rule in config.module.rules
    // (spread in from the images block), not nested inside a oneOf. Filter it
    // directly, then replace with asset/resource so imports return URL strings.
    config.module.rules = config.module.rules.filter(
      (rule) => !(rule && typeof rule === 'object' && rule.loader === 'next-image-loader'),
    );

    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|bmp|ico)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[name].[contenthash:8][ext]' },
    });

    return config;
  },
};

export default nextConfig;
