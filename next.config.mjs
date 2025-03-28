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
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, // 动态读取环境变量
    },
    experimental: {
      serverComponentsExternalPackages: ['sequelize', 'mysql2']
    }
  };
  
  export default nextConfig;