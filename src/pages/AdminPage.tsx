import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import type { Order, Product } from '../types';

const rupiah=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});

export function AdminPage(){
 const[tab,setTab]=useState<'orders'|'products'>('orders');const[orders,setOrders]=useState<Order[]|null>(null);const[products,setProducts]=useState<Product[]|null>(null);const[message,setMessage]=useState('');
 const load=()=>{void Promise.all([api.get<Order[]>('/api/admin/orders'),api.get<Product[]>('/api/admin/products')]).then(([o,p])=>{setOrders(o);setProducts(p);}).catch((e:Error)=>setMessage(e.message));};useEffect(load,[]);
 const updateOrder=async(id:string,status:string,payment_status:string)=>{await api.patch(`/api/admin/orders/${id}`,{status,payment_status});setMessage('Status pesanan diperbarui.');load();};
 if(!orders||!products)return <div className="auth-page"><Spinner/></div>;
 return <section className="section"><div className="container"><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:18,flexWrap:'wrap',marginBottom:24}}><div><div className="eyebrow">Admin Console</div><h1 className="h2">NAFI Marketplace</h1></div><div style={{display:'flex',gap:8}}><Button variant={tab==='orders'?'primary':'secondary'} onClick={()=>setTab('orders')}>Pesanan</Button><Button variant={tab==='products'?'primary':'secondary'} onClick={()=>setTab('products')}>Produk</Button></div></div>{message&&<div className="alert success-box" style={{marginBottom:18}}>{message}</div>}{tab==='orders'?<div className="card card-pad table-wrap"><table><thead><tr><th>Pesanan</th><th>Pelanggan</th><th>Total</th><th>Pembayaran</th><th>Aksi</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td>{order.order_number}<br/><small>{new Date(order.created_at).toLocaleDateString('id-ID')}</small></td><td>{order.customer_name}<br/><small>{order.customer_email}</small></td><td>{rupiah.format(order.total_amount)}</td><td>{order.payment_status}</td><td style={{display:'flex',gap:8}}><Button variant="secondary" onClick={()=>void updateOrder(order.id,'payment_review','review')}>Review</Button><Button onClick={()=>void updateOrder(order.id,'paid','paid')}>Setujui</Button><Button variant="danger" onClick={()=>void updateOrder(order.id,'cancelled','rejected')}>Tolak</Button></td></tr>)}</tbody></table></div>:<div className="grid grid-3">{products.map(product=><div className="card card-pad" key={product.id}><img src={product.cover_image_url||'/assets/product-placeholder-course.svg'} alt="" style={{borderRadius:14,aspectRatio:'16/10',objectFit:'cover'}}/><h3>{product.name}</h3><p className="muted">{product.status}</p><strong className="gold">{rupiah.format(product.price)}</strong></div>)}</div>}</div></section>
}
