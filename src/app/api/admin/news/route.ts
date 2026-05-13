import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createExcerpt, slugifyNewsTitle } from '@/lib/site-news';

const DB_PATH = path.join(process.cwd(), 'aamihe_dashboard.json');

async function getDb() {
  try {
    const data = await readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { news: [], settings: {} };
  }
}

async function saveDb(data: any) {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function requireAdmin(request: Request) {
  const adminSecret = process.env.AAMIHE_ADMIN_SECRET || '';
  const header = request.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();

  if (!adminSecret) {
    return NextResponse.json(
      { success: false, error: 'AAMIHE_ADMIN_SECRET não configurado.' },
      { status: 500 },
    );
  }

  if (token !== adminSecret) {
    return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 401 });
  }

  return null;
}

// Removido getSupabaseAdmin pois usamos arquivo local

async function translateNews(title: string, content: string) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      title_en: title,
      content_en: content,
      title_fr: title,
      content_fr: content,
    };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Traduza esta notícia institucional para Inglês e Francês, mantendo tom profissional e jornalístico. Responda apenas JSON com title_en, content_en, title_fr, content_fr.\n\nTítulo PT: ${title}\n\nConteúdo PT: ${content}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const db = await getDb();
    return NextResponse.json({ success: true, news: db.news || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const titlePt = String(body.title_pt || '').trim();
    const contentPt = String(body.content_pt || '').trim();

    if (!titlePt || !contentPt) {
      return NextResponse.json(
        { success: false, error: 'Título e conteúdo em Português são obrigatórios.' },
        { status: 400 },
      );
    }

    const translations =
      body.auto_translate === false
        ? {
            title_en: body.title_en || titlePt,
            content_en: body.content_en || contentPt,
            title_fr: body.title_fr || titlePt,
            content_fr: body.content_fr || contentPt,
          }
        : await translateNews(titlePt, contentPt);

    const published = body.published !== false;
    const payload: any = {
      site_slug: body.site_slug || 'aamihe',
      slug: body.slug || slugifyNewsTitle(titlePt),
      title_pt: titlePt,
      content_pt: contentPt,
      title_en: translations.title_en || titlePt,
      content_en: translations.content_en || contentPt,
      title_fr: translations.title_fr || titlePt,
      content_fr: translations.content_fr || contentPt,
      excerpt_pt: body.excerpt_pt || createExcerpt(contentPt),
      excerpt_en: body.excerpt_en || createExcerpt(translations.content_en || contentPt),
      excerpt_fr: body.excerpt_fr || createExcerpt(translations.content_fr || contentPt),
      image_url: body.image_url || null,
      gallery_urls: Array.isArray(body.gallery_urls) ? body.gallery_urls : [],
      published,
      published_at: published ? body.published_at || new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (!body.id) {
      payload.id = `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      payload.created_at = new Date().toISOString();
    }

    const db = await getDb();
    
    if (body.id) {
      // Update
      const index = db.news.findIndex((item: any) => item.id === body.id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: 'Notícia não encontrada.' }, { status: 404 });
      }
      db.news[index] = { ...db.news[index], ...payload };
    } else {
      // Insert
      db.news.unshift(payload);
    }

    await saveDb(db);

    return NextResponse.json({ success: true, news: payload });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID obrigatório.' }, { status: 400 });
    }

    const db = await getDb();
    const initialLength = db.news.length;
    db.news = db.news.filter((item: any) => item.id !== id);

    if (db.news.length === initialLength) {
      return NextResponse.json({ success: false, error: 'Notícia não encontrada.' }, { status: 404 });
    }

    await saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
