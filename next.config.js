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
      {
        protocol: 'https',
        hostname: 'admin-web-assets.s3.amazonaws.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'media.hypno.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '**'
      },
    ],
    minimumCacheTTL: 31536000,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })

    config.externals.push({
      'sharp': 'commonjs sharp'
    })

    config.resolve = {
      ...config.resolve,
      fallback: {
        "fs": false,
        "path": false,
        "os": false,
        "child_process": false,
      }
    }

    return config
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: process.env.NEXT_PUBLIC_HOME_URL,
          basePath: false,
        },
        {
          source: '/selects',
          destination: process.env.NEXT_PUBLIC_SELECTS_URL,
          basePath: false,
        },
        {
          source: '/brand',
          destination: process.env.NEXT_PUBLIC_BRAND_URL,
          basePath: false,
        },
        {
          source: '/photobooth',
          destination: process.env.NEXT_PUBLIC_PHOTOBOOTH_URL,
          basePath: false,
        },
        {
          source: '/guide',
          destination: process.env.NEXT_PUBLIC_GUIDE_URL,
          basePath: false,
        },
        {
          source: '/plans',
          destination: process.env.NEXT_PUBLIC_PLANS_URL,
          basePath: false,
        },
        {
          source: '/canon',
          destination: process.env.NEXT_PUBLIC_CANON_URL,
          basePath: false,
        },
        {
          source: '/air',
          destination: process.env.NEXT_PUBLIC_AIR_URL,
          basePath: false,
        },
        {
          source: '/pricing',
          destination: process.env.NEXT_PUBLIC_PRICING_URL,
          basePath: false,
        },
        {
          source: '/eye',
          destination: process.env.NEXT_PUBLIC_EYE_URL,
          basePath: false,
        },
        {
          source: '/miami',
          destination: process.env.NEXT_PUBLIC_MIAMI_URL,
          basePath: false,
        },
        {
          source: '/skims',
          destination: process.env.NEXT_PUBLIC_SKIMS_URL,
          basePath: false,
        },
        {
          source: '/terms-img',
          destination: "https://app-a4a1ff.webflow.io/terms-img",
          basePath: false,
        },
        {
          source: '/specs',
          destination: "https://app-a4a1ff.webflow.io/specs",
          basePath: false,
        },
        {
          source: '/agreement',
          destination: "https://app-a4a1ff.webflow.io/agreement",
          basePath: false,
        },
        {
          source: '/vanities',
          destination: "https://app-a4a1ff.webflow.io/vanities",
          basePath: false,
        },
        {
          source: '/pro',
          destination: "https://app-a4a1ff.webflow.io/pro",
          basePath: false,
        },
        {
          source: '/terms',
          destination: "https://app-a4a1ff.webflow.io/terms",
          basePath: false,
        },
        {
          source: '/privacy',
          destination: "https://app-a4a1ff.webflow.io/privacy",
          basePath: false,
        },
        {
          source: '/ai',
          destination: "https://app-a4a1ff.webflow.io/ai",
          basePath: false,
        },
      ]
    }
  }
}

module.exports = nextConfig
