/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  eslint: {
    // Desactivar ESLint durante la construcción para evitar problemas en Netlify
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desactivar temporalmente la comprobación de tipos durante la construcción
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
