const ContentSecurityPolicy = `
  default-src 'self';

  script-src 
    'self' 
    'unsafe-inline' 
    https://apis.google.com 
    https://www.gstatic.com 
    https://accounts.google.com;

  connect-src 
    'self' 
    https://image-gallery-app-9x2r.onrender.com
    https://identitytoolkit.googleapis.com
    https://securetoken.googleapis.com
    https://www.googleapis.com
    https://*.firebaseio.com
    https://firestore.googleapis.com;

  img-src 
    'self' 
    data: 
    https://res.cloudinary.com 
    https://lh3.googleusercontent.com;

  style-src 
    'self' 
    'unsafe-inline';

  font-src 
    'self' 
    data:;

  frame-src 
    https://accounts.google.com;
`;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = {
  ...nextConfig,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
};