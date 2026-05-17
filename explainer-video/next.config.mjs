/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@remotion/bundler': 'commonjs @remotion/bundler',
        '@remotion/renderer': 'commonjs @remotion/renderer',
      });
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@remotion/bundler', '@remotion/renderer'],
  },
};

export default nextConfig;
