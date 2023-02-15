/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.hypno.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'hypno-web-assets.s3.amazonaws.com',
        port: '',
        pathname: '**'
      },
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    })

    return config
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: process.env.NEXT_PUBLIC_HOME_URL,
          basePath: false,
        }
      ]
    }
  }
}

module.exports = nextConfig
