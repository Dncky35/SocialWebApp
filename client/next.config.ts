/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if(!process.env.BACKEND_URL){
      console.warn('BACKEND_URL is not defined. No rewrites will be applied.');
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/:path*`,
      },
    ];
  },
}
export default nextConfig;