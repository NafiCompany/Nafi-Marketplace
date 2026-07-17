import { ArrowUpRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { useCart } from '../../store/CartContext';
import { Button } from '../ui/Button';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
});

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  return (
    <article className="card product-card">
      <Link className="product-image" to={`/product/${product.slug}`}>
        <img
          src={product.cover_image_url || '/assets/product-placeholder-course.svg'}
          alt={product.name}
          loading="lazy"
        />
      </Link>
      <div className="product-content">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {product.is_best_seller && <span className="badge">Best Seller</span>}
          {product.is_featured && <span className="badge">Featured</span>}
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-desc">{product.short_description}</p>
        <div className="product-footer">
          <div>
            <div className="price">{rupiah.format(product.price)}</div>
            {product.compare_at_price && (
              <div className="compare-price">{rupiah.format(product.compare_at_price)}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="btn btn-secondary btn-icon" to={`/product/${product.slug}`} aria-label="Lihat produk">
              <ArrowUpRight size={18} />
            </Link>
            <Button className="btn-icon" onClick={() => addItem(product)} aria-label="Tambah ke keranjang">
              <ShoppingCart size={18} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
