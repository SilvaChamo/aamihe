import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        {/* Column 1 */}
        <div className="footer-col">
          <div className="footer-logo">AAMIHE</div>
          <p className="footer-desc">
            A AAIMES é uma associação de instituições de ensino superior da Igreja Metodista Unida ou relacionadas, unanimemente criada numa conferência das instituições de ensino superior da Igreja Metodista Unida em África, em Setembro de 2014.
          </p>
        </div>
        
        {/* Column 2 */}
        <div className="footer-col">
          <h4 className="footer-title">Links Diretos</h4>
          <ul className="footer-links">
            <li><Link href="/direccao">Direção</Link></li>
            <li><Link href="/galeria">Galeria de fotos</Link></li>
            <li><Link href="/documentos">Documentos</Link></li>
            <li><Link href="/eventos">Eventos</Link></li>
            <li><Link href="/paises-membros">Países Membros</Link></li>
            <li><Link href="/universidades">Universidades filiais</Link></li>
            <li><Link href="/arquivo">Arquivo</Link></li>
          </ul>
        </div>
        
        {/* Column 3 */}
        <div className="footer-col">
          <h4 className="footer-title">Visite-nos</h4>
          <ul className="footer-contact">
            <li><strong>Endereço:</strong> Pestana Rovuma Hotel, Maputo</li>
            <li><strong>Telefone:</strong> +258 84 308 9820</li>
            <li><strong>Email:</strong> geral@aamihe.com</li>
          </ul>
        </div>
        
        {/* Column 4 */}
        <div className="footer-col">
          <h4 className="footer-title">Newsletter</h4>
          <p>Registe-se para receber as nossas news letter</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Seu endereço electrónico" aria-label="Seu endereço electrónico" />
            <button type="submit" className="btn">Ir</button>
          </form>
          <div className="footer-social">
            {/* Social Icons could go here */}
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} AAMIHE. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
