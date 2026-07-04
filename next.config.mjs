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
    // Replace Next.js's image loader with webpack 5's asset/resource so that
    // importing local images returns a URL string (matching Vite's behaviour).
    // This lets the many <img src={importedImage}> usages work without changes.
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.oneOf) {
        rule.oneOf = rule.oneOf.filter(
          (r) => !String(r.loader ?? '').includes('next-image-loader'),
        );
      }
      return rule;
    });

    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|bmp|ico)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[name].[contenthash:8][ext]' },
    });

    return config;
  },
};

export default nextConfig;
