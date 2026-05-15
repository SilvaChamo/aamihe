import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './documentos.css';

export default function DocumentosGerais() {
  return (
    <>
      <Header />
      <main className="main-content">
        {/* Hero Section */}
        <div className="hero">
          <div className="container">
            <h1 className="hero-title">DOCUMENTOS GERAIS</h1>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="container section-container">
          <div className="content-area">
            <div className="docs-grid">
              {/* Doc 1 */}
              <div className="doc-card">
                <div className="doc-icon">
                  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 61.7-21.9-14.3-13.8-24.2-27-33.3-40.8zM323.4 128l-100.4-100.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l100.4-100.4c12.5-12.5 12.5-32.8 0-45.3z"></path></svg>
                </div>
                <h3 className="doc-title">Estatuto Jurídico</h3>
                <a href="#" className="btn">Download – Português</a>
              </div>
              
              {/* Doc 2 */}
              <div className="doc-card">
                <div className="doc-icon">
                  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 61.7-21.9-14.3-13.8-24.2-27-33.3-40.8zM323.4 128l-100.4-100.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l100.4-100.4c12.5-12.5 12.5-32.8 0-45.3z"></path></svg>
                </div>
                <h3 className="doc-title">Legal Status</h3>
                <a href="#" className="btn">Download – Inglês</a>
              </div>
              
              {/* Doc 3 */}
              <div className="doc-card">
                <div className="doc-icon">
                  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 61.7-21.9-14.3-13.8-24.2-27-33.3-40.8zM323.4 128l-100.4-100.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l100.4-100.4c12.5-12.5 12.5-32.8 0-45.3z"></path></svg>
                </div>
                <h3 className="doc-title">Statut Juridique</h3>
                <a href="#" className="btn">Download – Francês</a>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="widget">
              <h4 className="widget-title">PROCURAR</h4>
              <div className="search-box">
                <input type="text" placeholder="Search..." aria-label="Search" />
                <button type="submit" aria-label="Submit Search">🔍</button>
              </div>
            </div>
            
            <div className="widget">
              <h4 className="widget-title">INFORMAÇÕES ACADÉMICAS</h4>
              <ul className="widget-links">
                <li><a href="#">Calendário Académico</a></li>
                <li><a href="#">Regulamentos</a></li>
                <li><a href="#">Formulários</a></li>
              </ul>
            </div>
            
            <div className="widget">
              <h4 className="widget-title">PÁGINA FACEBOOK</h4>
              <div className="fb-placeholder">
                <p>AAMIHE no Facebook</p>
                <a href="https://www.facebook.com/GBHEMLEADHubs" target="_blank" rel="noopener noreferrer" className="btn">Visitar Página</a>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
