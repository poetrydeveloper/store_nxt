// src/app/api/placeholder/route.ts

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const width = parseInt(searchParams.get('w') || '200');
  const height = parseInt(searchParams.get('h') || '200');
  const text = searchParams.get('text') || 'No Image';
  
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#e5e7eb"/>
    <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
      ${text}
    </text>
    <text x="50%" y="70%" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
      ${width}×${height}
    </text>
  </svg>`;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}