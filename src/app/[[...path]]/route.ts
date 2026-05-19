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
// Índice automático de imagens
// Varre toda a pasta /site/ recursivamente e constrói um mapa
// filename (lowercase) → caminho relativo dentro de /site/
// Ex: "angola-1.png" → "Paises membros_files/Angola-1.png"
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']);

// Cache em memória para não reindexar em cada pedido
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
          // Guarda por nome exacto e por nome em minúsculas (para correspondência insensível a maiúsculas)
          index.set(entry.name.toLowerCase(), entryRelative);
          // Também guarda sem extensão duplicada (.png.webp → nome base)
          index.set(entry.name, entryRelative);
        }
      }
    }
  }

  await scan(CLONED_SITE_ROOT, '');
  imageIndex = index;
  return index;
}

/**
 * Dado o nome de um ficheiro extraído de uma URL do WordPress,
 * devolve o caminho relativo correcto dentro de /site/.
 * Tenta primeiro correspondência exacta, depois sem extensão extra (.png.webp → .webp).
 */
async function resolveImagePath(filename: string): Promise<string> {
  const index = await buildImageIndex();

  // Tentativa 1: nome exacto
  if (index.has(filename)) return `/${index.get(filename)!}`;

  // Tentativa 2: correspondência case-insensitive
  const lower = filename.toLowerCase();
  if (index.has(lower)) return `/${index.get(lower)!}`;

  // Tentativa 3: versão .webp do ficheiro (WordPress converte muitas imagens)
  const asWebp = lower.replace(/\.(png|jpg|jpeg)$/, '.png.webp')
                       .replace(/\.png\.webp$/, '.png.webp');
  if (index.has(asWebp)) return `/${index.get(asWebp)!}`;

  // Fallback: serve da raiz (pode resultar em 404 mas não quebra o regex)
  return `/${filename}`;
}

// ---------------------------------------------------------------------------
// Injecções de HTML
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

/**
 * Substitui TODAS as referências a imagens do WordPress
 * (background-image, src, href) pelos caminhos locais correctos,
 * usando o índice automático de ficheiros em /site/.
 */
async function fixExternalImages(html: string): Promise<string> {
  // 1. Remove srcset que apontem para aamihe.com (evita pedidos externos)
  html = html.replace(/\s*srcset="[^"]*aamihe\.com[^"]*"/g, '');

  // 2. Colecta todos os nomes de ficheiro únicos referenciados via WordPress URLs
  const WP_URL_RE = /https:\/\/aamihe\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"')]+)/g;
  const uniqueFilenames = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = WP_URL_RE.exec(html)) !== null) {
    uniqueFilenames.add(m[1]);
  }

  // 3. Resolve todos os caminhos em paralelo
  const resolved = new Map<string, string>();
  await Promise.all(
    [...uniqueFilenames].map(async (filename) => {
      resolved.set(filename, await resolveImagePath(filename));
    })
  );

  // 4. Substituição global: qualquer padrão WordPress → caminho local
  html = html.replace(
    /https:\/\/aamihe\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"')]+)/g,
    (_match, filename) => resolved.get(filename) ?? `/${filename}`
  );

  return html;
}

// ---------------------------------------------------------------------------
// Servir ficheiros estáticos
// ---------------------------------------------------------------------------

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

async function readFirstExisting(candidates: string[]) {
  for (const candidate of candidates) {
    if (!candidate.startsWith(CLONED_SITE_ROOT)) continue;
    try {
      return {
        filePath: candidate,
        body: await readFile(candidate),
      };
    } catch {
      // Tenta o próximo candidato.
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

export async function GET(_request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  const segments = normalizeSegments(params.path);
  const result = await readFirstExisting(buildCandidates(segments));

  if (!result) {
    return new NextResponse('Página não encontrada.', { status: 404 });
  }

  const extension = path.extname(result.filePath) || '.html';
  const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';
  const isHtml = extension === '.html' || extension === '.htm';

  let body: Buffer | string;
  if (isHtml) {
    let html = result.body.toString('utf8');
    html = await fixExternalImages(html);
    html = injectNewsEndpoint(html);
    html = injectRobotoSlab(html);
    body = html;
  } else {
    body = result.body;
  }

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': isHtml ? 'no-store' : 'public, max-age=31536000, immutable',
    },
  });
}
