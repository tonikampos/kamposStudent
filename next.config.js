/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  eslint: {
    // Desactivar ESLint durante la construcción para evitar problemas en Netlify
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
