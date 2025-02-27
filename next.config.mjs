/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          net: false,
          tls: false,
          fs: false,
          mysql2: false
        };
      }
      return config;
    },
    experimental: {
      serverComponentsExternalPackages: ['sequelize', 'mysql2']
    }
  };
  
  export default nextConfig;