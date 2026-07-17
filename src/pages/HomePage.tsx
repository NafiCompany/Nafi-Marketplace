import { ArrowRight, BadgeCheck, Bot, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { api } from '../services/api';
import type { Product } from '../types';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    void api.get<Product[]>('/api/catalog/products?featured=true', false).then(setProducts).catch(console.error);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-shell">
            <img className="hero-bg" src="/assets/brand-hero.png" alt="NAFI.COMPANY" />
            <div className="hero-content">
              <div className="eyebrow">Premium AI Digital Products</div>
              <h1 className="h1">AI That<br/><span className="gold">Works For You.</span></h1>
              <p className="lead">
                Kursus produktivitas AI, template, workflow otomasi, prompt pack, dan aset digital premium untuk membantu Anda bekerja lebih cepat dan profesional.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" to="/catalog">Jelajahi Katalog <ArrowRight size={18}/></Link>
                <Link className="btn btn-secondary" to="/about">Tentang NAFI.COMPANY</Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat"><strong>Instant</strong><span>Akses produk setelah pembayaran disetujui</span></div>
                <div className="hero-stat"><strong>Premium</strong><span>Materi terkurasi dan siap digunakan</span></div>
                <div className="hero-stat"><strong>Support</strong><span>Dibantu NAFI Assistant kapan pun</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container grid grid-4">
          {[
            [Sparkles, 'Produk Praktis', 'Dirancang agar langsung bisa diterapkan.'],
            [Download, 'Digital Delivery', 'Akses file dan link produk secara aman.'],
            [Bot, 'NAFI Assistant', 'Tanyakan produk, pembayaran, dan pesanan.'],
            [ShieldCheck, 'Transaksi Terjaga', 'Status pembayaran dan pesanan tercatat.'],
          ].map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof Sparkles;
            return <div className="card card-pad" key={String(title)}><IconComponent className="gold"/><h3>{String(title)}</h3><p className="muted">{String(text)}</p></div>;
          })}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', gap:20, alignItems:'end', marginBottom:28, flexWrap:'wrap' }}>
            <div><div className="eyebrow">Pilihan Utama</div><h2 className="h2">Produk Digital Unggulan</h2></div>
            <Link className="btn btn-secondary" to="/catalog">Lihat semua <ArrowRight size={18}/></Link>
          </div>
          <div className="grid grid-3">
            {products.slice(0, 6).map((product) => <ProductCard key={product.id} product={product}/>) }
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container card card-pad" style={{ padding: 42 }}>
          <div className="grid grid-2" style={{ alignItems:'center' }}>
            <div>
              <div className="eyebrow">Beli Dengan Tenang</div>
              <h2 className="h2">Alur Pembelian yang Jelas</h2>
              <p className="lead">Pilih produk, checkout, bayar melalui QR, unggah bukti, lalu akses produk setelah pembayaran diverifikasi.</p>
            </div>
            <div className="grid">
              {['Pilih produk premium', 'Bayar melalui QR milik NAFI.COMPANY', 'Unggah bukti pembayaran', 'Unduh atau akses produk digital'].map((item, index) => (
                <div key={item} style={{ display:'flex', gap:14, alignItems:'center' }}><span className="badge">{index+1}</span><BadgeCheck className="gold"/><strong>{item}</strong></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
