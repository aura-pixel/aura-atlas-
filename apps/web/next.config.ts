import type { NextConfig } from 'next';
const nextConfig:NextConfig={
 poweredByHeader:false,
 async headers(){return [{source:'/:path*',headers:[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'"+(process.env.NODE_ENV==='development'?" 'unsafe-eval'":"")+"; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' data:; connect-src 'self'"+(process.env.NODE_ENV==='development'?" ws: wss:":"")+"; frame-src 'self' https://www.youtube.com https://player.vimeo.com; media-src 'self' https: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"}
 ]},{source:'/api/backend/materials/file/:path*',headers:[
  {key:'X-Frame-Options',value:'SAMEORIGIN'},
  {key:'Content-Security-Policy',value:"default-src 'none'; frame-ancestors 'self'; object-src 'self'"}
 ]}];},
 images:{remotePatterns:[{protocol:'http',hostname:'localhost',port:'3000',pathname:'/**'}]},
};
export default nextConfig;
