import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/product/ProductCard';
import { api } from '../services/api';
import type { Category, Product } from '../types';

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    void Promise.all([
      api.get<Product[]>('/api/catalog/products', false),
      api.get<Category[]>('/api/catalog/categories', false),
    ]).then(([productData, categoryData]) => {
      setProducts(productData); setCategories(categoryData);
    }).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    const result = products.filter((product) => {
      const matchesText = `${product.name} ${product.short_description} ${product.tags.join(' ')}`.toLowerCase().includes(normalized);
      const matchesCategory = !category || product.category_id === category;
      return matchesText && matchesCategory;
    });
    return [...result].sort((a,b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [category, products, query, sort]);

  return (
    <section className="section-tight">
      <div className="container">
        <div className="catalog-hero">
          <img src="/assets/catalog-banner.png" alt="AI Productivity Course Digital Product Catalog" />
          <div className="catalog-copy"><div className="eyebrow">Digital Product Catalog</div><h1 className="h2">Koleksi Produk AI Premium</h1><p className="lead">Temukan kursus, prompt, template, workflow, dan aset digital yang membantu produktivitas Anda.</p></div>
        </div>
        <div className="filters">
          <div className="field" style={{ position:'relative' }}><Search size={18} style={{ position:'absolute', left:14, top:15, color:'#9d9588' }}/><input className="input" style={{ paddingLeft:42 }} placeholder="Cari produk..." value={query} onChange={(e)=>setQuery(e.target.value)}/></div>
          <select className="select" value={category} onChange={(e)=>setCategory(e.target.value)}><option value="">Semua kategori</option>{categories.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select className="select" value={sort} onChange={(e)=>setSort(e.target.value)}><option value="newest">Terbaru</option><option value="price-low">Harga terendah</option><option value="price-high">Harga tertinggi</option><option value="name">Nama A–Z</option></select>
        </div>
        <div className="grid grid-3">
          {filtered.map((product)=><ProductCard key={product.id} product={product}/>) }
        </div>
        {!filtered.length && <div className="card empty">Produk tidak ditemukan.</div>}
      </div>
    </section>
  );
}
