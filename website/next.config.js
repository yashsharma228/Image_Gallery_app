const ContentSecurityPolicy = `
  default-src 'self';

  script-src 
    'self' 
    'unsafe-inline'
    'unsafe-eval'
    https://apis.google.com 
    https://www.gstatic.com 
    https://accounts.google.com
    https://vercel.live;

  connect-src 
    'self' 
    http://localhost:5000
    http://127.0.0.1:5000
    https://image-gallery-app-9x2r.onrender.com
    https://identitytoolkit.googleapis.com
    https://securetoken.googleapis.com
    https://www.googleapis.com
    https://*.firebaseio.com
    https://firestore.googleapis.com
    https://*.firebaseapp.com;

  img-src 
    'self' 
    data: 
    blob:
    https://res.cloudinary.com 
    https://*.cloudinary.com
    https://lh3.googleusercontent.com 
    https://ui-avatars.com 
    https://*.amazonaws.com;

  style-src 
    'self' 
    'unsafe-inline';

  font-src 
    'self' 
    data:;

  frame-src 
    'self'
    https://accounts.google.com
    https://apis.google.com
    https://*.firebaseapp.com;
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
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy.replace(/\n/g, ""),
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",   // 🔥 REQUIRED for Firebase popup
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;