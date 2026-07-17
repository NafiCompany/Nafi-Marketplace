import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { useCart } from '../store/CartContext';

const rupiah = new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 });

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  if (!items.length) return <section className="section"><div className="container"><EmptyState><h2>Keranjang masih kosong</h2><p>Pilih produk digital premium dari katalog.</p><Link className="btn btn-primary" to="/catalog">Buka Katalog</Link></EmptyState></div></section>;

  return <section className="section"><div className="container checkout-grid">
    <div className="card">
      {items.map(({product, quantity})=><div className="cart-row" key={product.id}>
        <img src={product.cover_image_url || '/assets/product-placeholder-course.svg'} alt=""/>
        <div><strong>{product.name}</strong><div className="muted">{rupiah.format(product.price)}</div></div>
        <div className="qty"><button onClick={()=>updateQuantity(product.id, quantity-1)}><Minus size={15}/></button><strong>{quantity}</strong><button onClick={()=>updateQuantity(product.id, quantity+1)}><Plus size={15}/></button></div>
        <button className="btn btn-danger btn-icon" onClick={()=>removeItem(product.id)} aria-label="Hapus"><Trash2 size={17}/></button>
      </div>)}
    </div>
    <aside className="card card-pad order-summary"><h2>Ringkasan</h2><div style={{ display:'flex', justifyContent:'space-between', margin:'22px 0' }}><span>Subtotal</span><strong className="gold">{rupiah.format(subtotal)}</strong></div><Link className="btn btn-primary" style={{ width:'100%' }} to="/checkout">Lanjut Checkout</Link></aside>
  </div></section>;
}
