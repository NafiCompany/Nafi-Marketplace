import { Router } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { decodeBase64Image, orderNumber } from '../utils/helpers';

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

const orderSchema = z.object({
  customer_name: z.string().min(2).max(120),
  customer_email: z.string().email(),
  customer_phone: z.string().max(30).nullable().optional(),
  payment_note: z.string().max(500).nullable().optional(),
  items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(10) })).min(1),
});

ordersRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Data checkout belum lengkap.' });
  const ids = parsed.data.items.map((item)=>item.product_id);
  const { data: products, error } = await supabaseAdmin.from('products').select('id,name,price,status').in('id',ids).eq('status','active');
  if (error || !products || products.length !== new Set(ids).size) return res.status(400).json({ message: 'Salah satu produk tidak tersedia.' });
  const productList = products as Array<{ id: string; name: string; price: number | string; status: string }>;
  const productMap = new Map(productList.map((product)=>[product.id,product]));
  const orderItems = parsed.data.items.map((item)=>{
    const product = productMap.get(item.product_id)!;
    return { product_id: product.id, product_name: product.name, unit_price: Number(product.price), quantity:item.quantity, subtotal:Number(product.price)*item.quantity };
  });
  const subtotal = orderItems.reduce((sum,item)=>sum+item.subtotal,0);
  const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
    order_number: orderNumber(), firebase_uid:req.authUser!.uid,
    customer_name:parsed.data.customer_name, customer_email:parsed.data.customer_email,
    customer_phone:parsed.data.customer_phone || null, status:'pending_payment', payment_status:'unpaid',
    subtotal, discount_amount:0, total_amount:subtotal, payment_method:'qr_manual', payment_note:parsed.data.payment_note || null,
  }).select('*').single();
  if (orderError || !order) return res.status(500).json({ message: 'Pesanan gagal dibuat.' });
  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems.map((item)=>({ ...item, order_id:order.id })));
  if (itemsError) {
    await supabaseAdmin.from('orders').delete().eq('id',order.id);
    return res.status(500).json({ message: 'Detail pesanan gagal disimpan.' });
  }
  const { data: complete } = await supabaseAdmin.from('orders').select('*, order_items(*)').eq('id',order.id).single();
  res.status(201).json({ data: complete });
});

ordersRouter.get('/', async (req: AuthenticatedRequest, res) => {
  let query = supabaseAdmin.from('orders').select('*, order_items(*, product:products(*)), payment_submissions(*)').eq('firebase_uid',req.authUser!.uid).order('created_at',{ascending:false});
  if (req.query.downloadable === 'true') query = query.in('status',['paid','completed']);
  const { data, error } = await query;
  if (error) return res.status(500).json({ message: 'Pesanan gagal dimuat.' });
  res.json({ data: data || [] });
});

ordersRouter.get('/:id', async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabaseAdmin.from('orders').select('*, order_items(*, product:products(*)), payment_submissions(*)').eq('id',req.params.id).eq('firebase_uid',req.authUser!.uid).single();
  if (error || !data) return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
  res.json({ data });
});

ordersRouter.post('/:id/payment-proof', async (req: AuthenticatedRequest, res) => {
  const schema = z.object({ image_base64:z.string().min(50), mime_type:z.enum(['image/jpeg','image/png','image/webp']), note:z.string().max(500).nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Bukti pembayaran tidak valid.' });
  const { data: order } = await supabaseAdmin.from('orders').select('id').eq('id',req.params.id).eq('firebase_uid',req.authUser!.uid).single();
  if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
  const buffer = decodeBase64Image(parsed.data.image_base64);
  if (!buffer.length || buffer.length > 5*1024*1024) return res.status(400).json({ message: 'Ukuran bukti pembayaran maksimum 5 MB.' });
  const extension = parsed.data.mime_type === 'image/png' ? 'png' : parsed.data.mime_type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${req.authUser!.uid}/${order.id}/${Date.now()}.${extension}`;
  const { error: uploadError } = await supabaseAdmin.storage.from('payment-proofs').upload(path,buffer,{contentType:parsed.data.mime_type,upsert:false});
  if (uploadError) return res.status(500).json({ message: 'Bukti pembayaran gagal diunggah.' });
  await supabaseAdmin.from('payment_submissions').insert({ order_id:order.id, proof_path:path, note:parsed.data.note || null, status:'submitted' });
  await supabaseAdmin.from('orders').update({ status:'payment_review', payment_status:'review', updated_at:new Date().toISOString() }).eq('id',order.id);
  const { data: updated } = await supabaseAdmin.from('orders').select('*, order_items(*), payment_submissions(*)').eq('id',order.id).single();
  res.json({ data: updated });
});

ordersRouter.get('/:orderId/items/:itemId/download', async (req: AuthenticatedRequest, res) => {
  const { data: item } = await supabaseAdmin.from('order_items').select('id,order_id,product:products(file_path,delivery_url)').eq('id',req.params.itemId).eq('order_id',req.params.orderId).single();
  const { data: order } = await supabaseAdmin.from('orders').select('id,status').eq('id',req.params.orderId).eq('firebase_uid',req.authUser!.uid).in('status',['paid','completed']).single();
  if (!item || !order) return res.status(403).json({ message: 'Produk belum dapat diakses.' });
  const product = item.product as unknown as { file_path:string|null; delivery_url:string|null };
  if (product.file_path) {
    const { data, error } = await supabaseAdmin.storage.from('digital-products').createSignedUrl(product.file_path,600);
    if (!error && data?.signedUrl) return res.redirect(data.signedUrl);
  }
  if (product.delivery_url) return res.redirect(product.delivery_url);
  res.status(404).json({ message: 'File produk belum dikonfigurasi oleh admin.' });
});
