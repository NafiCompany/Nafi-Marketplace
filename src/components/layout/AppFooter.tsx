import { Link } from 'react-router-dom';
import { publicConfig } from '../../config/publicConfig';

export function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>{publicConfig.marketplace.companyName}</strong>
          <div>{publicConfig.marketplace.tagline}</div>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/catalog">Katalog</Link>
          <Link to="/terms">Syarat</Link>
          <Link to="/privacy">Privasi</Link>
          <a href={`mailto:${publicConfig.marketplace.supportEmail}`}>Bantuan</a>
        </div>
        <small>© {new Date().getFullYear()} NAFI.COMPANY</small>
      </div>
    </footer>
  );
}
