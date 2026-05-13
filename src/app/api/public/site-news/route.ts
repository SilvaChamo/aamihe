import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { localizeNewsItem, type SiteNewsLanguage, type SiteNewsRecord } from '@/lib/site-news';

const DB_PATH = path.join(process.cwd(), 'aamihe_dashboard.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteSlug = searchParams.get('site_slug') || 'aamihe';
    const language = (searchParams.get('lang') || 'pt') as SiteNewsLanguage;
    const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10) || 6, 24);

    let news = [];
    try {
      const data = await readFile(DB_PATH, 'utf8');
      const db = JSON.parse(data);
      news = db.news || [];
    } catch (e) {
      // Se o arquivo não existir ou estiver corrompido, retorna vazio
      news = [];
    }
    
    // Filtrar por site_slug e publicado
    news = news.filter((item: any) => item.site_slug === siteSlug && item.published);
    
    // Ordenar por published_at decrescente
    news.sort((a: any, b: any) => {
      const dateA = new Date(a.published_at || 0).getTime();
      const dateB = new Date(b.published_at || 0).getTime();
      return dateB - dateA;
    });
    
    // Limitar
    news = news.slice(0, limit);

    const localizedNews = (news as SiteNewsRecord[]).map(item => localizeNewsItem(item, language));
    return NextResponse.json({ success: true, news: localizedNews }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders },
    );
  }
}
