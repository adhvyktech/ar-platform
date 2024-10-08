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

    // Add support for GLTFLoader
    config.externals.push({
      'three/examples/jsm/loaders/GLTFLoader': 'GLTFLoader',
    });

    return config;
  },
  // Enable build caching
  experimental: {
    turbotrace: {
      logLevel: 'error',
    },
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add image configuration
  images: {
    domains: ['api.qrserver.com'],
  },
  // Transpile the 'three' package
  transpilePackages: ['three'],
};

export default nextConfig;