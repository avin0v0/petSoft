/** @type {import('next').NextConfig} */
const devOrigins = ["localhost:3000", "127.0.0.1:3000", "*.devtunnels.ms"];

const nextConfig = {
    images:{
        remotePatterns:[
            {
            protocol: "https",
            hostname: "bytegrad.com"
            },
            {
            protocol: "https",
            hostname: "images.unsplash.com"
            },
        ],
    },
    ...(process.env.NODE_ENV !== "production"
        ? {
              allowedDevOrigins: devOrigins,
              experimental: {
                  serverActions: {
                      allowedOrigins: devOrigins,
                  },
              },
          }
        : {}),
};

export default nextConfig;
