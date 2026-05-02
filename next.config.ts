/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // Pakai true agar search engine tahu ini pindah permanen
      },
    ]
  },
}

module.exports = nextConfig