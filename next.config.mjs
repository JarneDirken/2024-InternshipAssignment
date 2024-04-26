// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['firebasestorage.googleapis.com'],
        // remotePatterns: [
        //     {
        //         protocol: 'https',
        //         hostname: 'firebasestorage.googleapis.com',
        //         pathname: '**'
        //     }
        // ],
    },
};

export default nextConfig;