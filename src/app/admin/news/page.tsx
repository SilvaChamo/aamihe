'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

type NewsItem = {
  id: string;
  title_pt: string;
  content_pt: string;
  image_url?: string;
  gallery_urls?: string[];
  published: boolean;
  created_at: string;
};

type NewsForm = {
  id?: string;
  title_pt: string;
  content_pt: string;
  image_url: string;
  gallery_urls: string;
  published: boolean;
};

const emptyForm: NewsForm = {
  title_pt: '',
  content_pt: '',
  image_url: '',
  gallery_urls: '',
  published: true,
};

export default function NewsAdminPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedSecret = window.sessionStorage.getItem('aamihe_admin_secret') || '';
    if (savedSecret) {
      setAdminSecret(savedSecret);
      void loadNews(savedSecret);
    }
  }, []);

  async function loadNews(secret = adminSecret) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/news?site_slug=aamihe', {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Erro ao carregar notícias.');
      window.sessionStorage.setItem('aamihe_admin_secret', secret);
      setNews(data.news || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar notícias.');
    } finally {
      setLoading(false);
    }
  }

  async function saveNews() {
    if (!form.title_pt.trim() || !form.content_pt.trim()) {
      setError('Preencha o título e o conteúdo.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: form.id,
          site_slug: 'aamihe',
          title_pt: form.title_pt,
          content_pt: form.content_pt,
          image_url: form.image_url,
          gallery_urls: form.gallery_urls
            .split('\n')
            .map(url => url.trim())
            .filter(Boolean),
          published: form.published,
          auto_translate: true,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Erro ao salvar notícia.');

      setMessage('Notícia salva e disponível no site.');
      setForm(emptyForm);
      await loadNews();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar notícia.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteNews(id: string) {
    if (!confirm('Eliminar esta notícia?')) return;

    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/news?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminSecret}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Erro ao eliminar notícia.');
      setMessage('Notícia eliminada.');
      await loadNews();
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar notícia.');
    }
  }

  function editNews(item: NewsItem) {
    setForm({
      id: item.id,
      title_pt: item.title_pt || '',
      content_pt: item.content_pt || '',
      image_url: item.image_url || '',
      gallery_urls: (item.gallery_urls || []).join('\n'),
      published: item.published !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.kicker}>Painel AAMIHE</p>
          <h1 style={styles.title}>Gestão de Notícias</h1>
          <p style={styles.subtitle}>
            Este painel gere conteúdo dinâmico para o site HTML clonado, sem converter o layout original para React.
          </p>
        </div>
        <a href="/" target="_blank" style={styles.linkButton}>
          Abrir site
        </a>
      </section>

      <section style={styles.card}>
        <label style={styles.label}>Senha do administrador</label>
        <div style={styles.row}>
          <input
            type="password"
            value={adminSecret}
            onChange={event => setAdminSecret(event.target.value)}
            placeholder="AAMIHE_ADMIN_SECRET"
            style={styles.input}
          />
          <button onClick={() => void loadNews()} disabled={loading || !adminSecret} style={styles.button}>
            {loading ? 'A carregar...' : 'Entrar'}
          </button>
        </div>
      </section>

      {error && <div style={{ ...styles.notice, ...styles.error }}>{error}</div>}
      {message && <div style={{ ...styles.notice, ...styles.success }}>{message}</div>}

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>{form.id ? 'Editar notícia' : 'Nova notícia'}</h2>
          <label style={styles.label}>Título em Português</label>
          <input
            value={form.title_pt}
            onChange={event => setForm({ ...form, title_pt: event.target.value })}
            style={styles.input}
            placeholder="Título da notícia"
          />

          <label style={styles.label}>Conteúdo em Português</label>
          <textarea
            value={form.content_pt}
            onChange={event => setForm({ ...form, content_pt: event.target.value })}
            style={styles.textarea}
            placeholder="Corpo da notícia"
          />

          <label style={styles.label}>Imagem principal</label>
          <input
            value={form.image_url}
            onChange={event => setForm({ ...form, image_url: event.target.value })}
            style={styles.input}
            placeholder="https://..."
          />

          <label style={styles.label}>Galeria, uma imagem por linha</label>
          <textarea
            value={form.gallery_urls}
            onChange={event => setForm({ ...form, gallery_urls: event.target.value })}
            style={{ ...styles.textarea, minHeight: 110 }}
            placeholder="https://imagem-1.jpg&#10;https://imagem-2.jpg"
          />

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={event => setForm({ ...form, published: event.target.checked })}
            />
            Publicar no site
          </label>

          <div style={styles.actions}>
            {form.id && (
              <button onClick={() => setForm(emptyForm)} style={styles.secondaryButton}>
                Cancelar edição
              </button>
            )}
            <button onClick={() => void saveNews()} disabled={saving || !adminSecret} style={styles.button}>
              {saving ? 'A salvar...' : 'Salvar e publicar'}
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Notícias criadas</h2>
          {!news.length && <p style={styles.empty}>Nenhuma notícia carregada ainda.</p>}

          <div style={styles.newsList}>
            {news.map(item => (
              <article key={item.id} style={styles.newsCard}>
                {item.image_url && <img src={item.image_url} alt="" style={styles.image} />}
                <div>
                  <span style={item.published ? styles.badgeLive : styles.badgeDraft}>
                    {item.published ? 'Publicado' : 'Rascunho'}
                  </span>
                  <h3 style={styles.newsTitle}>{item.title_pt}</h3>
                  <p style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <div style={styles.itemActions}>
                  <button onClick={() => editNews(item)} style={styles.secondaryButton}>
                    Editar
                  </button>
                  <button onClick={() => void deleteNews(item.id)} style={styles.dangerButton}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    color: '#162033',
    padding: '32px',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    alignItems: 'center',
    maxWidth: 1180,
    margin: '0 auto 24px',
  },
  kicker: { margin: 0, color: '#92754c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  title: { margin: '6px 0', fontSize: 42, lineHeight: 1.05 },
  subtitle: { margin: 0, color: '#5f6b7a', maxWidth: 720 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 0.9fr) minmax(320px, 1.1fr)',
    gap: 24,
    maxWidth: 1180,
    margin: '0 auto',
  },
  card: {
    background: '#fff',
    border: '1px solid #e7ebf0',
    borderRadius: 18,
    padding: 24,
    boxShadow: '0 18px 60px rgba(22, 32, 51, 0.08)',
    maxWidth: 1180,
    margin: '0 auto 24px',
  },
  sectionTitle: { margin: '0 0 20px', fontSize: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#5f6b7a', margin: '16px 0 8px' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #d8dee8',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
  },
  textarea: {
    width: '100%',
    minHeight: 190,
    boxSizing: 'border-box',
    border: '1px solid #d8dee8',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    resize: 'vertical',
  },
  row: { display: 'flex', gap: 12 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  button: {
    border: 0,
    borderRadius: 10,
    padding: '12px 18px',
    background: '#92754c',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  secondaryButton: {
    border: '1px solid #d8dee8',
    borderRadius: 10,
    padding: '10px 14px',
    background: '#fff',
    color: '#162033',
    fontWeight: 700,
    cursor: 'pointer',
  },
  dangerButton: {
    border: '1px solid #f3c3c3',
    borderRadius: 10,
    padding: '10px 14px',
    background: '#fff5f5',
    color: '#b42318',
    fontWeight: 700,
    cursor: 'pointer',
  },
  linkButton: {
    borderRadius: 10,
    padding: '12px 18px',
    background: '#162033',
    color: '#fff',
    fontWeight: 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  checkbox: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontWeight: 700 },
  notice: { maxWidth: 1180, margin: '0 auto 18px', padding: 14, borderRadius: 12, fontWeight: 700 },
  error: { background: '#fff5f5', color: '#b42318', border: '1px solid #f3c3c3' },
  success: { background: '#ecfdf3', color: '#027a48', border: '1px solid #abefc6' },
  empty: { color: '#5f6b7a' },
  newsList: { display: 'grid', gap: 14 },
  newsCard: { display: 'grid', gridTemplateColumns: '96px 1fr auto', gap: 16, alignItems: 'center', borderBottom: '1px solid #eef2f6', paddingBottom: 14 },
  image: { width: 96, height: 72, objectFit: 'cover', borderRadius: 12, background: '#eef2f6' },
  newsTitle: { margin: '8px 0 4px', fontSize: 17 },
  date: { margin: 0, color: '#7a8594', fontSize: 12 },
  itemActions: { display: 'flex', gap: 8 },
  badgeLive: { display: 'inline-block', background: '#ecfdf3', color: '#027a48', borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 700 },
  badgeDraft: { display: 'inline-block', background: '#eef2f6', color: '#5f6b7a', borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 700 },
};
