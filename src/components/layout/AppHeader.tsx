import { Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../store/CartContext';
import { Button } from '../ui/Button';

export function AppHeader() {
  const { user, profile, logout } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      <NavLink to="/" onClick={() => setOpen(false)}>Beranda</NavLink>
      <NavLink to="/catalog" onClick={() => setOpen(false)}>Produk</NavLink>
      <NavLink to="/about" onClick={() => setOpen(false)}>Tentang</NavLink>
      {profile?.role === 'admin' && (
        <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>
      )}
    </>
  );

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/">
          <img src="/assets/logo-only.png" alt="NAFI Marketplace" />
          <span className="brand-copy">
            NAFI Marketplace
            <small>AI THAT WORKS FOR YOU</small>
          </span>
        </Link>

        <nav className="nav">{nav}</nav>

        <div className="header-actions">
          <Link className="btn btn-secondary btn-icon" to="/cart" aria-label="Keranjang">
            <ShoppingBag size={19} />
            {itemCount > 0 && <span className="badge">{itemCount}</span>}
          </Link>
          {user ? (
            <>
              <Link className="btn btn-secondary btn-icon" to="/account" aria-label="Akun">
                <UserRound size={19} />
              </Link>
              <Button variant="secondary" onClick={() => void logout()}>Keluar</Button>
            </>
          ) : (
            <Link className="btn btn-primary" to="/login">Masuk</Link>
          )}
          <button
            className="btn btn-secondary btn-icon mobile-menu"
            aria-label="Buka menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container card card-pad" style={{ display: 'grid', gap: 14, marginBottom: 12 }}>
          {nav}
        </nav>
      )}
    </header>
  );
}
