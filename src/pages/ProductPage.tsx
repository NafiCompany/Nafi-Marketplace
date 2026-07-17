import { Check, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { useCart } from '../store/CartContext';
import type { Product } from '../types';

const rupiah = new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 });

export function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    void api.get<Product>(`/api/catalog/products/${slug}`, false).then(setProduct).catch((err: Error)=>setError(err.message));
  }, [slug]);

  if (error) return <div className="auth-page"><div className="alert">{error}</div></div>;
  if (!product) return <div className="auth-page"><Spinner/></div>;

  return <section className="section"><div className="container product-detail">
    <div className="product-detail-image"><img src={product.cover_image_url || '/assets/product-placeholder-course.svg'} alt={product.name}/></div>
    <div className="product-detail-copy">
      <div className="eyebrow">Premium Digital Product</div>
      <h1 className="h2" style={{ marginTop:10 }}>{product.name}</h1>
      <div className="product-meta">{product.tags.map((tag)=><span className="badge" key={tag}>{tag}</span>)}</div>
      <p className="lead">{product.short_description}</p>
      <div style={{ display:'flex', alignItems:'baseline', gap:12, margin:'24px 0' }}><div className="price" style={{ fontSize:'2rem' }}>{rupiah.format(product.price)}</div>{product.compare_at_price && <div className="compare-price">{rupiah.format(product.compare_at_price)}</div>}</div>
      <Button onClick={()=>addItem(product)}><ShoppingCart size={19}/> Tambah ke Keranjang</Button>
      <div className="card card-pad" style={{ marginTop:24 }}><h3>Yang Anda Dapatkan</h3>{['Akses produk digital setelah verifikasi pembayaran','Panduan penggunaan yang jelas','Dukungan melalui NAFI Assistant','Riwayat pesanan dan akses download di akun'].map((item)=><div key={item} style={{ display:'flex', gap:10, margin:'12px 0', color:'#c7c2b8' }}><Check className="gold" size={18}/>{item}</div>)}</div>
      <div style={{ marginTop:24, color:'#c7c2b8', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{product.description}</div>
    </div>
  </div></section>;
}
