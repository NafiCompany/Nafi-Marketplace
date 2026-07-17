import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { publicConfig } from '../config/publicConfig';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useCart } from '../store/CartContext';
import type { Order } from '../types';

const rupiah = new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 });

export function CheckoutPage() {
  const { user, profile } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.full_name || user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!items.length) return;
    setLoading(true); setError('');
    try {
      const order = await api.post<Order>('/api/orders', {
        customer_name: name,
        customer_email: email,
        customer_phone: phone || null,
        payment_note: note || null,
        items: items.map(({product, quantity})=>({ product_id: product.id, quantity })),
      });
      clear();
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout gagal.');
    } finally { setLoading(false); }
  };

  return <section className="section"><div className="container checkout-grid">
    <form className="card card-pad form-stack" onSubmit={submit}>
      <div><div className="eyebrow">Secure Checkout</div><h1 className="h2">Selesaikan Pesanan</h1></div>
      {error && <div className="alert">{error}</div>}
      <div className="form-row"><div className="field"><label>Nama lengkap</label><input className="input" value={name} onChange={(e)=>setName(e.target.value)} required/></div><div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/></div></div>
      <div className="field"><label>Nomor WhatsApp (opsional)</label><input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="08xxxxxxxxxx"/></div>
      <div className="field"><label>Catatan pembayaran (opsional)</label><textarea className="textarea" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Tulis catatan untuk admin..."/></div>
      <div className="card card-pad" style={{ background:'#0d0f13' }}><strong>Metode pembayaran: QR</strong><p className="muted">{publicConfig.payment.instructions}</p></div>
      <Button type="submit" disabled={loading || !items.length}>{loading ? 'Membuat pesanan...' : 'Buat Pesanan & Tampilkan QR'}</Button>
    </form>
    <aside className="card card-pad order-summary"><h2>Pesanan Anda</h2>{items.map(({product, quantity})=><div key={product.id} style={{ display:'flex', justifyContent:'space-between', gap:12, margin:'16px 0' }}><span>{product.name} × {quantity}</span><strong>{rupiah.format(product.price*quantity)}</strong></div>)}<hr style={{ borderColor:'rgba(255,255,255,.08)' }}/><div style={{ display:'flex', justifyContent:'space-between', fontSize:'1.2rem' }}><strong>Total</strong><strong className="gold">{rupiah.format(subtotal)}</strong></div></aside>
  </div></section>;
}
