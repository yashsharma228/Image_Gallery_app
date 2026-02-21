const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com;
  connect-src 'self' https://image-gallery-app-9x2r.onrender.com https://*.firebaseio.com https://identitytoolkit.googleapis.com;
  img-src 'self' data: https://res.cloudinary.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
};

module.exports = {
  ...nextConfig,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
};
