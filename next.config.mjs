/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals.push({
      'sharp': 'commonjs sharp',
      'canvas': 'commonjs canvas',
    });

    // Add support for 3D model files
    config.module.rules.push({
      test: /\.(gltf|glb)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/images',
          outputPath: 'static/images/',
        },
      },
    });

    // Add support for font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/fonts',
          outputPath: 'static/fonts/',
        },
      },
    });

    return config;
  },
  // Enable build caching
  experimental: {
    turbotrace: {
      logLevel: 'error',
    },
  },
};

export default nextConfig;