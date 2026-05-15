import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const CLONED_SITE_ROOT = path.join(process.cwd(), 'site');

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
};

function normalizeSegments(segments: string[] = []) {
  return segments.filter(segment => segment && segment !== '..' && !segment.includes(path.sep));
}

function buildCandidates(segments: string[]) {
  const relativePath = segments.join('/');
  const basePath = path.join(CLONED_SITE_ROOT, relativePath);

  if (!relativePath) return [
    path.join(CLONED_SITE_ROOT, 'index.html'),
    path.join(CLONED_SITE_ROOT, 'index.htm')
  ];
  if (path.extname(relativePath)) return [basePath, path.join(basePath, 'index.html'), path.join(basePath, 'index.htm')];

  return [
    path.join(basePath, 'index.html'),
    path.join(basePath, 'index.htm'),
    `${basePath}.html`,
    `${basePath}.htm`,
    basePath
  ];
}

function injectNewsEndpoint(html: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || '';
  const endpoint = `${origin}/api/public/site-news`;
  const configScript = `<script>window.AAMIHE_NEWS_API=${JSON.stringify(endpoint)};</script>`;

  if (html.includes('window.AAMIHE_NEWS_API')) return html;
  return html.replace('</head>', `${configScript}\n</head>`);
}

function injectRobotoSlab(html: string) {
  const fontLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
<style>* { font-family: "Roboto Slab", serif !important; }</style>`;

  if (html.includes('Roboto+Slab')) return html;
  return html.replace('</head>', `${fontLink}\n</head>`);
}


async function readFirstExisting(candidates: string[]) {
  for (const candidate of candidates) {
    if (!candidate.startsWith(CLONED_SITE_ROOT)) continue;
    try {
      return {
        filePath: candidate,
        body: await readFile(candidate),
      };
    } catch {
      // Try the next possible static path.
    }
  }

  return null;
}

export async function GET(_request: Request, context: { params: Promise<{ path?: string[] }> }) {
  console.log('--- GET Request Start ---');
  const params = await context.params;
  console.log('Params resolved:', params);
  const segments = normalizeSegments(params.path);
  console.log('Segments normalized:', segments);
  const result = await readFirstExisting(buildCandidates(segments));
  console.log('Result found:', result ? result.filePath : 'null');

  if (!result) {
    return new NextResponse('Página não encontrada.', { status: 404 });
  }

  const extension = path.extname(result.filePath) || '.html';
  const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';
  const isHtml = extension === '.html' || extension === '.htm';
  const body = isHtml ? injectRobotoSlab(injectNewsEndpoint(result.body.toString('utf8'))) : result.body;

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': isHtml ? 'no-store' : 'public, max-age=31536000, immutable',
    },
  });
}
