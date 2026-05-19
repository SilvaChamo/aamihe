import { readFile, readdir } from 'node:fs/promises';
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

// ---------------------------------------------------------------------------
// Automatic Image Indexer
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']);

let imageIndex: Map<string, string> | null = null;

async function buildImageIndex(): Promise<Map<string, string>> {
  if (imageIndex) return imageIndex;

  const index = new Map<string, string>();

  async function scan(dir: string, relative: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const entryRelative = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await scan(path.join(dir, entry.name), entryRelative);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) {
          const nameLower = entry.name.toLowerCase();
          index.set(nameLower, entryRelative);

          const stripped = nameLower
            .replace(/-\d+x\d+(?=\.\w)/, '')
            .replace(/-scaled(?=\.\w)/, '')
            .replace(/\.png\.webp$/, '.png')
            .replace(/\.jpg\.webp$/, '.jpg')
            .replace(/\.jpeg\.webp$/, '.jpeg');
          if (stripped !== nameLower) {
            if (!index.has(stripped)) index.set(stripped, entryRelative);
          }
        }
      }
    }
  }

  await scan(CLONED_SITE_ROOT, '');
  imageIndex = index;
  return index;
}

async function resolveImagePath(filename: string): Promise<string> {
  const index = await buildImageIndex();
  const lower = filename.toLowerCase();

  if (index.has(lower)) return `/${index.get(lower)!}`;

  const normalized = lower
    .replace(/\.png\.webp$/, '.png')
    .replace(/\.jpg\.webp$/, '.jpg')
    .replace(/\.jpeg\.webp$/, '.jpeg');
  if (normalized !== lower && index.has(normalized)) return `/${index.get(normalized)!}`;

  const baseName = lower.replace(/\.[^.]+$/, '');
  for (const [key, val] of index) {
    const keyBase = key.replace(/-\d+x\d+/, '').replace(/-scaled/, '').replace(/\.[^.]+$/, '').replace(/\.png$/, '');
    if (keyBase === baseName || keyBase === baseName.replace(/\.[^.]+$/, '')) {
      return `/${val}`;
    }
  }

  return `/${filename}`;
}

// ---------------------------------------------------------------------------
// HTML Injectors
// ---------------------------------------------------------------------------

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

async function fixExternalImages(html: string): Promise<string> {
  html = html.replace(/\s*srcset="[^"]*aamihe\.com[^"]*"/g, '');

  const WP_URL_RE = /https:\/\/aamihe\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"')]+)/g;
  const uniqueFilenames = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = WP_URL_RE.exec(html)) !== null) {
    uniqueFilenames.add(m[1]);
  }

  const resolved = new Map<string, string>();
  await Promise.all(
    [...uniqueFilenames].map(async (filename) => {
      resolved.set(filename, await resolveImagePath(filename));
    })
  );

  html = html.replace(
    /https:\/\/aamihe\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"')]+)/g,
    (_match, filename) => resolved.get(filename) ?? `/${filename}`
  );

  return html;
}

// ---------------------------------------------------------------------------
// Static File Serving
// ---------------------------------------------------------------------------

interface SiteFileResult {
  filePath: string;
  body: Uint8Array;
}

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

async function readFirstExisting(candidates: string[]): Promise<SiteFileResult | null> {
  for (const candidate of candidates) {
    if (!candidate.startsWith(CLONED_SITE_ROOT)) continue;
    try {
      const buf = await readFile(candidate);
      return {
        filePath: candidate,
        body: new Uint8Array(buf),
      };
    } catch {
      // Tenta o próximo
    }
  }
  return null;
}

async function fallbackImageSearch(filename: string): Promise<SiteFileResult | null> {
  const targetBase = normalizeBaseName(filename);
  if (!targetBase) return null;

  let dirs;
  try {
    dirs = await readdir(CLONED_SITE_ROOT, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const dirPath = path.join(CLONED_SITE_ROOT, dir.name);
    let files: string[];
    try {
      files = await readdir(dirPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (normalizeBaseName(file) === targetBase) {
        const filePath = path.join(dirPath, file);
        try {
          const buf = await readFile(filePath);
          return {
            filePath,
            body: new Uint8Array(buf),
          };
        } catch {
          continue;
        }
      }
    }
  }
  return null;
}

function normalizeBaseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/-\d+x\d+(?=\.)/g, '')
    .replace(/-scaled(?=\.)/g, '')
    .replace(/\.png\.webp$/, '.png')
    .replace(/\.jpg\.webp$/, '.jpg')
    .replace(/\.jpeg\.webp$/, '.jpeg')
    .replace(/\.[^.]+$/, '');
}

// ---------------------------------------------------------------------------
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(_request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  const segments = normalizeSegments(params.path);
  let result: SiteFileResult | null = await readFirstExisting(buildCandidates(segments));

  if (!result && segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    const ext = path.extname(lastSegment).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      result = await fallbackImageSearch(lastSegment);
    }
  }

  if (!result) {
    return new NextResponse('Página não encontrada.', { status: 404 });
  }

  const extension = path.extname(result.filePath) || '.html';
  const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';
  const isHtml = extension === '.html' || extension === '.htm';

  let body: string | Uint8Array;
  if (isHtml) {
    const html = new TextDecoder('utf-8').decode(result.body);
    body = await fixExternalImages(html);
    body = injectNewsEndpoint(body);
    body = injectRobotoSlab(body);
  } else {
    body = result.body;
  }

  return new NextResponse(body as any, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': isHtml ? 'no-store' : 'public, max-age=31536000, immutable',
    },
  });
}
