/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
      config.externals.push({
        'sharp': 'commonjs sharp',
        'canvas': 'commonjs canvas',
      })
      return config
    },
  }
  
  export default nextConfig;