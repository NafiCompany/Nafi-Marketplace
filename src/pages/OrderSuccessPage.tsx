import { CheckCircle2, Copy, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { publicConfig } from '../config/publicConfig';
import { api } from '../services/api';
import type { Order } from '../types';

const rupiah = new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 });

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(new Error('File gagal dibaca.'));
    reader.readAsDataURL(file);
  });
}

export function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if(id) void api.get<Order>(`/api/orders/${id}`).then(setOrder).catch((e:Error)=>setMessage(e.message)); },[id]);
  if (!order && !message) return <div className="auth-page"><Spinner/></div>;
  if (!order) return <div className="auth-page"><div className="alert">{message}</div></div>;

  const upload = async () => {
    if (!file) { setMessage('Pilih foto bukti pembayaran terlebih dahulu.'); return; }
    if (file.size > 5*1024*1024) { setMessage('Ukuran file maksimum 5 MB.'); return; }
    setLoading(true); setMessage('');
    try {
      const image_base64 = await fileToBase64(file);
      const updated = await api.post<Order>(`/api/orders/${order.id}/payment-proof`, { image_base64, mime_type:file.type, note: note || null });
      setOrder(updated); setMessage('Bukti pembayaran berhasil dikirim. Admin akan memverifikasi pesanan Anda.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload gagal.'); }
    finally { setLoading(false); }
  };

  return <section className="section"><div className="container grid grid-2" style={{ alignItems:'start' }}>
    <div className="card card-pad" style={{ textAlign:'center' }}><CheckCircle2 className="gold" size={58} style={{ margin:'0 auto 16px' }}/><div className="eyebrow">Pesanan Dibuat</div><h1 className="h2">{order.order_number}</h1><p className="lead" style={{ marginInline:'auto' }}>Bayar sesuai total berikut lalu unggah bukti pembayaran.</p><div className="price" style={{ fontSize:'2.3rem', margin:'22px 0' }}>{rupiah.format(order.total_amount)}</div><button className="btn btn-secondary" onClick={()=>void navigator.clipboard.writeText(String(order.total_amount))}><Copy size={17}/> Salin nominal</button><div className="qr-box" style={{ marginTop:26 }}><img src={publicConfig.payment.qrImagePath} alt="QR Pembayaran NAFI Marketplace"/></div><p className="muted">Atas nama: {publicConfig.payment.accountName}</p></div>
    <div className="card card-pad form-stack"><h2>Unggah Bukti Pembayaran</h2>{message && <div className={message.includes('berhasil') ? 'alert success-box' : 'alert'}>{message}</div>}<div className="field"><label>Foto bukti transfer</label><input className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e)=>setFile(e.target.files?.[0] || null)}/></div><div className="field"><label>Catatan</label><textarea className="textarea" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Contoh: transfer atas nama Bian"/></div><Button onClick={()=>void upload()} disabled={loading}><Upload size={18}/>{loading?'Mengunggah...':'Kirim Bukti Pembayaran'}</Button><Link className="btn btn-secondary" to="/account/orders">Lihat Riwayat Pesanan</Link></div>
  </div></section>;
}
