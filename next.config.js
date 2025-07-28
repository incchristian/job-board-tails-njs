/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude @mapbox/node-pre-gyp from being processed by Webpack
    config.externals = config.externals || [];
    config.externals.push('@mapbox/node-pre-gyp');

    // Add a rule to handle HTML files
    config.module.rules.push({
      test: /\.html$/,
      use: [
        {
          loader: 'html-loader',
        },
      ],
    });

    return config;
  },
  images: {
    domains: [
      "res.cloudinary.com", 
      "openweathermap.org",
      "api.dicebear.com"  // ✅ Add this domain for avatar images
    ],
  },
};

module.exports = nextConfig;