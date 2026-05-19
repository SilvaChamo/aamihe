import Link from 'next/link';
import Image from 'next/image';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container top-bar-container">
          <div className="contact-info">
            <span className="contact-item">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>
              Rua da Sé nº 114, Pestana Rovuma Hotel
            </span>
            <span className="contact-item">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z"></path></svg>
               +25821310045
            </span>
            <span className="contact-item">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path></svg>
              geral@aamihe.com
            </span>
          </div>
          <div className="top-bar-right">
            <div className="languages">
              <span className="lang-item active">PT</span>
              <span className="lang-item">FR</span>
              <span className="lang-item">EN</span>
            </div>
            <div className="social">
              <a href="#" aria-label="Facebook">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Nav */}
      <div className="main-nav">
        <div className="container main-nav-container">
          <Link href="/" className="logo">
            <Image src="/logo.webp" alt="AAMIHE Logo" width={150} height={42} priority unoptimized />
          </Link>
          
          <nav className="nav">
            <Link href="/" className="nav-link">INÍCIO</Link>
            <Link href="/sobre-nos" className="nav-link">SOBRE-NÓS</Link>
            <Link href="/servicos" className="nav-link">SERVIÇOS</Link>
            <Link href="/conferencia" className="nav-link">CONFERÊNCIA</Link>
            <Link href="/blog" className="nav-link">BLOG</Link>
            <Link href="/contacte-nos" className="nav-link">CONTACTE-NOS</Link>
          </nav>
          
          <div className="search-icon">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg>
          </div>
        </div>
      </div>
    </header>
  );
}
